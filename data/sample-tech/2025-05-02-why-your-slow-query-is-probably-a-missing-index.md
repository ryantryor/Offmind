---
title: "Why your slow query is probably a missing index"
date: 2025-05-02
category: database
tags: [postgres, performance]
---

# Why your slow query is probably a missing index

EXPLAIN ANALYZE is your friend. Look for Seq Scan on big tables - usually fixable with an index. Don't blindly add indexes; they slow writes. Use pg_stat_statements to find the actual hot queries. Composite indexes need columns in the right order: (a, b) helps `WHERE a=? AND b=?` but not `WHERE b=?`.
