---
title: "Rate limiting: token bucket vs sliding window"
date: 2025-07-07
category: system-design
tags: [api, patterns]
---

# Rate limiting: token bucket vs sliding window

Token bucket: refills at rate R, requests consume tokens. Smooth, allows bursts up to bucket size. Sliding window: counts requests in last N seconds. Smoother than fixed windows but more memory. For most APIs, token bucket via Redis with INCR + TTL is enough.
