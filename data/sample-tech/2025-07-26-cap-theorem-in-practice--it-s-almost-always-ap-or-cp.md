---
title: "CAP theorem in practice: it's almost always AP or CP"
date: 2025-07-26
category: system-design
tags: [distributed-systems, concepts]
---

# CAP theorem in practice: it's almost always AP or CP

Network partitions happen. You must choose what to give up: consistency or availability. AP systems (DynamoDB, Cassandra): always answer, may serve stale data. CP systems (Postgres in primary-only mode): refuse writes during partition rather than diverge. Pick AP for shopping carts, CP for bank balances.
