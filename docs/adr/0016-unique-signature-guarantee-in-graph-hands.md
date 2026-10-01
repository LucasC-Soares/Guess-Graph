# ADR-0016: Unique-signature guarantee in graph hands

- Status: Accepted
- Date: 2026-09-26

## Context

A player tries to guess the graph chosen by the opponent within a hand of 12 graphs, eliminating candidates through yes/no questions about properties such as `isConnected`, `isBipartite`, `hasCycle`, `isTree`, `hasBridge`, and "is the maximum degree greater than k?", with k ranging from 0 to 10. The minimum degree (`minDegree`) is calculated but not asked.

Because `isTree` is fully derived from `isConnected && !hasCycle`, and the maximum-degree questions cover every value from 0 to 9 (the maximum possible given hand size), the set of available questions effectively defines a graph signature: `(isConnected, isBipartite, hasCycle, hasBridge, maxDegree)`.

If two graphs in the same hand have identical signatures, no sequence of questions can distinguish them — the match has no deterministic solution for that pair, even if the player plays perfectly.

## Decision

`GraphGeneratorService.generateHand` now calculates the signature of each generated graph (via `GraphPropertiesService`) and regenerates the candidate while the signature collides with one already present in the hand, up to a limit of 200 attempts per card — high enough for the available signature space (up to 16 boolean combinations × 10 degree values), but preventing infinite loops in degenerate scenarios. If the limit is reached, the service throws an explicit error instead of delivering an ambiguous hand.

This requires `GraphGeneratorService` to receive `GraphPropertiesService` through dependency injection in the constructor.

`generateBatch`, used for ad hoc generation outside the hand context, does not receive this guarantee — signature uniqueness only makes sense within the same hand.

## Alternatives considered

- Ignoring the collision and handling it in the game (for example, signaling a round as "impossible to close"): pushes the problem to UX and still allows the match to stall without a correct answer.
- Only increasing the variety of generated graphs (more vertices, different probabilities) without explicit checking: reduces the chance of collision, but does not guarantee uniqueness.
- Adding `minDegree` as an available question to increase distinguishing power: would change the rules of the game (which questions exist), which is outside the scope of this decision.

## Consequences

- `GraphGeneratorService` now depends on `GraphPropertiesService`; both need to be registered in the same Nest module.
- Hand generation may require a few extra attempts per card until a unique signature is found, but the cost is negligible relative to the size of the signature space.
- In the extreme case of exhausting the signature space, the service fails explicitly instead of serving a hand with indistinguishable graphs.
- Any future change to the questions available in the game (adding, removing, or changing the range of "maximum degree > k") must update `computeSignature` so it continues to reflect exactly what is askable.