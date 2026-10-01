# ADR-0011: Graph filtering and end-of-game behavior

- Status: Accepted
- Date: 2026-09-20

## Context

The player needs to visualize the opponent's graphs to formulate questions. The public graph structure, such as vertices and edges, may be sent, but the properties computed by the server must remain private. The protocol also needs to inform which candidates were discarded by a question; returning only `answer` leaves the client without enough information to update the board.

## Decision

Send the opponent's public hand in `room:opponent-joined`, without `properties`. For each player, Redis keeps the secret graph and `remainingOpponentGraphIds`, initially containing all of the opponent's graphs.

A question contains only `question`. The server resolves the room and player from the socket, computes the answer against the secret graph, and removes candidates whose property does not match the answer. The response includes `eliminatedGraphIds`, `remainingGraphIds`, `remainingCount`, and `finished`.

A question that leaves one or more candidates does not end the match. Any valid `make-guess` ends the match immediately: a correct guess gives the win to the player who guessed, while an incorrect guess gives the win to the opponent.

## Alternatives considered

- Sending only `answer`: does not allow the client to update which graphs were discarded.
- Sending graph properties: would make deduction easier without questions and would reveal private information from the referee.
- Keeping a graph reference in the question payload: couples the client to the internal target and is unnecessary because the socket already identifies the room and player.
- Continuing the match after an incorrect guess: does not match the game rule, where a wrong guess gives the win to the opponent.

## Consequences

- The client can render the graphs and mark eliminations without receiving private properties.
- Redis also stores the remaining candidate set per player.
- The server remains the authority for answer generation, filtering, and ending the match.
- The question protocol remains small: only the question and its parameters.