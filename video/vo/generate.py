"""Regenerate all OffMind demo VO clips with edge-tts (Emma voice).

Rerun this script any time you tweak the script — output is deterministic
(same text in → same audio out) so it's safe to commit.

Usage:
    cd video/vo
    python generate.py
"""
from __future__ import annotations
import asyncio
from pathlib import Path
import edge_tts

VOICE = "en-US-EmmaNeural"
RATE = "-5%"          # a touch slower than default = warmer
VOLUME = "+0%"

HERE = Path(__file__).parent

CUTS = [
    ("cut-01-morning.mp3",
     "Most of what you know about yourself lives in scattered text. "
     "OffMind opens with an echo from your past."),
    ("cut-02-reflect.mp3",
     "Ask in plain English. Your past self answers in its own words."),
    ("cut-03-stream.mp3",
     "Six sources retrieved from Actian. "
     "Every claim tagged with a numbered citation you can click."),
    ("cut-04-hover.mp3",
     "Click any citation to jump to the original entry."),
    ("cut-05-timeline.mp3",
     "Every memory, scored by a bilingual sentiment lexicon. "
     "No LLM call. Pure Python. Instant."),
    ("cut-06-filter.mp3",
     "Filter by mood. These are the hard days."),
    ("cut-07-search.mp3",
     "For power users — every Actian feature is exposed. "
     "Named vectors. Filter D S L. R R F and D B S F fusion. "
     "A hybrid BM25 reranker for true dense plus sparse retrieval."),
    ("cut-08-smoke.mp3",
     "Five checks, one command. "
     "Actian, local LLM, embeddings, snapshot — all green, all offline."),
    ("cut-09-write.mp3",
     "Write the next page with your voice. "
     "Faster-whisper, one hundred percent local. Never leaves your laptop."),
    ("cut-10-title.mp3",
     "OffMind. Your private time machine. "
     "Open source. One hundred percent offline."),
]


async def render_one(filename: str, text: str) -> float:
    out = HERE / filename
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(str(out))
    return out.stat().st_size / 1024  # KB


async def main() -> None:
    print(f"Rendering {len(CUTS)} clips with voice={VOICE} rate={RATE}")
    tasks = [render_one(f, t) for f, t in CUTS]
    sizes = await asyncio.gather(*tasks)
    total = 0.0
    for (f, _), kb in zip(CUTS, sizes):
        print(f"  [ok] {f:28s} {kb:6.1f} KB")
        total += kb
    print(f"Total: {total:.1f} KB across {len(CUTS)} clips")


if __name__ == "__main__":
    asyncio.run(main())
