---
title: 'Large Language Models: a working mental model'
slug: 'large-language-models'
status: published
visibility: public
collection: ai-research
tags: [llm, transformers, eval]
excerpt: 'How modern LLMs work, how to evaluate them, and where RAG fits in.'
publishedAt: '2026-01-10'
allowIndex: true
pinned: true
---

Modern language models are **next-token predictors** trained at scale. The core
architecture is the Transformer — see [[breadth-first-search]] for an unrelated
but beloved algorithm, and [[retrieval-augmented-generation]] for grounding
models in your own data.

## ThePieces

| Piece | Role |
| ----- | ---- |
| Attention | Routes information between tokens |
| MLP | Stores factual associations |
| Embeddings | Maps tokens to vectors |

## Evaluation

A minimal eval loop looks like this:

```python
for prompt, expected in dataset:
    out = model.generate(prompt)
    score = judge(out, expected)
    log(prompt, out, score)
```

Model quality often follows a scaling law of the form $L(N) = aN^{-b} + c$,
where $N$ is parameter count.

## Checklist

- [x] Understand attention
- [x] Run a small eval
- [ ] Try [[retrieval-augmented-generation]] on private docs
