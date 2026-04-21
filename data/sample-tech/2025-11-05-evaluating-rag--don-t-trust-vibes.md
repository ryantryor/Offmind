---
title: "Evaluating RAG: don't trust vibes"
date: 2025-11-05
category: ai
tags: [rag, evaluation]
---

# Evaluating RAG: don't trust vibes

Build a labeled set of (query, ideal_doc, ideal_answer) triples - even 50 helps. Measure: retrieval@k (did we get the right doc?), answer faithfulness (is the answer grounded?), answer relevance (does it address the question?). Tools: ragas, deepeval, or just write your own scorer LLM.
