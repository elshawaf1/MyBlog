---
title: 'Breadth-First Search'
slug: 'breadth-first-search'
status: published
visibility: public
collection: computer-science
tags: [algorithms, graphs, bfs]
excerpt: 'Level-order traversal with a queue, plus the shortest-path proof sketch.'
publishedAt: '2026-02-20'
allowIndex: true
pinned: false
---

BFS is the queue half of [[graph-traversal]]. It discovers vertices in
nondecreasing distance from the source, which is why the first visit to a
vertex yields a shortest path in unweighted graphs.

- Use a FIFO queue; mark visited **when enqueuing**, not when dequeuing.
- Bidirectional BFS meets in the middle for large graphs.
