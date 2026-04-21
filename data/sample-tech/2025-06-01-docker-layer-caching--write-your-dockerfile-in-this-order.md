---
title: "Docker layer caching: write your Dockerfile in this order"
date: 2025-06-01
category: devops
tags: [docker, performance]
---

# Docker layer caching: write your Dockerfile in this order

Cache invalidates from the first changed line down. Order: base image, system deps, language deps, source code. For Node: COPY package*.json before npm install, then COPY . later. Saves minutes on rebuilds. Use multi-stage builds to ditch build deps from the final image.
