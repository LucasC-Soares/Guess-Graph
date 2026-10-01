# ADR-0013: Hand size and vertex limit

- Status: Superseded by [ADR-0014](0014-reduction-of-the-vertex-limit.md)
- Date: 2026-09-20

## Context

Each player needs to receive a hand large enough to make deduction interesting. At the same time, very large graphs harm readability and interaction in the frontend visualization.

## Decision

Each hand will contain exactly 12 graphs. The number of vertices in each graph will be chosen randomly between 3 and 20, inclusive:

- `HAND_SIZE = 12`;
- `MIN_HAND_VERTEX_COUNT = 3`;
- `MAX_HAND_VERTEX_COUNT = 20`.

`GraphGeneratorService.generateHand()` centralizes this rule and is used both at the start of the match and during a rematch.

## Alternatives considered

- Three graphs with five vertices: too little variety and a match that is too short.
- A fixed vertex count: simplifies visualization, but reduces structural diversity.
- More than 20 vertices: increases visual cost and makes manual edge inspection harder.
- Variable hand sizes: makes comparison between players and match balancing less predictable.

## Consequences

- Matches have 12 candidates per player and more room for questions.
- The variation from 3 to 20 vertices creates graphs at different scales.
- The upper bound keeps the visualization within acceptable complexity for the frontend.
- The generator uses randomness; deterministic tests should use explicitly constructed graphs.

This decision was replaced by ADR-0014, which reduced the upper limit to 10 vertices.
