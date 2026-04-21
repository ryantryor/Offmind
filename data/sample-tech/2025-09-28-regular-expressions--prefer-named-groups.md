---
title: "Regular expressions: prefer named groups"
date: 2025-09-28
category: tools
tags: [regex]
---

# Regular expressions: prefer named groups

(?P<year>\d{4})-(?P<month>\d{2}) is dramatically more readable than \d{4}-\d{2}. Future-you accessing match['year'] beats match[1] every time. Compile once, reuse - re.compile() is not free.
