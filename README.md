# Guess Graph

The project's architectural decisions are documented in [docs/adr/README.md](docs/adr/README.md).
The HTTP API and Socket.IO event contract are in [docs/api.md](docs/api.md).

A 1v1 game where each player tries to guess the opponent's graph structural properties through yes/no questions.

## Structure

```
guess-graph/
├── backend/    NestJS + WebSockets (Socket.IO), ephemeral state in Redis
└── frontend/   Next.js (App Router) + Bulletproof React
```

### Frontend structure (Bulletproof React)

```
frontend/src/
├── app/            routes (Next.js App Router)
├── components/ui/  generic components (Button, Input, Badge)
├── constants/      WebSocket URL and event name map
│                  (must match the backend; see rooms.gateway.ts)
├── features/
│   ├── room/       create/join room (API + components)
│   └── game/       actual game screen: room state hook, question panel,
│                   graph visualization, question log
├── hooks/          shared hooks (when needed outside features/game)
├── lib/            socket-client (single socket.io-client instance)
├── schemas/        Zod validation for room forms
└── types/          shared types mirroring the backend
```

### Backend structure (NestJS + Socket.IO)

```
backend/src/
├── app.module.ts          root module, configures the environment and imports modules
├── main.ts                NestJS bootstrap, enables CORS and WebSockets
└── modules/
    ├── graphs/
    │   ├── graphs.module.ts
    │   ├── graph-generator.service.ts
    │   ├── graph-properties.service.ts
    │   ├── interfaces/
    │   │   └── graph.interface.ts
    │   └── *.spec.ts       tests for graph services
    ├── questions/
    │   └── question-catalog.ts  question catalog and rules
    └── rooms/
        ├── rooms.module.ts
        ├── rooms.gateway.ts     Socket.IO gateway and game events
        ├── rooms.service.ts     room service and player state
        ├── redis-room-store.ts  ephemeral room persistence in Redis
        ├── interfaces/
        │   └── room.interface.ts
        └── *.spec.ts             gateway and room service tests
```

## Docker Compose

With Docker BuildKit enabled, bring up the frontend, backend, and Redis together:

```bash
docker compose up --build
```

Frontend: http://localhost:3000. Backend and Socket.IO: http://localhost:3001.
Redis is ephemeral and does not use a persistent volume.

To use the development stages:

```bash
BUILD_TARGET=development docker compose up --build
```

The ports and the public WebSocket URL can be overridden through
`FRONTEND_PORT`, `BACKEND_PORT`, and `NEXT_PUBLIC_WS_URL`.
