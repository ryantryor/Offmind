---
title: "Reranker models add 10% recall for cheap"
date: 2025-11-20
category: ai
tags: [rag, reranking]
---

# Reranker models add 10% recall for cheap

After your vector search returns top-50, run a small cross-encoder (e.g. bge-reranker-base) to rescore. Cross-encoders see (query, doc) jointly and are much more accurate than bi-encoders. Latency cost: 50-200ms for 50 candidates. Worth it for any user-facing search.
