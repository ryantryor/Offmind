---
title: "Secrets management: stop putting them in env vars"
date: 2025-12-29
category: security
tags: [secrets, infra]
---

# Secrets management: stop putting them in env vars

Env vars leak: process listings, debugger output, error tracking. Worse, they can't be rotated without restart. Use a secrets manager (AWS Secrets Manager, Vault, doppler) and fetch at runtime. For dev, .env files locally with a .env.example checked in - never commit the real .env.
