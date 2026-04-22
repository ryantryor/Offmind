"""
LLM client for OffMind — generates answers from retrieved context.

Talks to any OpenAI-compatible chat endpoint. By default points at a local
Ollama (http://ollama:11434/v1) running a small open model — keeps the whole
stack 100% offline. If OFFMIND_LLM_BASE_URL points elsewhere (vLLM, LM Studio,
llama.cpp server, etc.) that works too.

Streams tokens back as Server-Sent Events so the UI feels alive.
"""

from __future__ import annotations

import json
import os
from typing import Iterator, List, Dict, Any, Optional

import urllib.request
import urllib.error


LLM_BASE_URL = os.environ.get("OFFMIND_LLM_BASE_URL", "http://ollama:11434/v1")
LLM_MODEL = os.environ.get("OFFMIND_LLM_MODEL", "llama3.2:3b")
LLM_API_KEY = os.environ.get("OFFMIND_LLM_API_KEY", "ollama")  # ollama ignores it
LLM_TIMEOUT = int(os.environ.get("OFFMIND_LLM_TIMEOUT", "120"))


SYSTEM_PROMPT_EN = """You are OffMind — a private "time machine" that lets the user
talk with their past self. You are given excerpts the user wrote in the past
(journal entries, notes, chat logs). Each excerpt has a number (1, 2, 3, 4, 5,
6, ...). Answer the user's question by reading those excerpts carefully and
quoting them when useful.

Rules:
- Speak in the SECOND PERSON, as if the past notes are the user's own memories.
  ("On Jan 12 you wrote that you felt…")
- After a claim drawn from excerpt 1, write [1]. After a claim drawn from
  excerpt 2, write [2]. After a claim drawn from excerpt 3, write [3]. And so
  on — always use the real excerpt number as a digit inside square brackets.
- Only cite excerpts that genuinely support the claim you just made.
- If the excerpts don't actually answer the question, say so honestly. Do not
  invent memories or events that aren't present in the excerpts.
- Be warm but concise. 3–5 short paragraphs.
- Reply in the same language as the user's question.

A good answer looks like this:
  "In April you wrote that you couldn't sleep [1]. A few weeks later you went
   for a long run and felt clearer [3], and by summer you were cooking dinner
   for yourself and calling it a small ceremony [5]."
"""


SYSTEM_PROMPT_ZH = """你是 OffMind — 一台私人「时光机」,让用户和过去的自己对话。
下面给你的内容,是用户过去写下的片段(日记、笔记、聊天记录)。每个片段都有编号
(1、2、3、4、5、6……)。请仔细阅读这些片段,然后回答用户的问题。

规则:
- 用第二人称回答,就好像那些过去的笔记是用户自己的记忆。
  (例如「1月12号你写到,那天你感觉……」)
- 某句话如果来自编号 1 的片段,就在句尾写 [1];来自编号 2 就写 [2];来自编号 3
  就写 [3]。始终使用片段的真实编号作为方括号里的数字。
- 只引用真正支持你刚才说的那句话的片段。
- 如果片段里没有答案,如实说,不要编造记忆或事件。
- 温暖但简洁,3-5 个短段落。
- 用用户提问的语言回答。

好的回答应该像这样:
  「4月你写到你睡不着 [1]。几周后你去跑了一个长距离,感觉清醒了一些 [3],到了夏天
   你开始给自己做晚饭,说这是一种小小的仪式 [5]。」
"""


def _detect_lang(text: str) -> str:
    """Crude but reliable: any CJK char → zh, else en."""
    for ch in text:
        if "\u4e00" <= ch <= "\u9fff":
            return "zh"
    return "en"


def build_messages(
    question: str,
    contexts: List[Dict[str, Any]],
    history: Optional[List[Dict[str, str]]] = None,
) -> List[Dict[str, str]]:
    """Build the chat messages with retrieved context inlined.

    `history` is an optional list of prior turns like
    `[{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]`.
    It's woven in BEFORE the current user turn so the model can reference
    earlier answers ("tell me more about that"). Only the CURRENT question
    gets fresh retrieval — the history carries forward as context only.
    """
    lang = _detect_lang(question)
    system = SYSTEM_PROMPT_ZH if lang == "zh" else SYSTEM_PROMPT_EN

    # Inline the retrieved excerpts as numbered citations
    parts = []
    for i, ctx in enumerate(contexts, start=1):
        title = ctx.get("title") or ctx.get("date") or f"note {i}"
        date = ctx.get("date", "")
        body = (ctx.get("body") or ctx.get("snippet") or "").strip()
        # Trim very long bodies — keep prompt budget under control
        if len(body) > 1200:
            body = body[:1200] + " …"
        header = f"Source [{i}] — {title}"
        if date:
            header += f"  ({date})"
        parts.append(f"{header}\n{body}")

    context_block = "\n\n---\n\n".join(parts) if parts else "(no excerpts found)"

    user_msg = (
        f"Question: {question}\n\n"
        f"Excerpts from your past:\n\n{context_block}"
        if lang == "en"
        else f"问题: {question}\n\n你过去写的片段:\n\n{context_block}"
    )

    msgs: List[Dict[str, str]] = [{"role": "system", "content": system}]
    # Weave in prior turns. Clamp content length so a very long chat history
    # doesn't blow past the small-model context window.
    if history:
        for turn in history[-8:]:  # keep last 4 Q+A pairs max
            role = turn.get("role")
            content = (turn.get("content") or "").strip()
            if role not in ("user", "assistant") or not content:
                continue
            if len(content) > 1500:
                content = content[:1500] + " …"
            msgs.append({"role": role, "content": content})
    msgs.append({"role": "user", "content": user_msg})
    return msgs


def stream_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> Iterator[str]:
    """Stream tokens from an OpenAI-compatible /chat/completions endpoint.

    Yields raw text chunks. Caller is responsible for SSE-encoding them.
    """
    url = f"{LLM_BASE_URL.rstrip('/')}/chat/completions"
    body = {
        "model": model or LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "stream": True,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LLM_API_KEY}",
        },
        method="POST",
    )
    # Safety net: Llama 3.2 3B occasionally writes the literal placeholder
    # [n] / [N] / [placeholder] / [X] instead of substituting a real digit.
    # Strip these on the fly so the UI never surfaces a broken citation.
    # We buffer a tiny sliding window so a [n] split across two chunks ("[" + "n]")
    # still gets caught.
    import re as _re
    _PLACEHOLDER = _re.compile(r"\[[a-zA-Z]+\]")
    _pending = ""

    def _clean(chunk: str) -> str:
        nonlocal _pending
        _pending += chunk
        # Emit up to the last "[" — the tail might be a partial placeholder
        last_open = _pending.rfind("[")
        if last_open == -1:
            out, _pending = _pending, ""
        else:
            out, _pending = _pending[:last_open], _pending[last_open:]
            # If the pending tail already looks complete AND bad, strip it
            m = _PLACEHOLDER.fullmatch(_pending)
            if m:
                _pending = ""
        return _PLACEHOLDER.sub("", out)

    try:
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT) as resp:
            for raw_line in resp:
                line = raw_line.decode("utf-8", errors="ignore").strip()
                if not line or not line.startswith("data:"):
                    continue
                payload = line[len("data:") :].strip()
                if payload == "[DONE]":
                    break
                try:
                    obj = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                choices = obj.get("choices") or []
                if not choices:
                    continue
                delta = choices[0].get("delta") or {}
                chunk = delta.get("content")
                if chunk:
                    cleaned = _clean(chunk)
                    if cleaned:
                        yield cleaned
            # Flush any remaining buffered text at stream end
            if _pending:
                yield _PLACEHOLDER.sub("", _pending)
            return
    except urllib.error.URLError as e:
        # Surface a friendly message to the UI instead of crashing the stream
        yield f"\n\n[LLM unavailable: {e.reason}. Set OFFMIND_LLM_BASE_URL or start Ollama.]"
    except Exception as e:  # noqa: BLE001 — last-resort guard for the stream
        yield f"\n\n[LLM error: {e}]"


def llm_health() -> Dict[str, Any]:
    """Best-effort check — does the LLM endpoint answer at all?"""
    url = f"{LLM_BASE_URL.rstrip('/')}/models"
    try:
        req = urllib.request.Request(
            url, headers={"Authorization": f"Bearer {LLM_API_KEY}"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = [m.get("id") for m in (data.get("data") or [])]
            return {"available": True, "base_url": LLM_BASE_URL, "models": models}
    except Exception as e:  # noqa: BLE001
        return {"available": False, "base_url": LLM_BASE_URL, "error": str(e)}
