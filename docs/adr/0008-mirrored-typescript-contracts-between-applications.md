# ADR-0008: Mirrored TypeScript contracts between applications

- Status: Accepted
- Date: 2026-09-19

## Context

The frontend and backend exchange graphs, room state, questions, and events, but they are currently two TypeScript projects with independent builds.

## Decision

Keep equivalent types on both sides, with frontend DTOs mirroring the backend interfaces. Event names are also centralized in local constants.

A shared package will not be introduced in the MVP.

On the frontend, domain types live in `src/types`, form payloads are inferred from Zod schemas, and event names live in `src/constants/config.ts`. The event list must continue to match the backend gateway `EVENTS` object.

## Alternatives considered

- An internal `shared` package: would reduce duplication, but would require configuring builds, path resolution, and versioning across both projects.
- Untyped contracts: would increase typo errors and silent incompatibilities.

## Consequences

- The MVP preserves independent builds and deployments.
- Any payload change requires updating both sides in the same change.
- Duplication is a known risk; a shared package becomes a candidate when the contract surface grows.
- Input validation happens on the client via Zod and React Hook Form, but it does not replace backend validation or authority.
- Protocol changes require reviewing frontend types, schemas, and constants alongside backend interfaces and events.
