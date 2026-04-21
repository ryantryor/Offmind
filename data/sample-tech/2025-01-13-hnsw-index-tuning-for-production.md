---
title: "HNSW index tuning for production"
date: 2025-01-13
category: ai
tags: [vector-db, hnsw, performance]
---

# HNSW index tuning for production

HNSW has three knobs: M (graph connectivity, 16-64), ef_construction (build quality, 100-500), and ef_search (recall vs latency). Higher M = better recall but more memory. Tune ef_search per query - low for autocomplete, high for analysis. On 10M vectors, M=32 ef_search=128 typically gives 95% recall under 10ms.
