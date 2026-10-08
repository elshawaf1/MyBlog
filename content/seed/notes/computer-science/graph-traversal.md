---
title: 'Graph Traversal: BFS and DFS'
slug: 'graph-traversal'
status: published
visibility: public
collection: computer-science
tags: [algorithms, graphs]
excerpt: 'Two ways to walk a graph, their costs, and when to pick each.'
publishedAt: '2026-02-15'
allowIndex: true
pinned: false
---

Given a graph $G = (V, E)$, traversal visits every reachable vertex.
[[breadth-first-search]] explores level by level; depth-first search dives deep.

| Algorithm | Time | Space | Finds shortest path |
| --------- | ---- | ----- | ------------------- |
| BFS | $O(V + E)$ | $O(V)$ | Yes (unweighted) |
| DFS | $O(V + E)$ | $O(V)$ | No |

```python
from collections import deque

def bfs(graph, start):
    seen, q = {start}, deque([start])
    while q:
        v = q.popleft()
        yield v
        for w in graph[v]:
            if w not in seen:
                seen.add(w)
                q.append(w)
```
