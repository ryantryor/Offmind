---
title: "Event sourcing: powerful, dangerous, often overkill"
date: 2025-07-15
category: system-design
tags: [architecture, patterns]
---

# Event sourcing: powerful, dangerous, often overkill

Store every state change as an immutable event. Reconstruct state by replaying events. Wins: audit trail, time travel, easy CQRS. Loses: schema evolution is hard, queries need projections. Use it for accounting, regulated domains, audit-heavy workflows. Don't use it for a CRUD app.
