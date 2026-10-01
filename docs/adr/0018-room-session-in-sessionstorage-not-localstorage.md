# ADR-0018: Room session in `sessionStorage`, not `localStorage`

- Status: Accepted
- Date: 2026-09-26

## Context

ADR-0015 defined keeping the minimal room session in `localStorage` (room code, player name, and role) to allow reloading or directly accessing the room page. `localStorage` is shared across all tabs of the same origin, not per tab.

This breaks in a concrete scenario: host and guest opened in two tabs of the same browser. The two calls to `saveRoomSession` write to the same key — the second overwrites the first, and both tabs start reading the same session (the one from the player who entered last). A reload in both tabs makes both attempt to resume the room as the same player; the other player is never claimed and ends up being removed due to inactivity, dropping the room to `WAITING_FOR_PLAYER` for both.

## Decision

Replace `localStorage` with `sessionStorage` in `saveRoomSession`, `restoreRoomSession`, and `clearRoomSession`. `sessionStorage` has the same API, but it is isolated per tab even within the same origin and survives a refresh — which is exactly the use case that motivated storing the session in the browser.

## Alternatives considered

- Manual namespacing of the key per tab (for example, including a tab ID generated in `sessionStorage` only to disambiguate the `localStorage` key): solves the same problem with more complexity, since `sessionStorage` already does this natively.
- Keeping `localStorage` and solving the collision on the server (for example, `RESUME_ROOM` rejecting if the `socketId` already belongs to another role): does not solve the root cause — both tabs continue competing for the same local session, it only pushes the symptom to the backend.

## Consequences

- Closing the tab for real (not a reload) loses the room session — unlike `localStorage`, which would persist indefinitely. This is the correct behavior here: a room session is inherently per tab, not something that should survive after the tab is closed.
- This decision replaces, in this specific point, what ADR-0015 stated about `localStorage` storing the room session. The rest of ADR-0015 (not persisting match state and treating browser storage as untrusted input) remains valid.
