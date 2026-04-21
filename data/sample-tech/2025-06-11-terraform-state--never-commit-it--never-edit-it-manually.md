---
title: "Terraform state: never commit it, never edit it manually"
date: 2025-06-11
category: devops
tags: [terraform, iac]
---

# Terraform state: never commit it, never edit it manually

State file holds everything: passwords, IPs, secrets. Store in encrypted S3 with DynamoDB locking, or use Terraform Cloud. Use workspaces to separate dev/staging/prod. If state drifts, use terraform import - never edit the JSON.
