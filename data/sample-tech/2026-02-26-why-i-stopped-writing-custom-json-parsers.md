---
title: "Why I stopped writing custom JSON parsers"
date: 2026-02-26
category: backend
tags: [python, json]
---

# Why I stopped writing custom JSON parsers

orjson is 10x faster than stdlib json, handles datetime/UUID natively. msgspec is even faster + does validation. Stop writing custom encoders unless you have a truly weird format.
