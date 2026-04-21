"""Stream-download the sentence-transformer weights through hf-mirror.com
to a local directory the docker container can bind-mount.

Resumable — re-run after a network blip and it picks up where it stopped.
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import requests

BASE = "https://hf-mirror.com/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/resolve/main"
OUT = Path(__file__).parent / "paraphrase-multilingual-MiniLM-L12-v2"
OUT.mkdir(parents=True, exist_ok=True)

# Known file list — we only need pytorch_model.bin; the rest are already downloaded.
# (name, expected_size_bytes)  — size pinned so we know when we've finished
# even if the server misreports Content-Length on resumed chunks.
FILES = [("pytorch_model.bin", 470_637_416)]

CHUNK = 1 << 20  # 1 MiB


def download(name: str, expected_total: int | None = None) -> bool:
    """Resumable download with unlimited retry. We stop when the file reaches
    `expected_total` (if known) or when the server signals the stream is truly
    complete (no more bytes + Content-Length satisfied).
    """
    url = f"{BASE}/{name}"
    dst = OUT / name
    have = dst.stat().st_size if dst.exists() else 0
    print(f"→ {name}  (resume from {have / 1e6:.1f} MB)" if have else f"→ {name}")

    attempt = 0
    stall_streak = 0  # consecutive attempts that downloaded 0 bytes
    while True:
        attempt += 1
        headers = {"Range": f"bytes={have}-"} if have else {}
        bytes_this_attempt = 0
        try:
            with requests.get(url, headers=headers, stream=True, timeout=30, allow_redirects=True) as r:
                if r.status_code in (200, 206):
                    # expected_total: preferred source of truth; else derive from response
                    total = expected_total or (int(r.headers.get("Content-Length", 0)) + have)
                    mode = "ab" if have and r.status_code == 206 else "wb"
                    if mode == "wb":
                        have = 0
                    start = time.time()
                    last_report = 0.0
                    with open(dst, mode) as f:
                        for chunk in r.iter_content(chunk_size=CHUNK):
                            if not chunk:
                                continue
                            f.write(chunk)
                            have += len(chunk)
                            bytes_this_attempt += len(chunk)
                            now = time.time()
                            if now - last_report > 2:
                                speed = bytes_this_attempt / max(now - start, 0.1) / 1e6
                                pct = (have / total * 100) if total else 0
                                print(f"  {have / 1e6:7.1f} MB  ({pct:5.1f}%)  {speed:5.1f} MB/s")
                                last_report = now
                    # Stream ended. Are we actually done?
                    if total and have >= total:
                        print(f"  done — {have / 1e6:.1f} MB")
                        return True
                    # Short read: server hung up mid-stream, loop back with new Range
                    print(f"  short read ({have / 1e6:.1f}/{total / 1e6:.1f} MB) — reconnecting")
                elif r.status_code == 416:  # Requested Range Not Satisfiable — file may already be complete
                    print(f"  HTTP 416 — file appears complete at {have / 1e6:.1f} MB")
                    return True
                else:
                    print(f"  HTTP {r.status_code} — retry {attempt}")
        except Exception as e:
            print(f"  {type(e).__name__}: {e} — retry {attempt}")

        # If two attempts in a row got 0 new bytes, sleep a bit longer.
        if bytes_this_attempt == 0:
            stall_streak += 1
        else:
            stall_streak = 0
        # refresh Range for next attempt based on what's actually on disk
        have = dst.stat().st_size if dst.exists() else 0
        if expected_total and have >= expected_total:
            print(f"  done — {have / 1e6:.1f} MB (file reached expected size)")
            return True
        # Backoff: 1s if we made progress, longer if we stalled
        sleep_s = 1.0 if stall_streak == 0 else min(2.0 * stall_streak, 30.0)
        time.sleep(sleep_s)


if __name__ == "__main__":
    ok = True
    for name, size in FILES:
        if not download(name, expected_total=size):
            ok = False
            print(f"FAILED: {name}", file=sys.stderr)
    sys.exit(0 if ok else 1)
