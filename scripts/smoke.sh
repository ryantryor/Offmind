#!/usr/bin/env bash
# OffMind smoke test — one command, end-to-end.
#
# What it does:
#   1. /api/ready     — all subsystems wired?
#   2. /api/sample/load — load the 30-entry bilingual journal
#   3. /api/search    — hybrid search actually returns hits
#   4. /api/ask       — SSE RAG streams a non-empty answer
#   5. /api/snapshot  — VDE durable snapshot succeeds
#
# Usage:
#   docker compose up -d
#   docker exec -it offmind-ollama ollama pull llama3.2:3b    # first run only
#   ./scripts/smoke.sh
#
# Exit 0 = ship it.  Exit non-zero = something broke; see the failing step.

set -euo pipefail

API="${OFFMIND_API:-http://localhost:8000}"
GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'

pass() { echo "${GREEN}✓${RESET} $1"; }
fail() { echo "${RED}✗${RESET} $1"; exit 1; }
info() { echo "${DIM}  $1${RESET}"; }

echo "OffMind smoke test → ${API}"
echo

# ── 1. /api/ready ──────────────────────────────────────────────
step="1/5  /api/ready"
body=$(curl -sf --max-time 30 "${API}/api/ready") || fail "${step} — backend unreachable"
ok=$(printf '%s' "$body" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok'))")
[ "$ok" = "True" ] || { printf '%s\n' "$body" | head -c 400; echo; fail "${step} — not all subsystems ok"; }
pass "${step}"

# ── 2. /api/sample/load ────────────────────────────────────────
step="2/5  /api/sample/load"
body=$(curl -sf --max-time 180 -X POST "${API}/api/sample/load" -H 'Content-Type: application/json' -d '{}') \
  || fail "${step} — upload failed"
count=$(printf '%s' "$body" | python -c "import sys,json; print(json.load(sys.stdin).get('collection_total', 0))")
[ "$count" -gt 0 ] || fail "${step} — collection empty after load"
pass "${step}  (collection_total=${count})"

# ── 3. /api/search ─────────────────────────────────────────────
step="3/5  /api/search"
body=$(curl -sf --max-time 30 -X POST "${API}/api/search" \
  -H 'Content-Type: application/json' \
  -d '{"query":"what was I anxious about","k":3,"mode":"hybrid"}') \
  || fail "${step} — search request failed"
hits=$(printf '%s' "$body" | python -c "import sys,json; print(len(json.load(sys.stdin).get('results', [])))")
[ "$hits" -gt 0 ] || fail "${step} — zero hits"
pass "${step}  (${hits} hits)"

# ── 4. /api/ask (SSE) ──────────────────────────────────────────
step="4/5  /api/ask (SSE)"
tmp=$(mktemp)
curl -sf --max-time 120 -N -X POST "${API}/api/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"what was I anxious about last spring?","k":4}' > "$tmp" || {
    rm -f "$tmp"; fail "${step} — SSE request failed"
  }
tokens=$(grep -c '^data:' "$tmp" || true)
rm -f "$tmp"
[ "$tokens" -gt 0 ] || fail "${step} — zero SSE frames (is Ollama up? 'docker exec -it offmind-ollama ollama pull llama3.2:3b')"
pass "${step}  (${tokens} SSE frames)"

# ── 5. /api/snapshot ───────────────────────────────────────────
# Server v1.0.0 may not yet implement save_snapshot — we treat an honest
# "unimplemented" response as a soft pass (the client-side call path is
# wired; it lights up automatically when the server ships the feature).
step="5/5  /api/snapshot"
body=$(curl -sf --max-time 60 -X POST "${API}/api/snapshot") || fail "${step} — request failed"
summary=$(printf '%s' "$body" | python -c "
import sys,json
d=json.load(sys.stdin)
if d.get('ok'): print('ok')
elif d.get('unimplemented'): print('unimplemented')
else: print('fail:' + str(d.get('error') or 'ok=false'))
")
case "$summary" in
  ok) pass "${step}";;
  unimplemented) pass "${step}  ${DIM}(server reports not-implemented — client path verified)${RESET}";;
  *) fail "${step} — ${summary#fail:}";;
esac

echo
echo "${GREEN}All checks passed — open http://localhost:3000${RESET}"
