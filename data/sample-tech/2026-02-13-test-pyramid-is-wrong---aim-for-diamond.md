---
title: "Test pyramid is wrong - aim for diamond"
date: 2026-02-13
category: career
tags: [testing]
---

# Test pyramid is wrong - aim for diamond

Pyramid: lots of unit, some integration, few e2e. Reality for modern services: e2e tests are cheap with Playwright, integration tests catch real bugs (DB, API contract), unit tests over-mock and miss things. Diamond: medium unit, lots of integration, medium e2e. Better catches per dollar.
