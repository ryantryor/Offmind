---
title: "Why ColBERT beats single-vector retrieval on hard queries"
date: 2025-02-13
category: ai
tags: [colbert, retrieval, advanced]
---

# Why ColBERT beats single-vector retrieval on hard queries

Single-vector models compress entire passages to one point - lossy for long documents. ColBERT keeps token-level vectors and uses late interaction (MaxSim) at query time. Better recall, especially for queries with multiple distinct facts. Cost: 100x more storage. Use it when retrieval quality is the bottleneck and storage isn't.
