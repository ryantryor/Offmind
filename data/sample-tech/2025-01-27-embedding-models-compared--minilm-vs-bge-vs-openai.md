---
title: "Embedding models compared: MiniLM vs BGE vs OpenAI"
date: 2025-01-27
category: ai
tags: [embeddings, models, benchmarks]
---

# Embedding models compared: MiniLM vs BGE vs OpenAI

all-MiniLM-L6-v2 (22MB, 384d) is the speed champion - good enough for 90% of cases. BGE-large (1.3GB, 1024d) wins MTEB benchmarks, especially for retrieval. OpenAI text-embedding-3-small gives strong out-of-the-box performance but costs per call and requires network. For local/private use cases, MiniLM is hard to beat.
