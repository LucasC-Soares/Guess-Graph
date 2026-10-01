# ADR-0014: Reduction of the vertex limit

- Status: Accepted
- Date: 2026-09-20
- Replaces: [ADR-0013](0013-hand-size-and-vertex-limit.md)

## Context

ADR-0013 established hands with 12 graphs and between 3 and 20 vertices per graph. Real usage showed that the upper limit of 20 still produced graphs that were too large to read and interact with during a match.

## Decision

Keep the hand size at 12 graphs and reduce the allowed range to 3 to 10 vertices, inclusive:

- `HAND_SIZE = 12`;
- `MIN_HAND_VERTEX_COUNT = 3`;
- `MAX_HAND_VERTEX_COUNT = 10`.

`GraphGeneratorService.generateHand()` remains the source of this rule for both initial generation and rematches.

## Consequences

- Matches retain 12 candidates per player.
- Visualization becomes more readable and edge inspection requires less space.
- Structural variety remains, but very large graphs are no longer generated.