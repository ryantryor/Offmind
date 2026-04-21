---
title: "Time zones: just use UTC everywhere internally"
date: 2026-03-09
category: backend
tags: [fundamentals]
---

# Time zones: just use UTC everywhere internally

Store UTC. Display in user's local time at the edge. The number of bugs from doing this wrong is enormous. Datetime arithmetic across DST is full of traps - use a library (zoneinfo, luxon, etc.), don't do it yourself.
