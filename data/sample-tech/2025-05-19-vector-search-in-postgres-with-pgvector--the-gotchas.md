---
title: "Vector search in Postgres with pgvector: the gotchas"
date: 2025-05-19
category: database
tags: [postgres, vector-db, pgvector]
---

# Vector search in Postgres with pgvector: the gotchas

pgvector is great for <10M vectors. HNSW index added in 0.5.0 - much better than IVFFlat for most workloads. Watch out for: (1) ef_search must be set per-session, (2) the index doesn't help with filters unless you build composite. Above 10-50M vectors, dedicated vector DBs (Qdrant, Milvus, Actian VectorAI) start winning on QPS and recall.
