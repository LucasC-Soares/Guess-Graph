# ADR-0009: Layered tests independent from real Socket.IO

- Status: Accepted
- Date: 2026-09-19

## Context

Failures in graph rules and room transitions are different from transport failures. Testing everything through a real Socket.IO server would make the suite slow and harder to diagnose.

## Decision

Test in layers:

- property algorithms with small graphs and known oracles;
- `RoomsService` directly, covering room creation, join, hands, turn, and cleanup;
- `RoomsGateway` with real or mocked services and fake sockets/servers, covering payloads and broadcasts.

Jest uses `ts-jest` to run TypeScript tests in the backend.

## Alternatives considered

- Only end-to-end tests: would cover the flow, but with worse diagnosis and invariant coverage.
- Only unit tests: would leave the event contract unverified.

## Consequences

- Fast feedback and localized failures.
- The suite does not depend on real ports or WebSocket connections to validate rules.
- End-to-end tests will still be needed when the frontend and deployment are integrated.
