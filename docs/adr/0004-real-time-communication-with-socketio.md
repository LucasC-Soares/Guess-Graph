# ADR-0004: Real-time communication with Socket.IO

- Status: Accepted
- Date: 2026-09-19

## Context

Creating a room, joining a match, answering questions, and updating turns are interactive events between two players. Polling would introduce unnecessary delay and complexity.

## Decision

Use Socket.IO between the frontend and backend. Each action has a named event, such as `room:create`, `room:join`, `game:ask-question`, and `game:make-guess`. The server emits state, response, and end-of-game events.

Event names are centralized in constants in each application and must remain synchronized.

On the frontend, there is a single socket per session. Creation, entry, question, guess, rematch, and close operations use Socket.IO acknowledgements; game mutations also apply an 8-second timeout. Hooks register listeners for room updates and remove those listeners in the effect cleanup.

## Alternatives considered

- REST with polling: simpler for isolated requests, but unsuitable for immediate updates on both clients.
- Pure WebSocket: would have less abstraction, but would require implementing features that Socket.IO already offers, such as rooms and acknowledgements.

## Consequences

- The server can emit the same change to both players.
- Socket.IO rooms map naturally to the room code.
- The frontend must remove listeners when hooks unmount to avoid duplication.
- The event contract becomes a public API between the two applications.
- The React Query cache is updated directly from the received events, keeping the screen synchronized without polling.
- Failures or missing acknowledgements reject the operation on the frontend and can be displayed as an action error.
