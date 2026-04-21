---
title: "React Server Components mental model"
date: 2025-02-24
category: frontend
tags: [react, rsc, nextjs]
---

# React Server Components mental model

RSC runs on the server, sends serialized output to the client. No JS shipped for that component. Can directly access DB/files. Cannot use useState or onClick - those are 'use client'. Think of RSC as the new default; client components as escape hatches for interactivity.
