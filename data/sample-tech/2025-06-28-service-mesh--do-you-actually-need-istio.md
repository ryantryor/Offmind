---
title: "Service mesh: do you actually need Istio?"
date: 2025-06-28
category: devops
tags: [k8s, service-mesh]
---

# Service mesh: do you actually need Istio?

Service mesh gives you mTLS, retries, traffic splitting, observability - but at significant complexity cost. Worth it: large multi-team K8s cluster, strict compliance, complex traffic patterns. Not worth it: small team, <20 services, no compliance reqs. Linkerd is much simpler than Istio.
