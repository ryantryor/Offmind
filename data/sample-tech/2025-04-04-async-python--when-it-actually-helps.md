---
title: "Async Python: when it actually helps"
date: 2025-04-04
category: backend
tags: [python, async]
---

# Async Python: when it actually helps

Async wins on IO-bound workloads with high concurrency: web servers, scrapers, API aggregators. Async LOSES on CPU-bound work - use multiprocessing instead. Mixing sync and async code is painful; pick a side per service.
