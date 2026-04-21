---
title: "Consistent hashing: how distributed caches actually work"
date: 2025-08-16
category: algorithms
tags: [distributed-systems, data-structures]
---

# Consistent hashing: how distributed caches actually work

Hash both keys and servers onto a ring. Each key goes to the next server clockwise. Adding/removing a server only re-maps a fraction of keys. Used by every modern distributed cache, sharded DB, CDN. Virtual nodes (each server represented by ~150 ring positions) smooths the load distribution.
