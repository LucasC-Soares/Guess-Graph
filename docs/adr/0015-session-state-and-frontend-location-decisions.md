# ADR-0015: Session state and frontend location decisions

- Status: Accepted
- Date: 2026-09-20

## Context

The frontend must preserve the room during navigation, rebuild the screen from server events, and support players in Portuguese and English. The MVP does not need account persistence or an external i18n library.

## Decision

Keep only the minimal room session in `localStorage`: room code, player name, and role. The state received during entry or reconnection is kept temporarily until it is consumed by the room page.

Use a typed local catalog with the languages `pt` and `en`, exposed via `I18nProvider` and `useI18n`. Questions use a typed table mapping each `QuestionType` to a translation key.

Do not persist match state in the browser. After the room is mounted, the frontend must rebuild the match from the events and state sent by the server.

## Alternatives considered

- Persisting the entire match in `localStorage`: could display stale state and duplicate the authority of the server.
- Using a full i18n library: would add unnecessary configuration and dependencies for two languages and a small catalog.
- Requiring an account to recover the room: would increase MVP scope without improving the current code-invitation flow.

## Consequences

- The room page can be reloaded or accessed directly while the local session remains available.
- The server remains the source of truth for room, turn, candidates, and result.
- Adding a language requires completing the catalog and keeping translation keys compatible.
- `localStorage` must be treated as untrusted input and should not contain private graph properties.