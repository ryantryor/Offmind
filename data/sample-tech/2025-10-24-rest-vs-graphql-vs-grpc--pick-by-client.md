---
title: "REST vs GraphQL vs gRPC: pick by client"
date: 2025-10-24
category: backend
tags: [api, architecture]
---

# REST vs GraphQL vs gRPC: pick by client

REST: best for public APIs, broad ecosystem, cacheable. GraphQL: best for diverse clients (mobile + web), single endpoint, client picks fields. gRPC: best for service-to-service, type-safe, fast over the wire. Don't use GraphQL for an API only your own backend consumes - REST is simpler.
