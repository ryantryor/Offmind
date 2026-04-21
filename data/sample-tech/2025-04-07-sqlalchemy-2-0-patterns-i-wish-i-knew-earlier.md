---
title: "SQLAlchemy 2.0 patterns I wish I knew earlier"
date: 2025-04-07
category: backend
tags: [python, sqlalchemy, orm]
---

# SQLAlchemy 2.0 patterns I wish I knew earlier

Use the new Mapped[] type annotations - editor support is dramatically better. Prefer select() over query() everywhere. Use selectinload() for one-to-many to avoid N+1. Always wrap writes in `with Session.begin():` for explicit transactions.
