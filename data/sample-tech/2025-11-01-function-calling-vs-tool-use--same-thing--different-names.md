---
title: "Function calling vs tool use: same thing, different names"
date: 2025-11-01
category: ai
tags: [llm, agents]
---

# Function calling vs tool use: same thing, different names

OpenAI calls it function calling, Anthropic calls it tool use. Both are: model returns structured JSON indicating it wants to call a function with specific args. You execute, return result, model continues. Critical for agents. Always validate the JSON - models occasionally hallucinate field names.
