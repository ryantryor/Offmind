"""OffMind document parsers — extract title + body + frontmatter from
.md, .txt, .pdf, .docx files. Returns the dict shape that core.index_documents expects.
"""
from __future__ import annotations

import io
import re
from datetime import datetime
from pathlib import Path
from typing import Optional


def _guess_title(body: str, fallback: str) -> str:
    """First markdown H1, first non-blank line, or filename."""
    for line in body.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("# "):
            return line[2:].strip()
        return line[:80]
    return fallback


def parse_markdown(content: str, filename: str) -> dict:
    """Parse markdown with optional YAML frontmatter."""
    try:
        import frontmatter

        post = frontmatter.loads(content)
        body = post.content.strip()
        meta = post.metadata or {}
    except Exception:
        body = content.strip()
        meta = {}

    title = meta.get("title") or _guess_title(body, Path(filename).stem)
    return {
        "title": str(title),
        "body": body,
        "category": str(meta.get("category", "uncategorized")),
        "tags": list(meta.get("tags") or []),
        "date": str(meta.get("date") or datetime.now().date()),
        "path": filename,
    }


def parse_text(content: str, filename: str) -> dict:
    body = content.strip()
    return {
        "title": _guess_title(body, Path(filename).stem),
        "body": body,
        "category": "uncategorized",
        "tags": [],
        "date": str(datetime.now().date()),
        "path": filename,
    }


def parse_pdf(raw: bytes, filename: str) -> dict:
    """Try PyMuPDF first (fast, no Java), fall back to pdfminer."""
    text = ""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=raw, filetype="pdf")
        text = "\n\n".join(page.get_text() for page in doc)
        doc.close()
    except Exception:
        try:
            from pdfminer.high_level import extract_text

            text = extract_text(io.BytesIO(raw)) or ""
        except Exception as e:
            text = f"[PDF parse failed: {e}]"

    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return {
        "title": _guess_title(text, Path(filename).stem),
        "body": text,
        "category": "pdf",
        "tags": [],
        "date": str(datetime.now().date()),
        "path": filename,
    }


def parse_docx(raw: bytes, filename: str) -> dict:
    try:
        from docx import Document

        doc = Document(io.BytesIO(raw))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n\n".join(paragraphs)
    except Exception as e:
        text = f"[DOCX parse failed: {e}]"

    return {
        "title": _guess_title(text, Path(filename).stem),
        "body": text,
        "category": "docx",
        "tags": [],
        "date": str(datetime.now().date()),
        "path": filename,
    }


SUPPORTED = {".md", ".markdown", ".txt", ".pdf", ".docx"}


def parse_upload(filename: str, raw: bytes) -> Optional[dict]:
    """Top-level dispatch by extension. Returns None if unsupported."""
    ext = Path(filename).suffix.lower()
    if ext in (".md", ".markdown"):
        return parse_markdown(raw.decode("utf-8", errors="replace"), filename)
    if ext == ".txt":
        return parse_text(raw.decode("utf-8", errors="replace"), filename)
    if ext == ".pdf":
        return parse_pdf(raw, filename)
    if ext == ".docx":
        return parse_docx(raw, filename)
    return None


def parse_path(path: Path) -> Optional[dict]:
    """Parse a file from disk."""
    if path.suffix.lower() not in SUPPORTED:
        return None
    raw = path.read_bytes()
    doc = parse_upload(path.name, raw)
    if doc is not None:
        doc["path"] = str(path)
    return doc
