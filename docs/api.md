# Guess Graph API

## Overview

The backend exposes:

- **Socket.IO**: protocol used by the game to create rooms, join matches, ask questions, and guess graphs.

The game API is event-driven. The client sends an action, and the server responds with the event acknowledgement and/or an event emitted to the participants in the room.

## Run locally

In the `backend/` directory:

```bash
npm install
npm run start:dev
```

The backend requires Redis to be available at `REDIS_URL` (default:
`redis://localhost:6379`).

With the backend running at `http://localhost:3001`:

- Socket.IO: `http://localhost:3001`

The port can be changed with `PORT`. The allowed origin can be changed with `FRONTEND_URL`.

## Socket.IO connection

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false,
});

socket.connect();
```

The client should keep a single socket instance per session. After entering or creating a room, register the server event listeners and remove them when the screen unmounts.

## Events sent by the client

### `room:create`

Creates a room and places the socket in the Socket.IO room.

Payload:

```json
{
  "username": "Alice"
}
```

Successful acknowledgement:

```json
{
  "code": "K7M2Q",
  "status": "WAITING_FOR_PLAYER"
}
```

Example:

```ts
socket.emit('room:create', { username: 'Alice' }, (response) => {
  console.log(response.code);
});
```

### `room:join`

Joins a room that is still waiting for the second player. Once entry is completed, the server creates both hands and emits `room:opponent-joined` to both players.

Payload:

```json
{
  "code": "K7M2Q",
  "username": "Bob"
}
```

Acknowledgement:

```json
{
  "code": "K7M2Q",
  "status": "IN_PROGRESS"
}
```

### `game:ask-question`

Asks a question about the opponent's secret graph. The room and player are resolved from the associated socket; the client does not send or reference the opponent graph.

Payload:

```json
{
  "question": {
    "type": "IS_TREE"
  }
}
```

Parameterized question:

```json
{
  "type": "MAX_DEGREE_GREATER_THAN",
  "params": {
    "threshold": 2
  }
}
```

Acknowledgement:

```json
{
  "answer": true,
  "eliminatedGraphIds": ["graph-2"],
  "remainingGraphIds": ["graph-1"],
  "remainingCount": 1,
  "finished": true,
  "currentTurn": "player2"
}
```

`eliminatedGraphIds` lists the graphs whose property did not match the answer.
`remainingGraphIds` lists the candidates still possible. The same result is emitted to both sockets in `game:question-answered`.

### `game:make-guess`

Guesses the identity of the active target. The target is resolved by the server from the room and the player; `guessedGraphId` is the guessed identity.

Payload:

```json
{
  "guessedGraphId": "graph-guessed"
}
```

Acknowledgement:

```json
{
  "correct": false,
  "finished": true,
  "score": 0
}
```

Any valid `make-guess` ends the match immediately. If `correct` is `true`, the player who guessed wins; if `false`, the opponent wins.

### `game:rematch`

Requests a rematch. It has no payload. The match only restarts when both players emit the event.

While waiting for the other player, the acknowledgement is:

```json
{
  "accepted": false,
  "status": "WAITING_FOR_REMATCH"
}
```

When both agree, the server generates new hands, resets the score and history, restores `IN_PROGRESS`, and emits `room:opponent-joined` again.

### `room:close`

Closes and removes the room. It has no payload and can be sent by any player connected to the room.

## Events emitted by the server

### `room:opponent-joined`

Emitted individually to each player when the room becomes complete. The event only reports the match state; no graph, reference, or property is sent.

```json
{
  "status": "IN_PROGRESS",
  "currentTurn": "player1",
  "yourRole": "player1"
}
```

The secret graph and the remaining candidate set are kept exclusively in the room state in Redis. The client receives the public structure so it can render the graphs, but never receives the calculated properties.

A question never ends the match. The room only ends when `game:make-guess` is sent on the correct turn and `guessedGraphId` matches the graph the server is checking, regardless of how many candidates remain.

### `game:question-answered`

```json
{
  "question": {
    "type": "IS_CONNECTED"
  },
  "answer": true,
  "currentTurn": "player2"
}
```

### `room:updated`

May be emitted after a guess, updating turn and score, or when a player disconnects.

After a guess:

```json
{
  "currentTurn": "player2",
  "score": 1
}
```

After a disconnect:

```json
{
  "status": "WAITING_FOR_PLAYER"
}
```

### `game:over`

```json
{
  "winner": "player1",
  "score": 0,
  "correct": false
}
```

### `room:closed`

Emitted to players when the room is closed and removed from Redis.

## Question types

| Type | Parameters | Meaning |
| --- | --- | --- |
| `IS_CONNECTED` | none | Is the graph connected? |
| `IS_BIPARTITE` | none | Is the graph bipartite? |
| `HAS_CYCLE` | none | Does the graph contain a cycle? |
| `IS_TREE` | none | Is the graph a tree? |
| `HAS_BRIDGE` | none | Does the graph contain a bridge? |
| `MAX_DEGREE_GREATER_THAN` | `params.threshold` | Is the maximum degree greater than the threshold? |

## Public graph model

```ts
interface Graph {
  id: string;
  vertexCount: number;
  edges: [number, number][];
}
```

Vertices are integers from `0` to `vertexCount - 1`. Edges are undirected and appear as pairs of vertices.

## Turn rules

1. A room is created with status `WAITING_FOR_PLAYER`.
2. The second player changes the status to `IN_PROGRESS`.
3. The match starts with `currentTurn: "player1"`.
4. Valid questions record an entry in the log and switch the turn.
5. Valid guesses switch the turn when the match is not over.
6. A player who is not currently taking their turn receives an error and the action does not alter the state.
7. A room has only one active match at a time; rematches restart the same room only with agreement from both players.

## Errors

The NestJS handler may reject an event with messages such as:

- `Room not found`
- `The room is already full or in progress`
- `It is not this player's turn`
- `Graph not found`
- `Name and socket are required`

The client should handle acknowledgement failure or the Socket.IO error mechanism without assuming the action was applied.
