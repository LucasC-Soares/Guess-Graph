# ADR-0017: Shared hand with a secret graph per player

- Status: Accepted
- Date: 2026-09-26

## Context

Each player received its own hand of 12 graphs, and the opponent tried to guess an "active" graph within that private hand (`PlayerState.hand` + `activeOpponentGraphId`). This caused two problems:

- The eliminated IDs from questions asked by the opponent belonged to the player's own hand — a hand that they never receive from the server. The question log had no way to map those IDs to a card number, showing `#?` in those entries.
- The remaining counter (`remainingGraphIds`) was calculated from a different copied hand per direction, without a single shared source between both clients.

A match ends on the first guess, right or wrong — there is no sequential progression through multiple targets in the same match.

## Decision

The room now has a single shared hand (`Room.hand`, 12 graphs), sent identically to both players. When the hand is built (second player entry or rematch), two distinct indices are randomly selected as each player's `secretGraphId` — the graph the opponent needs to guess.

The target for each player (`getActiveOpponentGraph`) now always equals the opponent's `secretGraphId`, fixed for the entire match. `remainingOpponentGraphIds` is filtered against the shared hand, so the remaining counter reflects the same source on both sides.

## Alternatives considered

- Keeping private hands and mapping IDs between them for the question log: would require a per-player ID translation table, adding complexity without need.
- Keeping the "remaining" state only on the client, recalculated locally from the log: would be subject to divergence between clients; the server already has the information and should be the single source of truth.

## Consequences

- `PlayerState.hand` no longer exists; `PlayerState.activeOpponentGraphId` becomes `secretGraphId`.
- `RoomsService.getOnlyRemainingOpponentGraph` and `advanceActiveOpponentGraph` were removed — they depended on the private hand and sequential progression through several targets that do not exist in the game.
- The payload emitted to the frontend swaps `opponentHand` for `hand` (shared) and gains `yourGraphId`.
- A hand with fewer than 2 graphs does not allow drawing two distinct secrets; `GraphGeneratorService.HAND_SIZE` must remain `>= 2`.
