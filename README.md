# Guess Graph

As decisões arquiteturais do projeto estão documentadas em [docs/adr/README.md](docs/adr/README.md).
O contrato da API HTTP e dos eventos Socket.IO está em [docs/api.md](docs/api.md).

Jogo 1x1 onde cada jogador tenta adivinhar as propriedades estruturais dos
grafos do oponente através de perguntas de sim/não.

## Estrutura

```
guess-graph/
├── backend/    NestJS + WebSockets (Socket.io), estado efêmero no Redis
└── frontend/   Next.js (App Router) + Bulletproof React
```

### Estrutura do frontend (Bulletproof React)

```
frontend/src/
├── app/            rotas (Next.js App Router)
├── components/ui/  componentes genéricos (Button, Input, Badge)
├── constants/       URL do WebSocket e o mapa de nomes de eventos
│                    (precisa bater com o backend, ver rooms.gateway.ts)
├── features/
│   ├── room/       criar/entrar em sala (api + components)
│   └── game/       tela de jogo em si: hook de estado da sala, painel
│                   de perguntas, visualização de grafo, log de perguntas
├── hooks/          hooks compartilhados (se surgir algum fora de features/game)
├── lib/            socket-client (instância única do socket.io-client)
├── schemas/        validação com Zod dos formulários de sala
└── types/          tipos compartilhados, espelhando o backend
```

### Estrutura do backend (NestJS + Socket.IO)

```
backend/src/
├── app.module.ts          módulo raiz, configura o ambiente e importa os módulos
├── main.ts                bootstrap do NestJS, habilita CORS e WebSockets
└── modules/
	├── graphs/
	│   ├── graphs.module.ts
	│   ├── graph-generator.service.ts
	│   ├── graph-properties.service.ts
	│   ├── interfaces/
	│   │   └── graph.interface.ts
	│   └── *.spec.ts       testes dos serviços de grafos
	├── questions/
	│   └── question-catalog.ts  catálogo e regras das perguntas
	└── rooms/
		├── rooms.module.ts
		├── rooms.gateway.ts     gateway do Socket.IO e eventos da partida
		├── rooms.service.ts     serviço de salas e estado dos jogadores
		├── redis-room-store.ts  persistência efêmera das salas no Redis
		├── interfaces/
		│   └── room.interface.ts
		└── *.spec.ts             testes do gateway e do serviço de salas
```

## Docker Compose

Com Docker BuildKit habilitado, suba frontend, backend e Redis juntos:

```bash
docker compose up --build
```

Frontend: http://localhost:3000. Backend e Socket.IO: http://localhost:3001.
O Redis é efêmero e não usa volume persistente.

Para usar os estágios de desenvolvimento:

```bash
BUILD_TARGET=development docker compose up --build
```

As portas e a URL pública do WebSocket podem ser sobrescritas por
`FRONTEND_PORT`, `BACKEND_PORT` e `NEXT_PUBLIC_WS_URL`.
