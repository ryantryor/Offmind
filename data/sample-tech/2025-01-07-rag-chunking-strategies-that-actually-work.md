---
title: "RAG chunking strategies that actually work"
date: 2025-01-07
category: ai
tags: [rag, llm, chunking]
---

# RAG chunking strategies that actually work

Naive fixed-size chunking (e.g. 512 tokens) breaks semantic units. Better strategies: (1) recursive splitting on headers and paragraphs, (2) sentence-window with overlap, (3) propositional chunking using an LLM to extract atomic facts. For code, use AST-aware splitting. Always store the parent document ID so you can retrieve neighbors at query time.
