---
title: 'Retrieval Augmented Generation'
slug: 'retrieval-augmented-generation'
status: published
visibility: public
collection: ai-research
tags: [llm, rag, embeddings]
excerpt: 'Ground LLMs in your documents: chunk, embed, retrieve, generate.'
publishedAt: '2026-02-01'
allowIndex: true
pinned: false
---

RAG grounds a model like [[large-language-models]] in external documents
instead of relying purely on parametric memory.

## Pipeline

1. **Chunk** documents into passages (~512 tokens).
2. **Embed** passages with a dense encoder.
3. **Retrieve** top-$k$ passages by cosine similarity:

$$\text{sim}(q, d) = \frac{q \cdot d}{\lVert q \rVert \lVert d \rVert}$$

4. **Generate** conditioned on the retrieved context.

```ts
const passages = await retriever.search(query, { k: 5 });
const answer = await llm.generate({ prompt, context: passages });
```

The failure modes are worth naming: bad chunking, stale index, and
retrieved-but-ignored context.
