---
title: "Bloom filters: 10 lines of code, huge wins"
date: 2025-07-30
category: algorithms
tags: [data-structures]
---

# Bloom filters: 10 lines of code, huge wins

Probabilistic set membership. Constant memory regardless of items. False positives possible, false negatives impossible. Classic uses: 'do we have this URL crawled?', 'is this username taken?' check before hitting DB. Tune false positive rate by sizing the bit array - 1% FPR needs about 10 bits per item.
