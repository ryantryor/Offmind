---
title: "Semantic caching to cut LLM costs"
date: 2025-02-07
category: ai
tags: [llm, caching, cost]
---

# Semantic caching to cut LLM costs

Cache LLM responses keyed by embedding similarity, not exact string match. Threshold around 0.95 cosine similarity catches most paraphrases without serving wrong answers. Use a small vector DB to hold (query_embedding, response) pairs. Saves 30-50% on repetitive workloads.
