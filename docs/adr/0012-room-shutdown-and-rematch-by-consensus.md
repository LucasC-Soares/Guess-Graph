# ADR-0012: Room shutdown and rematch by consensus

- Status: Accepted
- Date: 2026-09-20

## Context

A room represents a single match at a time. After `FINISHED`, players need to be able to close the room or propose a rematch without creating another code or restarting the match unilaterally.

## Decision

Add `room:close` to remove the room from Redis and emit `room:closed` to participants.

Add `game:rematch` without a payload. Each player registers its vote in Redis state. The rematch only starts when `player1` and `player2` agree. At that point, the server resets hands, score, history, candidates, and votes, generates new hands, and starts another match in the same room with `currentTurn: player1`.

## Alternatives considered

- Restarting with the first player who asks: would allow changing the match against the other player's will.
- Creating a new room for the rematch: would require sharing another code and would lose session continuity.
- Keeping the finished room without actions: would prevent a convenient rematch between the same players.

## Consequences

- The room remains a session unit but can contain sequential matches by consensus.
- Rematch state is shared in Redis and works across backend instances.
- The client must handle the states `WAITING_FOR_REMATCH`, `IN_PROGRESS`, `FINISHED`, and `room:closed`.