# ADR-0006: Server as the authority of the game

- Status: Accepted
- Date: 2026-09-19

## Context

Questions depend on structural properties of graphs, and the client cannot be trusted to calculate answers, turns, or score.

## Decision

The backend generates the hands, calculates `GraphProperties`, validates the active player, answers questions, and updates the match score and status. The client sends only the intention of the action and renders the events it receives.

Internal properties are not sent in the opponent hand payload; the gateway sends only the public graph DTO.

## Alternatives considered

- Calculating answers on the frontend: would reduce server work, but would allow tampering and expose rule implementation details.
- Trusting the client for turn and score: would reduce validation, but would allow out-of-order play or fabricated wins.

## Consequences

- Rules remain consistent for both players.
- The backend must maintain the calculated properties during the match.
- The frontend must treat events as the source of truth for visible state.
