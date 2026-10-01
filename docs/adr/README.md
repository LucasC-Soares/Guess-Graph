# Architecture Decision Records

This directory records the architectural decisions for Guess Graph. Each ADR documents an accepted decision, its context, and its consequences.

## Index

- [ADR-0001: Monorepo with separate frontend and backend](0001-monorepo-frontend-backend-separated.md)
- [ADR-0002: Modular backend with NestJS](0002-backend-modular-with-nestjs.md)
- [ADR-0003: Frontend Next.js App Router organized by features](0003-frontend-nextjs-app-router-features.md)
- [ADR-0004: Real-time communication with Socket.IO](0004-real-time-communication-with-socketio.md)
- [ADR-0005: In-memory room state in the MVP (superseded)](0005-in-memory-room-state-in-the-mvp.md)
- [ADR-0006: Server as the authority of the game](0006-server-as-authority-of-the-game.md)
- [ADR-0007: Graph model and property calculation](0007-graph-model-and-property-calculation.md)
- [ADR-0008: Mirrored TypeScript contracts between applications](0008-mirrored-typescript-contracts-between-applications.md)
- [ADR-0009: Layered tests independent from real Socket.IO](0009-layered-tests-independent-from-real-socketio.md)
- [ADR-0010: Ephemeral room state in Redis](0010-ephemeral-room-state-in-redis.md)
- [ADR-0011: Graph filtering and end-of-game behavior](0011-graph-filtering-and-end-of-game-behavior.md)
- [ADR-0012: Room shutdown and rematch by consensus](0012-room-shutdown-and-rematch-by-consensus.md)
- [ADR-0013: Hand size and vertex limit (superseded)](0013-hand-size-and-vertex-limit.md)
- [ADR-0014: Reduction of the vertex limit](0014-reduction-of-the-vertex-limit.md)
- [ADR-0015: Session state and frontend location decisions](0015-session-state-and-frontend-location-decisions.md)
- [ADR-0016: Unique-signature guarantee in graph hands](0016-unique-signature-guarantee-in-graph-hands.md)
- [ADR-0017: Shared hand with a secret graph per player](0017-shared-hand-with-a-secret-graph-per-player.md)
- [ADR-0018: Room session in `sessionStorage`, not `localStorage`](0018-room-session-in-sessionstorage-not-localstorage.md)

## How to add an ADR

1. Use the next sequential number.
2. Write the context before the decision.
3. Record relevant alternatives and consequences.
4. Update this index.
