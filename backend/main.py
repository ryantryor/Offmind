"""OffMind FastAPI backend.

Endpoints:
    GET  /api/health           — server + Actian status
    GET  /api/status           — collection counts + Actian features used
    GET  /api/llm/health       — is the local LLM (Ollama) reachable?
    GET  /api/facets           — categories + tag list for filter UI
    POST /api/search           — hybrid search with Filter DSL
    POST /api/ask              — SSE streaming RAG: retrieve + LLM answer
    GET  /api/timeline         — chronological feed + sentiment for Time Machine view
    POST /api/upload           — multipart file upload, returns parsed docs (no index)
    POST /api/index            — index a list of docs (sync, simple)
    POST /api/index/stream     — SSE: index docs with per-batch progress
    POST /api/journal/append   — write a new journal entry to disk + index it
    POST /api/sentiment        — score a piece of text (Write-tab tone preview)
    GET  /api/on_this_day      — entries from today's month-day in past years
    POST /api/transcribe       — offline speech-to-text (faster-whisper)
    POST /api/sample/load      — load the bundled sample dataset
    POST /api/snapshot         — VDE snapshot
"""
from __future__ import annotations

import asyncio
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import core
import llm
import parsers
import sentiment

app = FastAPI(
    title="OffMind API",
    description="Offline private knowledge search — powered by Actian VectorAI DB",
    version="0.1.0",
)

# CORS: allow the Next.js dev server + the docker-compose service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str
    k: int = 10
    mode: str = "hybrid"
    tags: Optional[list[str]] = None
    category: Optional[str] = None
    date_from: Optional[str] = None  # ISO date
    date_to: Optional[str] = None


class IndexDoc(BaseModel):
    title: str
    body: str
    category: Optional[str] = "uncategorized"
    tags: Optional[list[str]] = []
    date: Optional[str] = None
    path: Optional[str] = ""


class IndexRequest(BaseModel):
    docs: list[IndexDoc]
    recreate: bool = False


# ── Health / Status ────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"ok": True, "service": "offmind-api", "version": app.version}


@app.get("/api/status")
def status():
    return core.collection_status()


@app.get("/api/llm/health")
def llm_health():
    return llm.llm_health()


@app.get("/api/facets")
def facets():
    return core.list_categories_and_tags()


# ── Search ─────────────────────────────────────────────────────
def _parse_iso_date(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


@app.post("/api/search")
def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(400, "query must be non-empty")
    return core.search(
        req.query,
        k=req.k,
        mode=req.mode,
        tags=req.tags,
        category=req.category,
        date_from=_parse_iso_date(req.date_from),
        date_to=_parse_iso_date(req.date_to),
    )


# ── Ask (RAG with streaming LLM) ───────────────────────────────
class AskRequest(BaseModel):
    question: str
    k: int = 6
    mode: str = "hybrid"
    tags: Optional[list[str]] = None
    category: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    temperature: float = 0.4
    # Optional prior turns for multi-turn "talking to your past self" mode.
    # Each entry: {"role": "user" | "assistant", "content": "..."}.
    # Only the CURRENT question drives retrieval — history is context only.
    history: Optional[list[dict]] = None


@app.post("/api/ask")
async def ask(req: AskRequest):
    """RAG endpoint — retrieve top-k from Actian, stream the LLM answer.

    Stream format (SSE):
      event: sources   data: [{id,title,date,snippet,score,...}, ...]
      event: token     data: "<text chunk>"
      event: done      data: {"ok": true}
      event: error     data: {"error": "..."}
    """
    if not req.question.strip():
        raise HTTPException(400, "question must be non-empty")

    # 1) Retrieval — uses the same hybrid pipeline as /api/search but
    #    pulls full bodies for grounding.
    retrieved = await asyncio.to_thread(
        core.search_with_body,
        req.question,
        k=req.k,
        mode=req.mode,
        tags=req.tags,
        category=req.category,
        date_from=_parse_iso_date(req.date_from),
        date_to=_parse_iso_date(req.date_to),
    )
    contexts = retrieved.get("results", [])
    inspector = {k: v for k, v in retrieved.items() if k != "results"}

    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def stream_tokens():
        try:
            messages = llm.build_messages(req.question, contexts, history=req.history)
            for chunk in llm.stream_chat(messages, temperature=req.temperature):
                loop.call_soon_threadsafe(queue.put_nowait, ("token", chunk))
            loop.call_soon_threadsafe(queue.put_nowait, ("done", {"ok": True}))
        except Exception as e:  # noqa: BLE001 — surface to the stream
            loop.call_soon_threadsafe(queue.put_nowait, ("error", {"error": str(e)}))

    asyncio.create_task(asyncio.to_thread(stream_tokens))

    async def event_stream():
        # Send sources first so the UI can render citations immediately
        # while the LLM is still warming up.
        yield f"event: sources\ndata: {json.dumps({'sources': contexts, 'inspector': inspector}, ensure_ascii=False)}\n\n"
        if not contexts:
            # Still let the LLM respond — it'll honestly say it doesn't know.
            pass
        while True:
            kind, payload = await queue.get()
            data = payload if isinstance(payload, str) else json.dumps(payload, ensure_ascii=False)
            if kind == "token":
                # Tokens are raw strings — JSON-encode so newlines survive SSE
                yield f"event: token\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
            else:
                yield f"event: {kind}\ndata: {data}\n\n"
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ── Timeline (Time Machine view) ───────────────────────────────
@app.get("/api/timeline")
def timeline(limit: int = 500, sentiment_filter: Optional[str] = None):
    """Chronological feed of every memory, with sentiment tagging.

    Query params:
        limit            max entries (default 500, cap 2000)
        sentiment_filter optional: positive | neutral | negative
    """
    limit = max(1, min(limit, 2000))
    items = core.scroll_all(limit=limit)
    out = []
    for it in items:
        s = sentiment.analyze(it.get("body") or it.get("snippet") or "")
        if sentiment_filter and s.label != sentiment_filter:
            continue
        out.append({
            "id": it["id"],
            "title": it["title"],
            "date": it["date"],
            "date_ts": it["date_ts"],
            "snippet": it["snippet"],
            "category": it["category"],
            "tags": it["tags"],
            "sentiment": s.label,
            "sentiment_score": s.score,
        })
    # Bucket counts so the UI can render the mood histogram
    counts = {"positive": 0, "neutral": 0, "negative": 0}
    for x in out:
        counts[x["sentiment"]] = counts.get(x["sentiment"], 0) + 1
    return {"count": len(out), "sentiment_counts": counts, "entries": out}


# ── Upload (parse only) ────────────────────────────────────────
@app.post("/api/upload")
async def upload(files: list[UploadFile] = File(...)):
    """Receive uploaded files, parse them, return doc dicts WITHOUT indexing.
    The frontend can then preview before sending to /api/index/stream.
    """
    out = []
    skipped = []
    for f in files:
        raw = await f.read()
        doc = parsers.parse_upload(f.filename or "untitled", raw)
        if doc is None:
            skipped.append({"filename": f.filename, "reason": "unsupported file type"})
            continue
        out.append(doc)
    return {"docs": out, "skipped": skipped, "count": len(out)}


# ── Index (sync) ───────────────────────────────────────────────
@app.post("/api/index")
def index(req: IndexRequest):
    docs = [d.model_dump() for d in req.docs]
    return core.index_documents(docs, recreate=req.recreate)


# ── Index (streaming via SSE) ──────────────────────────────────
@app.post("/api/index/stream")
async def index_stream(req: IndexRequest):
    """Stream per-batch progress as SSE. Frontend listens with EventSource
    or fetch() with ReadableStream."""
    docs = [d.model_dump() for d in req.docs]
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def progress(done: int, total: int, stage: str):
        loop.call_soon_threadsafe(
            queue.put_nowait,
            {"done": done, "total": total, "stage": stage},
        )

    async def run_index():
        try:
            result = await asyncio.to_thread(
                core.index_documents,
                docs,
                recreate=req.recreate,
                batch_size=16,
                progress_cb=progress,
            )
            await queue.put({"done_event": True, "result": result})
        except Exception as e:
            await queue.put({"error": str(e)})

    asyncio.create_task(run_index())

    async def event_stream():
        # Initial event so the browser starts rendering
        yield f"data: {json.dumps({'stage': 'starting', 'done': 0, 'total': len(docs)})}\n\n"
        while True:
            event = await queue.get()
            yield f"data: {json.dumps(event)}\n\n"
            if event.get("done_event") or event.get("error"):
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ── Tone preview (cheap sentiment on arbitrary text) ───────────
class SentimentRequest(BaseModel):
    text: str


@app.post("/api/sentiment")
def sentiment_endpoint(req: SentimentRequest):
    """Score a piece of text with the bilingual lexicon.

    Used live by the Write tab to show "this sounds heavier than usual"
    hints as the user types. No LLM call — pure Python lexicon match,
    returns in <1ms for journal-sized inputs.
    """
    s = sentiment.analyze(req.text or "")
    return {
        "label": s.label,
        "score": s.score,
        "matched": s.matched,
    }


# ── "On This Day" — entries from today's month-day in past years ───
@app.get("/api/on_this_day")
def on_this_day(window: int = 2):
    """Find journal entries from the same month-day in previous years.

    Query params:
        window   +/- day tolerance (default 2 → 5-day band around today)

    Returns up to 3 entries, newest-anniversary first. Empty list is
    fine — the UI treats it as "nothing to show" and hides the card.
    """
    today = datetime.now().date()
    try:
        items = core.scroll_all(limit=2000)
    except Exception as e:  # noqa: BLE001
        return {"today": today.isoformat(), "entries": [], "error": str(e)}

    matches = []
    for it in items:
        raw = it.get("date") or ""
        try:
            d = datetime.strptime(raw, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            continue
        if d.year >= today.year:
            continue  # only past years
        # Project entry's MM-DD onto this year and measure distance from today
        try:
            projected = d.replace(year=today.year)
        except ValueError:
            # Feb 29 on non-leap year — skip gracefully
            continue
        day_diff = abs((projected - today).days)
        if day_diff <= window:
            matches.append({
                "id": it.get("id"),
                "title": it.get("title"),
                "date": raw,
                "snippet": it.get("snippet"),
                "category": it.get("category"),
                "tags": it.get("tags", []),
                "years_ago": today.year - d.year,
                "day_diff": day_diff,
            })

    # Sort: closest day first, then longest-ago year (more poignant)
    matches.sort(key=lambda m: (m["day_diff"], -m["years_ago"]))
    return {
        "today": today.isoformat(),
        "count": len(matches),
        "entries": matches[:3],
    }


# ── Voice transcription (faster-whisper, 100% offline) ─────────
# Powers the mic button in the Write tab. Receives a webm/mp3/wav blob
# captured via browser MediaRecorder, returns plain text. We lazy-load
# the Whisper model on first use so the container starts fast; after
# that it lives in memory as a module global. "tiny" model ~40MB on disk.
WHISPER_MODEL_SIZE = os.environ.get("OFFMIND_WHISPER_MODEL", "tiny")
_whisper_model = None  # module-level cache


def _get_whisper():
    """Lazy-init — first call downloads ~40MB (or uses local cache)."""
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
        except ImportError as e:
            raise HTTPException(
                501,
                f"faster-whisper not installed. pip install faster-whisper. ({e})",
            )
        # int8 on CPU is plenty for journal speech; no GPU needed.
        _whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE, device="cpu", compute_type="int8"
        )
    return _whisper_model


@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """Transcribe an audio blob (webm/ogg/wav/mp3) to text.

    Bilingual (the Whisper `tiny` model handles EN + ZH + dozens more).
    Fully local — audio never leaves this box.
    """
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "empty audio")
    # Write to a temp file — faster-whisper wants a path or numpy array,
    # and a path is the simplest cross-format option (handles webm/ogg/mp3/wav).
    import tempfile
    suffix = ".webm" if (file.content_type or "").endswith("webm") else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(raw)
        path = tmp.name
    try:
        model = await asyncio.to_thread(_get_whisper)
        try:
            segments, info = await asyncio.to_thread(
                lambda: model.transcribe(path, beam_size=1, vad_filter=True)
            )
            text = " ".join(seg.text.strip() for seg in segments).strip()
            return {
                "text": text,
                "language": getattr(info, "language", None),
                "duration": round(getattr(info, "duration", 0.0), 2),
            }
        except ValueError:
            # faster-whisper raises ValueError("max() arg is an empty sequence")
            # when the clip is pure silence / below the VAD threshold. Treat
            # as "no speech detected" instead of surfacing a 500 to the UI.
            return {"text": "", "language": None, "duration": 0.0}
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


# ── Journal append (write-your-own-entry) ──────────────────────
JOURNAL_DIR = Path(os.environ.get("OFFMIND_JOURNAL_DIR", "/app/data/journal"))


class JournalEntry(BaseModel):
    title: str
    body: str
    mood: Optional[str] = None       # positive | neutral | negative (free-form tag)
    tags: Optional[list[str]] = []
    date: Optional[str] = None       # ISO "YYYY-MM-DD" — defaults to today


_SLUG_RE = re.compile(r"[^a-z0-9\-]+")


def _slugify(title: str, max_len: int = 40) -> str:
    """ASCII-safe slug — collapse whitespace, drop non-[a-z0-9-] chars.

    CJK titles → mostly stripped → falls back to "entry". We prepend a
    timestamp anyway so collisions are rare.
    """
    s = title.strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = _SLUG_RE.sub("", s)
    s = s.strip("-")
    return (s[:max_len] or "entry")


@app.post("/api/journal/append")
def journal_append(entry: JournalEntry):
    """Persist a new journal entry as a markdown file and index it live.

    Writes to OFFMIND_JOURNAL_DIR as YAML-frontmatter markdown so the entry
    survives container restarts and shows up on the next `/api/sample/load`
    or manual re-index. After writing, we parse + index through the same
    code path as uploads so the entry is immediately searchable.
    """
    title = (entry.title or "").strip()
    body = (entry.body or "").strip()
    if not title and not body:
        raise HTTPException(400, "title or body must be non-empty")
    if not title:
        # Use first line of body (up to 60 chars) as the title
        first = body.splitlines()[0] if body else "Untitled"
        title = first[:60].strip() or "Untitled"

    # Normalize date — default to today, accept ISO YYYY-MM-DD
    date_str = (entry.date or "").strip() or str(datetime.now().date())

    # Tags: include mood as a tag if present (so timeline's sentiment
    # analyzer still wins, but downstream filters can slice by mood)
    tags = list(entry.tags or [])
    mood = (entry.mood or "").strip().lower()
    if mood and mood not in tags:
        tags.insert(0, mood)

    # Pick a filename: YYYY-MM-DD_HHMMSS_<slug>.md — time-sortable + safe
    JOURNAL_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    slug = _slugify(title)
    fname = f"{stamp}_{slug}.md"
    fpath = JOURNAL_DIR / fname

    # Hand-rolled YAML frontmatter — avoids pulling PyYAML just for this
    def _yaml_list(xs: list[str]) -> str:
        return "[" + ", ".join(f'"{x}"' for x in xs) + "]"

    frontmatter = (
        "---\n"
        f'title: "{title.replace(chr(34), chr(39))}"\n'
        f"date: {date_str}\n"
        f"category: journal\n"
        f"tags: {_yaml_list(tags)}\n"
        f'mood: "{mood}"\n'
        "---\n\n"
    )
    fpath.write_text(frontmatter + body + "\n", encoding="utf-8")

    # Parse + index through the existing pipeline
    doc = parsers.parse_path(fpath)
    if doc is None:
        raise HTTPException(500, "failed to parse just-written entry")
    # Force the category to "journal" so these stand out in facets
    doc["category"] = "journal"
    # Merge the mood tag that we pushed onto frontmatter (parse_markdown
    # already picks up tags, but be defensive in case of list drift)
    doc["tags"] = list({*(doc.get("tags") or []), *tags})
    doc["date"] = date_str

    result = core.index_documents([doc], recreate=False)

    return {
        "ok": True,
        "path": str(fpath.relative_to(JOURNAL_DIR.parent) if fpath.is_relative_to(JOURNAL_DIR.parent) else fpath),
        "doc": {
            "title": doc["title"],
            "date": doc["date"],
            "category": doc["category"],
            "tags": doc["tags"],
            "snippet": (doc["body"] or "")[:240],
        },
        "upserted": result.get("upserted", 1),
        "collection_total": result.get("collection_total"),
    }


# ── Sample dataset loader ──────────────────────────────────────
SAMPLE_DIR = Path(os.environ.get("OFFMIND_SAMPLE_DIR", "/app/data/sample"))


@app.post("/api/sample/load")
def sample_load(recreate: bool = True):
    """Index the bundled 74-note sample dataset for the demo mode."""
    if not SAMPLE_DIR.exists():
        raise HTTPException(404, f"sample dir not found at {SAMPLE_DIR}")
    paths = sorted(SAMPLE_DIR.glob("**/*.md"))
    if not paths:
        raise HTTPException(404, f"no .md files under {SAMPLE_DIR}")
    docs = []
    for p in paths:
        d = parsers.parse_path(p)
        if d:
            docs.append(d)
    return core.index_documents(docs, recreate=recreate)


# ── Snapshot ───────────────────────────────────────────────────
@app.post("/api/snapshot")
def snapshot():
    return core.save_snapshot()


@app.get("/")
def root():
    return {
        "name": "OffMind",
        "tagline": "Offline private knowledge search powered by Actian VectorAI DB",
        "docs": "/docs",
    }
