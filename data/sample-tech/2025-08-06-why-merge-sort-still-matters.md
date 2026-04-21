---
title: "Why merge sort still matters"
date: 2025-08-06
category: algorithms
tags: [sorting]
---

# Why merge sort still matters

Stable, O(n log n) worst case, parallelizable. The basis for every external sort and big-data sort. Quicksort is faster in cache for in-memory work but has O(n^2) worst case. Modern Timsort (Python's default) is a tuned merge sort with runs of insertion sort - best of both.
