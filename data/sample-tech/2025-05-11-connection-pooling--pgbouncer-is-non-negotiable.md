---
title: "Connection pooling: PgBouncer is non-negotiable"
date: 2025-05-11
category: database
tags: [postgres, infra]
---

# Connection pooling: PgBouncer is non-negotiable

Postgres connections are expensive (~10MB each, fork overhead). Don't open 1000 from your app. PgBouncer in transaction mode multiplexes thousands of client connections onto dozens of real ones. Critical for serverless deployments where every request might spin up a new connection.
