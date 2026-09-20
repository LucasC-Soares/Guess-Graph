# API do Guess Graph

## Visão geral

O backend expõe:

- **Socket.IO**: protocolo usado pelo jogo para criar salas, entrar em partidas, fazer perguntas e chutar grafos.

A API de jogo é orientada a eventos. O cliente envia uma ação e o servidor responde pelo acknowledgement do evento e/ou por um evento emitido para os participantes da sala.

## Executar localmente

No diretório `backend/`:

```bash
npm install
npm run start:dev
```

O backend precisa de um Redis disponível em `REDIS_URL` (por padrão,
`redis://localhost:6379`).

Com o backend em `http://localhost:3001`:

- Socket.IO: `http://localhost:3001`

A porta pode ser alterada com `PORT`. A origem permitida pode ser alterada com `FRONTEND_URL`.

## Conexão Socket.IO

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false,
});

socket.connect();
```

O cliente deve manter uma instância de socket por sessão. Depois de entrar ou criar uma sala, registre os listeners dos eventos de servidor e remova-os ao desmontar a tela.

## Eventos enviados pelo cliente

### `room:create`

Cria uma sala e coloca o socket na room do Socket.IO.

Payload:

```json
{
  "username": "Alice"
}
```

Acknowledgement de sucesso:

```json
{
  "code": "K7M2Q",
  "status": "WAITING_FOR_PLAYER"
}
```

Exemplo:

```ts
socket.emit('room:create', { username: 'Alice' }, (response) => {
  console.log(response.code);
});
```

### `room:join`

Entra em uma sala que ainda aguarda o segundo jogador. Quando a entrada é concluída, o servidor gera as duas mãos e emite `room:opponent-joined` para os dois jogadores.

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

Faz uma pergunta sobre o grafo secreto do oponente. A sala e o jogador são obtidos do socket associado; o cliente não informa nem referencia o grafo do oponente.

Payload:

```json
{
  "question": {
    "type": "IS_TREE"
  }
}
```

Pergunta parametrizada:

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

`eliminatedGraphIds` lista os grafos cuja propriedade não correspondeu à resposta.
`remainingGraphIds` lista os candidatos ainda possiveis. O mesmo resultado e
emitido para os dois sockets em `game:question-answered`.

### `game:make-guess`

Chuta a identidade do alvo ativo. O alvo é resolvido pelo servidor a partir da sala e do jogador; `guessedGraphId` é a identidade chutada.

Payload:

```json
{
  "guessedGraphId": "graph-chutado"
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

Todo `make-guess` válido encerra a partida. Se `correct` for `true`, vence o
jogador que chutou; se for `false`, vence o oponente.

### `game:rematch`

Solicita uma revanche. Não possui payload. A partida só reinicia quando os dois
jogadores enviarem o evento.

Enquanto aguarda o outro jogador, o acknowledgement é:

```json
{
  "accepted": false,
  "status": "WAITING_FOR_REMATCH"
}
```

Quando os dois concordam, o servidor gera novas mãos, zera o placar e o histórico,
restaura `IN_PROGRESS` e emite `room:opponent-joined` novamente.

### `room:close`

Encerra e remove a sala. Não possui payload e pode ser enviado por qualquer
jogador conectado à sala.

## Eventos emitidos pelo servidor

### `room:opponent-joined`

Emitido individualmente para cada jogador quando a sala fica completa. O evento informa apenas o estado da partida; nenhum grafo, referência ou propriedade é enviado.

```json
{
  "status": "IN_PROGRESS",
  "currentTurn": "player1",
  "yourRole": "player1"
}
```

O grafo secreto e o conjunto de candidatos restantes são mantidos exclusivamente
no estado da sala no Redis. O cliente recebe a estrutura publica para conseguir
visualizar os grafos, mas nunca recebe suas propriedades calculadas.

Uma pergunta nunca encerra a partida. A sala só termina quando
`game:make-guess` for enviado no turno correto e `guessedGraphId` corresponder
ao grafo que o servidor está verificando, independentemente de quantos
candidatos ainda existam.

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

Pode ser emitido após um chute, com a atualização do turno e da pontuação, ou quando um jogador desconecta.

Após chute:

```json
{
  "currentTurn": "player2",
  "score": 1
}
```

Após desconexão:

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

Emitido para os jogadores quando a sala é encerrada e removida do Redis.

## Tipos de pergunta

| Tipo | Parametros | Significado |
| --- | --- | --- |
| `IS_CONNECTED` | nenhum | O grafo é conexo? |
| `IS_BIPARTITE` | nenhum | O grafo é bipartido? |
| `HAS_CYCLE` | nenhum | O grafo possui ciclo? |
| `IS_TREE` | nenhum | O grafo é uma árvore? |
| `HAS_BRIDGE` | nenhum | O grafo possui ponte? |
| `MAX_DEGREE_GREATER_THAN` | `params.threshold` | O grau máximo é maior que o limite? |

## Modelo de grafo publico

```ts
interface Graph {
  id: string;
  vertexCount: number;
  edges: [number, number][];
}
```

Vértices são inteiros de `0` a `vertexCount - 1`. As arestas são não direcionadas e aparecem como pares de vértices.

## Regras de turno

1. A sala é criada com status `WAITING_FOR_PLAYER`.
2. O segundo jogador muda o status para `IN_PROGRESS`.
3. A partida inicia com `currentTurn: "player1"`.
4. Perguntas válidas registram uma entrada no log e alternam o turno.
5. Chutes válidos alternam o turno quando a partida não termina.
6. Um jogador que não possui o turno recebe erro e a ação não altera o estado.
7. Uma sala possui uma partida ativa por vez; a revanche reinicia a mesma sala somente com concordância dos dois jogadores.

## Erros

O handler NestJS pode rejeitar um evento com mensagens como:

- `Sala não encontrada`
- `A sala já está cheia ou em andamento`
- `Não é a vez deste jogador`
- `Grafo não encontrado`
- `Nome e socket são obrigatórios`

O cliente deve tratar a falha do acknowledgement ou do mecanismo de erro do Socket.IO sem assumir que a ação foi aplicada.
