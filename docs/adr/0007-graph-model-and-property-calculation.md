# ADR-0007: Graph model and property calculation

- Status: Accepted
- Date: 2026-09-19

## Context

The game asks about structural properties of small graphs. The representation must be simple to generate, serialize, and visualize, and the calculations need to be deterministic and independent of transport.

## Decision

Represent each graph as undirected, with integer vertices from `0` to `vertexCount - 1` and edges as pairs `[u, v]`. Each graph receives a stable `id`.

Compute the backend properties `isConnected`, `isBipartite`, `hasCycle`, `isTree`, `hasBridge`, `maxDegree`, and `minDegree`. The algorithms used are BFS/DFS, 2-coloring, and Tarjan low-link for bridges.

The generator uses simple random graphs, and the match enriches each graph with its properties before storing it in the hand.

## Alternatives considered

- Vertex and edge object representation: would be more verbose for the MVP.
- Calculation on the frontend: would conflict with server authority.
- External graph library: would add a dependency for a small and well-bounded domain.

## Consequences

- The model is compact and easy to send via Socket.IO.
- Algorithms can be tested with classic small graphs.
- The random generator needs invariant tests and, in the future, better controls for variety.
