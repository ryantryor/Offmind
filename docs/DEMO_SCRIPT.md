# OffMind — 90s Demo Video Script

**Format:** screen recording + voiceover.
**Voiceover language:** English (matches the English-first product positioning).
**Tools:** OBS Studio (record), DaVinci Resolve / CapCut (edit), ElevenLabs (AI voiceover).
**Voice direction:** warm, low-key, slightly conversational. Not corporate.
**Music:** soft lo-fi piano under voice, ducked to -18dB during speech.
**Total target:** 85–95 seconds. Hard cap 100s for DoraHacks.

---

## Visual / VO synced storyboard

| t (s) | Screen | Voiceover (English) |
|---|---|---|
| 0:00–0:06 | Title card on dark gradient: **"OffMind"** subtitle: *"Talk with your past time."* Logo fades in. | (silent for 1s) — *"Most of what you know about yourself lives in scattered text."* |
| 0:06–0:13 | Cut to a slow dolly across folders: `journal/`, `notes.md`, `2am-thoughts.txt`, `breakup-letter-draft.docx`. | *"Journals, drafts, chat logs with yourself at 2am. OffMind turns all of that into a conversational time machine."* |
| 0:13–0:20 | Browser at `http://localhost:3000`. Click **"Load sample dataset"**. SSE progress bar streams. Counter ticks: 5/30 → 30/30. | *"It runs entirely on your laptop. Powered by Actian VectorAI DB."* (let the streaming counter be the visual hero) |
| 0:20–0:30 | Switch to **Timeline** tab. Colored dots fade in chronologically — green for good days, amber for hard ones. Hover one entry to show snippet + tags. | *"Every memory, scored by a bilingual sentiment lexicon. No LLM call — just pure Python. Filter by mood, scrub by date."* |
| 0:30–0:55 | Switch to **Ask** tab. Type: **"What was making me anxious last spring?"** Press enter. Six source cards animate in from below (with `[1]` `[2]` chips). Then tokens stream into the answer panel: *"In April you wrote about the job rejection [1]…"* | *"Now ask. Actian retrieves the six most relevant moments from your past, then a local Llama 3.2 narrates the answer back to you in second person, with citations you can click."* |
| 0:55–1:10 | Switch to **Search** tab. Toggle the fusion mode dropdown: **RRF → DBSF → Dense only → Sparse only**. Each toggle visibly re-ranks the results. Open the Inspector panel: shows query vectors, retrieval times, fusion weights. | *"For power users, every Actian feature is exposed. Named vectors. Filter DSL. Reciprocal-rank and distribution-based fusion. Real hybrid search via a CJK-aware BM25 reranker."* |
| 1:10–1:20 | Open a terminal overlay. Run `curl -X POST localhost:8000/api/snapshot`. Response: `{"ok": true, "snapshot": "..."}`. | *"One click saves a durable VDE snapshot. Your past is yours, on disk, forever."* |
| 1:20–1:28 | Cut back to title card. URL bar visible: `github.com/ryantryor/Offmind`. Tagline below: *"Built on Actian VectorAI DB."* | *"OffMind. Your private time machine. Open source. One hundred percent offline."* |
| 1:28–1:30 | Logo fades to black. | (silent — let the music breathe) |

---

## ElevenLabs settings (recommended)

- Voice: **Adam** (warm male) or **Charlotte** (warm female)
- Stability: 45
- Similarity: 75
- Style: 30
- Speaker boost: on

## Caption track (burned-in, optional)

If you want bilingual captions for the Chinese audience, add SRT under the English voice with the equivalent Chinese — the README already has both halves. Don't dub a Chinese voice; one language per audio track.

## Recording checklist (do this before hitting record)

- [ ] `docker compose ps` — all 4 services Up
- [ ] `curl localhost:8000/api/llm/health` returns `{"ok": true}` (Llama 3.2 loaded)
- [ ] Sample data already loaded once (so the demo "Load sample" is the second load and is fast)
- [ ] Browser zoom = 110% (text reads on small screens)
- [ ] Hide other browser tabs / bookmark bar
- [ ] Set OBS to 1920×1080, 60fps, MP4 H.264

## What NOT to show

- Backend logs (boring, breaks the magic)
- Docker desktop UI (looks ops-y, not product-y)
- The `_download.py` model fetcher (cool engineering, but off-message for the 90s pitch — keep that for the README)
