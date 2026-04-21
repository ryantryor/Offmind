---
title: "JWT vs sessions: usually you want sessions"
date: 2025-12-25
category: security
tags: [auth]
---

# JWT vs sessions: usually you want sessions

JWTs sound stateless and modern but: hard to revoke, leak data in payload if not careful, often misused. Plain server-side sessions with a Redis session store work great for 95% of apps. Use JWT for: cross-service auth between machines, when you genuinely cannot maintain server state.
