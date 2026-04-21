---
title: "Why message queues beat synchronous calls between services"
date: 2025-07-22
category: system-design
tags: [architecture, queue]
---

# Why message queues beat synchronous calls between services

Synchronous: caller blocks, fails together, requires both up. Async via queue: caller fires-and-forgets, service can be down for hours, retries free. Use sync for read paths where you need immediate response. Use async for any state-changing side effects.
