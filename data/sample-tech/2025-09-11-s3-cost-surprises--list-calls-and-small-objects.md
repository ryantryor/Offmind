---
title: "S3 cost surprises: list calls and small objects"
date: 2025-09-11
category: cloud
tags: [aws, s3, cost]
---

# S3 cost surprises: list calls and small objects

Storage is cheap. Requests aren't - LIST especially. Avoid scanning a bucket on hot paths. Many tiny files cost more in PUT/GET than fewer big files. Consider concatenating logs before upload. Lifecycle policies to Intelligent-Tiering will save 20-40% on stale data.
