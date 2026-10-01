# ADR-0010: Ephemeral room state in Redis

- Status: Accepted
- Date: 2026-09-20

## Context

The state of rooms, players, hands, and turn was kept in a `Map` inside the backend process. This prevents sharing matches across instances and loses all rooms when the process restarts. In addition, game events kept receiving the room code repeatedly even though the connection was already associated with a room.

## Decision

Use Redis as a non-persistent database for ephemeral room state. Each room is serialized as JSON in the key `guess-graph:room:{code}`, accessed by `RedisRoomStore`. The URL can be configured via `REDIS_URL`, and the local default is `redis://localhost:6379`.

After creating or joining a room, the gateway stores the code in `socket.data.roomCode`. Question and guess events identify the room by connection, and they do not receive the code or any graph reference. Redis keeps the active target for each player; after a correct guess, the server advances to the next graph. Opponent graphs and properties are never sent to the client.

## Alternatives considered

- Local `Map`: simple, but it does not work with multiple instances and loses state on restart.
- Persistent database: unnecessary for temporary matches and would add storage and cleanup costs.
- Redis with persistent data: does not satisfy the MVP requirement for disposable state.

## Consequences

- Rooms can be read by multiple backend instances and survive an instance restart while Redis remains active.
- Redis becomes a local and deployment infrastructure dependency.
- State is serialized on every mutation; transactional operations or TTL can be added if concurrency and automatic cleanup require them.
- The client no longer needs to repeat the room code on every action or send private graph data.