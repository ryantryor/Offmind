---
title: "Why temperature=0 doesn't make LLMs deterministic"
date: 2025-11-09
category: ai
tags: [llm, fundamentals]
---

# Why temperature=0 doesn't make LLMs deterministic

Floating-point summation is not associative on GPUs. Different batches, different memory layouts, different tie-breaking in argmax all introduce non-determinism even at T=0. Anthropic and OpenAI now offer 'seed' params that help but don't fully solve it. If you need bit-exact reproducibility, cache responses.
