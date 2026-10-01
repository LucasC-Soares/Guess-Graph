# ADR-0001: Monorepo with frontend and backend separated

- Status: Accepted
- Date: 2026-09-19

## Context

The game has a web interface and an authoritative server for rooms and rules. The frontend and backend have different build cycles, dependencies, and responsibilities, but they need to evolve together during the MVP.

## Decision

Keep the frontend and backend in the same repository, in separate directories: `frontend/` and `backend/`.

The frontend uses Next.js and the backend uses NestJS. Each application keeps its own `package.json`, TypeScript configuration, and development commands.

## Alternatives considered

- Separate repositories: would increase the cost of synchronizing contracts and changes during the MVP.
- A single full-stack application: would mix UI, transport, and game rule responsibilities.

## Consequences

- The project has a single source of context and coordinated changes.
- Dependencies and pipelines remain isolated per application.
- Independent deployment is possible, but requires configuring both projects separately.
