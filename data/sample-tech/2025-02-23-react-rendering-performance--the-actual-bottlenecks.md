---
title: "React rendering performance: the actual bottlenecks"
date: 2025-02-23
category: frontend
tags: [react, performance, optimization]
---

# React rendering performance: the actual bottlenecks

Profile first. Common real causes: (1) unmemoized children re-rendering when parent state changes, (2) inline object/array literals breaking shallow equality, (3) context value changing every render. useMemo and React.memo help, but the bigger wins are usually colocating state and lifting it less.
