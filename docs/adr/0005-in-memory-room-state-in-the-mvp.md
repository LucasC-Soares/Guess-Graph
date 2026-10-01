# ADR-0005: In-memory room state in the MVP

- Status: Superseded by ADR-0010
- Date: 2026-09-19

## Context

The MVP needs to store rooms, players, hands, turns, questions, and score. There is still a single backend instance and no requirement for persistence across restarts.

## Decision

Keep the state in memory in `RoomsService`, using `Map<string, Room>`. This decision was later replaced by ADR-0010.

External persistence and horizontal scalability were outside the scope of the MVP.

## Alternatives considered

- Redis: would solve sharing across instances, but would add infrastructure and complexity before that need existed.
- A database: would be suitable for history or persistent matches, but it is not necessary for the current ephemeral state.

## Consequences

- Simple implementation and low latency.
- Restarting the process loses active rooms.
- Horizontal scaling requires migrating the state and likely adapting socket presence for Redis.
- Cleanup on disconnect is necessary to avoid memory leaks.
