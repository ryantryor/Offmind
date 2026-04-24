# DoraHacks #2097 Submission Copy

Paste-ready text for each field on https://dorahacks.io/hackathon/2097/buidl.
Fill in the **Demo video URL** after you publish the YouTube unlisted link,
then copy each section below into the matching form field.

---

## 1. Project name

**OffMind**

## 2. Tagline (one line, ~80 chars)

> A private time machine for your mind — talk with your past self, 100% offline.

## 3. Description (long form, ~300 words)

OffMind turns the scattered text you've already written about yourself — journal entries, notes, half-finished drafts, 2 am chat logs with yourself — into a **conversational time machine**. Ask a question in plain English and your *past self* answers, quoting the exact words you wrote, with clickable citations back to the original entry.

Everything runs on your laptop. No cloud. No telemetry. The text, the embeddings, the LLM — all local.

**Four product surfaces**, all powered by one Actian VectorAI DB collection:

- **🗣️ Ask** — SSE-streamed RAG. Actian retrieves the 6 most relevant moments, then a local Llama 3.2 3B narrates the answer in warm second person with `[n]` citations.
- **⏳ Timeline** — chronological feed, each entry color-coded by mood. Sentiment is scored by a bilingual lexicon (no LLM call), so the timeline renders instantly even for thousands of entries.
- **🔎 Search** — power-user hybrid search with an Inspector panel. Toggle fusion modes (RRF / DBSF / dense-only / sparse-only) and see exactly what Actian did under the hood.
- **✍️ Write** — offline voice-to-journal. faster-whisper transcribes locally; the entry is indexed into Actian the moment you save it.

Plus a daily **Morning Reflection** ritual — on first launch each day, OffMind surfaces one entry from this same date in a previous year and streams a 2-sentence reflection, turning the product from "a tool I open" into "a companion that checks in."

**Seven Actian features in one coherent flow:** Named Vectors (separate `title` and `body` 384-d spaces), FilterBuilder DSL, RRF Fusion, DBSF Fusion, VDE Snapshot, Streaming Upsert with per-batch SSE progress, FLAT exact index, plus a custom CJK-aware BM25 reranker for true hybrid semantics on top of the dense candidate pool.

**English-first, multilingual under the hood.** The narration LLM speaks English; the retrieval layer uses a multilingual MiniLM embedding (50+ languages), so an English query can surface a Chinese journal entry from years ago. Real bilingual users don't think in one language — neither should their tooling.

## 4. Tech stack

`FastAPI` · `Next.js 14` · `Actian VectorAI DB v1.0.0 (gRPC :50051)` · `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (384-d)` · `Ollama / llama3.2:3b` · `faster-whisper (tiny, int8 CPU)` · `Docker Compose (4 services)` · `Server-Sent Events` · `Custom CJK-aware BM25` · `Bilingual sentiment lexicon (pure Python)`

## 5. Repo URL

https://github.com/ryantryor/Offmind

## 6. Demo video URL

The demo video lives **in the GitHub repo** — inline-plays on the README so judges don't leave the project page.

- **Primary (inline-plays on GitHub):** https://github.com/user-attachments/assets/af7922c2-3645-443e-825b-fd623ce8a613
- **Fallback (README anchor):** https://github.com/ryantryor/Offmind#-90-second-demo

> Why GitHub instead of YouTube? One fewer click for judges, no sign-in wall, and the MP4 lives next to the source that built it (deterministic HTML → MP4 via [HeyGen HyperFrames](https://github.com/heygen-com/hyperframes)).

## 7. Live demo URL

Local-only by design — the product's value is privacy, so there is no hosted instance. Judges can reproduce in under 5 minutes:

```
git clone https://github.com/ryantryor/Offmind.git
cd Offmind && docker compose up -d --build
docker exec -it offmind-ollama ollama pull llama3.2:3b
./scripts/smoke.sh          # expect "All checks passed"
open http://localhost:3000
```

## 8. What Actian features do you use? (if asked separately)

| Feature | How OffMind uses it |
|---|---|
| Named Vectors | `title` + `body` in two independent 384-d spaces, fused at query time |
| Filter DSL | `FilterBuilder` composes category + tags + date range, pushed into every search arm |
| RRF Fusion | 2-arm fusion: dense-title × 0.4 + dense-body × 0.6 |
| DBSF Fusion | Distribution-based fusion offered as an alternative mode |
| VDE Snapshot | One-click `client.vde.save_snapshot()` |
| Streaming Upsert | Batched upsert with per-batch SSE progress streamed to the browser |
| FLAT Exact Index | `IndexType.FLAT` — perfect-recall search, ideal for personal journal scale |
| Hybrid via BM25 | Custom CJK-aware BM25 reranks the dense candidate pool client-side, true dense+sparse semantics |

## 9. Honest engineering note (if there's a "challenges" field)

Server v1.0.0 currently accepts the SDK's `sparse_vectors_config` but doesn't yet store sparse vectors, and scalar quantization requires a `train()` call the SDK doesn't yet expose. Both code paths are preserved in `core.py` as ready-to-flip switches; for now we surface the same hybrid behaviour by reranking client-side, and ship full-precision body vectors. When the server adds those features, OffMind will pick them up by uncommenting two lines.

The first-run model download is also non-trivial in restricted-network environments — HuggingFace's Xet CDN bypasses common mirrors. We solved this with a host-side `_download.py` script that fetches through `hf-mirror.com` with streaming + resume, then bind-mounts the result into the container.

## 10. Team

Solo build.

## 11. License

MIT

---

## Submission-form checklist (fill in this order)

1. ☐ **Project name** → paste §1
2. ☐ **Tagline** → paste §2
3. ☐ **Description** → paste §3
4. ☐ **Tech stack** → paste §4
5. ☐ **Repo URL** → paste §5 (make sure the repo is **public** before you submit)
6. ☐ **Demo video** → paste the YouTube unlisted URL into §6 of this file *and* the form
7. ☐ **Live demo** → paste §7 (local-only note)
8. ☐ **Features / challenges / team / license** → paste §8, §9, §10, §11 into whichever fields DoraHacks surfaces

## Last-minute sanity checks (run on the submission day)

- [ ] GitHub repo is public and the `main` branch runs with the Quickstart as-is
- [ ] `docker compose up -d --build` boots green on a clean machine
- [ ] `./scripts/smoke.sh` prints "All checks passed"
- [ ] Video MP4 uploaded to GitHub (release asset or issue attachment) — URL inline-plays when opened
- [ ] README hero block at top of repo renders the inline player (not just a text link)
- [ ] README hero block renders (badges, headline tagline, quickstart)
- [ ] No secrets in the repo (`git grep -i "api.key\|secret\|password"` returns nothing real)
- [ ] Commit tagged: `git tag v0.2.0-hackathon && git push --tags`
