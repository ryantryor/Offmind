---
title: "Kubernetes troubleshooting: my standard checklist"
date: 2025-05-29
category: devops
tags: [k8s, debugging]
---

# Kubernetes troubleshooting: my standard checklist

1. kubectl get pods - look at status and restarts. 2. kubectl describe pod <name> - events at the bottom often tell you everything. 3. kubectl logs --previous if it's crashlooping. 4. exec in to check DNS, network, mounted configs. Most issues are: image pull, resource limits, missing secrets, or service selector mismatch.
