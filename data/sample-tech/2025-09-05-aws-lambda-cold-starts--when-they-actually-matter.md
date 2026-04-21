---
title: "AWS Lambda cold starts: when they actually matter"
date: 2025-09-05
category: cloud
tags: [aws, lambda, performance]
---

# AWS Lambda cold starts: when they actually matter

Cold starts: 100ms-2s first invocation. Provisioned concurrency eliminates them but costs money. Real impact for user-facing APIs; near-zero impact for async/scheduled jobs. Reduce cold start: smaller packages, no heavy imports at module level, use ARM Graviton.
