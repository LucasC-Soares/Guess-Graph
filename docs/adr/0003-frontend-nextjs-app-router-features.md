# ADR-0003: Frontend Next.js App Router organized by features

- Status: Accepted
- Date: 2026-09-19

## Context

The interface has different flows for creating/joining a room and playing. Generic UI components should not carry feature-specific rules.

## Decision

Use Next.js with the App Router and organize code by responsibility:

- `app/` defines routes and pages.
- `app/room/[code]` represents a room route and delegates the match experience to the game feature.
- `components/ui/` contains generic components.
- `features/room/` contains room creation and entry flows.
- `features/game/` contains match state, questions, visualization, and the question log.
- `lib/`, `schemas/`, and `types/` contain frontend infrastructure, validation, and contracts.
- Components that use hooks, Socket.IO, or context are marked as Client Components; the root layout composes the providers only.
- Server state for rooms and matches lives in the React Query cache, updated by Socket.IO events, without introducing a global domain store.

## Alternatives considered

- Organizing everything by type (`components/`, `hooks/`, `api/`): would spread each feature across many folders.
- A SPA without the App Router: would lose the route convention and composition patterns adopted by the project.

## Consequences

- Code related to a user journey stays close together.
- Shared components can be extracted without creating domain dependencies.
- Game state remains dependent on server events, but the React Query cache provides a single local source for rendering and mutations.
- The separation between Server Components and Client Components becomes explicit at route, provider, and hook boundaries.
