---
title: "Vector databases vs. traditional search"
date: 2025-01-06
category: ai
tags: [vector-db, search, rag]
---

# Vector databases vs. traditional search

Traditional keyword search (BM25) excels at exact term matching but misses semantic intent. Dense vector search via embeddings captures meaning - a query about 'cars' will match documents about 'automobiles'. The trade-off: vector search needs a model and an index (HNSW, IVF). Hybrid retrieval combining both often wins, fused via Reciprocal Rank Fusion or score normalization.
