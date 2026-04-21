---
title: "UUIDs v7 are the new default"
date: 2026-03-16
category: backend
tags: [uuid, database]
---

# UUIDs v7 are the new default

v7 = timestamp-prefixed UUIDs, sortable by creation time, B-tree friendly. Replaces v4 (random) for primary keys - v4 destroys your index locality. Generate at the application layer; databases will eventually support natively.
