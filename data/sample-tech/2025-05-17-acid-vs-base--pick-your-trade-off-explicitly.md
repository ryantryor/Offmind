---
title: "ACID vs BASE: pick your trade-off explicitly"
date: 2025-05-17
category: database
tags: [database, concepts]
---

# ACID vs BASE: pick your trade-off explicitly

ACID: atomicity, consistency, isolation, durability. What you want for money. BASE: basically available, soft state, eventual consistency. What you tolerate for global scale. Most apps don't need BASE - they think they need 'NoSQL' but really need a tuned Postgres.
