# ADR-0002: Modular backend with NestJS

- Status: Accepted
- Date: 2026-09-19

## Context

The game rules involve graphs, questions, and rooms. The WebSocket transport needs access to these rules without concentrating all logic in a single gateway.

## Decision

Use NestJS as the backend runtime and separate the domain into the `graphs`, `questions`, and `rooms` modules.

- `graphs` contains generation, types, and property calculation.
- `questions` defines the catalog and referee for questions.
- `rooms` owns match state and the Socket.IO gateway.

NestJS services are injected into the gateway instead of the gateway creating dependencies manually.

## Alternatives considered

- A Socket.IO server without modularization: would have a simpler initial structure, but would couple transport and rules.
- Putting all rules in `RoomsGateway`: would make testing and future transport changes harder.

## Consequences

- Pure rules can be tested without a real socket.
- Modules have clear boundaries and can evolve independently.
- The backend adopts NestJS conventions and lifecycle.
