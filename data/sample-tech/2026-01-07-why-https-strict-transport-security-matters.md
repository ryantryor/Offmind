---
title: "Why HTTPS Strict Transport Security matters"
date: 2026-01-07
category: security
tags: [web, security]
---

# Why HTTPS Strict Transport Security matters

HSTS header tells browsers: only ever connect over HTTPS to this domain. Prevents downgrade attacks and stripping proxies. Set max-age to at least 6 months. Add to preload list (hstspreload.org) for browser-baked-in protection. Caveat: once you preload, you cannot easily go back to HTTP.
