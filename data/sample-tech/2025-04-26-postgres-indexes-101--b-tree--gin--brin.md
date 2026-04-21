---
title: "Postgres indexes 101: B-tree, GIN, BRIN"
date: 2025-04-26
category: database
tags: [postgres, indexes]
---

# Postgres indexes 101: B-tree, GIN, BRIN

B-tree: default, great for equality and range. Most queries want this. GIN: inverted index for arrays, jsonb, full-text. Use for tag containment, jsonb keys. BRIN: tiny index for naturally-ordered data (timestamps, sequential IDs). Each index costs writes - audit unused ones quarterly.
