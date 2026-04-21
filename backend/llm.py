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
(journal entries, notes, chat logs). Answer the user's question by reading
those excerpts carefully and quoting them when useful.

Rules:
- Speak in the SECOND PERSON, as if the past notes are the user's own memories.
  ("On Jan 12 you wrote that you felt…")
- ALWAYS cite the source as [n] where n is the index of the excerpt.
- If the excerpts don't actually answer the question, say so honestly —
  do NOT invent memories.
- Be warm but concise. The user wants insight, not a wall of text.
- Reply in the same language as the user's question.
"""


SYSTEM_PROMPT_ZH = """你是 OffMind — 一台私人「时光机」,让用户和过去的自己对话。
下面给你的内容,是用户过去写下的片段(日记、笔记、聊天记录)。请仔细阅读这些片段,
然后回答用户的问题。

规则:
- 用第二人称回答,就好像那些过去的笔记是用户自己的记忆。
  (例如「1月12号你写到,那天你感觉……」)
- 引用片段时,务必标注来源 [n],n 是片段编号。
- 如果片段里其实没有答案,就如实说,不要编造记忆。
- 温暖但简洁,用户想要洞察,不是长篇大论。
- 用用户提问的语言回答。
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
) -> List[Dict[str, str]]:
    """Build the chat messages with retrieved context inlined."""
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
        header = f"[{i}] {title}"
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

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user_msg},
    ]


def stream_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.4,
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
    try:
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT) as resp:
            for raw_line in resp:
                line = raw_line.decode("utf-8", errors="ignore").strip()
                if not line or not line.startswith("data:"):
                    continue
                payload = line[len("data:") :].strip()
                if payload == "[DONE]":
                    return
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
                    yield chunk
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
