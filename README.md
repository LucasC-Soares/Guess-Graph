# Guess Graph

Jogo 1x1 onde cada jogador tenta adivinhar as propriedades estruturais dos
grafos do oponente através de perguntas de sim/não.

## Estrutura

```
guess-graph/
├── backend/    NestJS + WebSockets (Socket.io), estado em memória
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

## Ordem sugerida de desenvolvimento

1. **`backend/src/modules/graphs/graph-properties.service.ts`**
   Implemente as checagens de propriedade primeiro, isoladas de qualquer
   coisa de jogo/socket. São os mesmos algoritmos do seu caderno de time
   (BFS/DFS, 2-coloração, Tarjan pra pontes) — reaproveite, só adapte a
   entrada/saída. Rode os testes em `graph-properties.service.spec.ts`.

2. **`graph-generator.service.ts`**
   Gerador de grafos aleatórios. Teste manualmente: gere uns 20 grafos,
   rode o `GraphPropertiesService` em cada um, e confira se a distribuição
   de propriedades faz sentido (não adianta gerar só grafos conexos, por
   exemplo — o jogo fica sem graça).

3. **`modules/questions/question-catalog.ts`**
   Já vem praticamente pronto — é só o "árbitro" das perguntas fixas.
   Confira se cobre as perguntas que você quer no MVP e adicione mais
   `QuestionType` se quiser (lembre de espelhar no frontend em
   `entities/graph/model/types.ts`).

4. **`modules/rooms/rooms.service.ts`**
   Estado da sala em memória (Map). Implemente `createRoom`, `joinRoom`,
   `assignHands`, `recordQuestion`. Teste isso separado do gateway
   (testes unitários simples, sem precisar de socket real).

5. **`modules/rooms/rooms.gateway.ts`**
   Conecta tudo via eventos WebSocket. Deixe pra último — é onde mais bugs
   de integração aparecem, então só faz sentido depois que as peças de
   baixo já estão testadas isoladamente.

6. **Frontend**: `lib/socket-client` → `features/room` (criar/entrar em
   sala) → `features/game` (o hook `use-room-state` primeiro, depois
   `graph-visualization`, `ask-question-panel`, `question-log`, e por
   fim o `game-board` que compõe tudo). Pro MVP, um SVG simples com
   vértices em círculo já é suficiente — nada de lib de força-dirigida ainda.

## Checkpoints

Todo arquivo com lógica tem `// TODO:` marcando o que falta e uma pista de
como implementar. Comece pelo `graph-properties.service.ts` — ele é
puro algoritmo, sem NestJS/socket no meio, então é o mais fácil de validar
isoladamente antes de subir a stack toda.
