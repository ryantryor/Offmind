---
title: "Background jobs: Celery vs RQ vs Dramatiq"
date: 2025-04-19
category: backend
tags: [python, queue, infra]
---

# Background jobs: Celery vs RQ vs Dramatiq

Celery: powerful, mature, complex. Use for serious workloads with scheduling, retries, chains. RQ: simple, Redis-backed, Pythonic. Great for small/medium apps. Dramatiq: middle ground, better defaults than Celery, type-friendly. My current default.
