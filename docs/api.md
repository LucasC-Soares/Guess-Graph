# API do Guess Graph

## Visao geral

O backend expoe duas superficies:

- **HTTP**: documentacao OpenAPI em `/docs-json` e referencia visual Scalar em `/docs`.
- **Socket.IO**: protocolo usado pelo jogo para criar salas, entrar em partidas, fazer perguntas e chutar grafos.

A API de jogo e orientada a eventos. O cliente envia uma acao e o servidor responde pelo acknowledgement do evento e/ou por um evento emitido para os participantes da sala.

## Executar localmente

No diretorio `backend/`:

```bash
npm install
npm run start:dev
```

O backend precisa de um Redis disponivel em `REDIS_URL` (por padrao,
`redis://localhost:6379`).

Com o backend em `http://localhost:3001`:

- Referencia: http://localhost:3001/docs
- Especificacao OpenAPI: http://localhost:3001/docs-json
- Socket.IO: `http://localhost:3001`

A porta pode ser alterada com `PORT`. A origem permitida pode ser alterada com `FRONTEND_URL`.

## Conexao Socket.IO

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false,
});

socket.connect();
```

O cliente deve manter uma instancia de socket por sessao. Depois de entrar ou criar uma sala, registre os listeners dos eventos de servidor e remova-os ao desmontar a tela.

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

Entra em uma sala que ainda aguarda o segundo jogador. Quando a entrada e concluida, o servidor gera as duas maos e emite `room:opponent-joined` para os dois jogadores.

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

Faz uma pergunta sobre o grafo secreto do oponente. A sala e o jogador sao obtidos do socket associado; o cliente nao informa nem referencia o grafo do oponente.

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

`eliminatedGraphIds` lista os grafos cuja propriedade nao correspondeu a resposta.
`remainingGraphIds` lista os candidatos ainda possiveis. O mesmo resultado e
emitido para os dois sockets em `game:question-answered`.

### `game:make-guess`

Chuta a identidade do alvo ativo. O alvo e resolvido pelo servidor a partir da sala e do jogador; `guessedGraphId` e a identidade chutada.

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
  "finished": false,
  "score": 0
}
```

Quando o chute encerra a partida, o servidor emite `game:over`. Caso contrario, emite `room:updated` e alterna o turno.

## Eventos emitidos pelo servidor

### `room:opponent-joined`

Emitido individualmente para cada jogador quando a sala fica completa. O evento informa apenas o estado da partida; nenhum grafo, referência ou propriedade e enviado.

```json
{
  "status": "IN_PROGRESS",
  "currentTurn": "player1",
  "yourRole": "player1"
}
```

O grafo secreto e o conjunto de candidatos restantes sao mantidos exclusivamente
no estado da sala no Redis. O cliente recebe a estrutura publica para conseguir
visualizar os grafos, mas nunca recebe suas propriedades calculadas.

Quando `remainingCount` chega a `1`, o servidor marca a sala como `FINISHED` e
emite `game:over`.

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

Pode ser emitido apos um chute, com a atualizacao do turno e da pontuacao, ou quando um jogador desconecta.

Apos chute:

```json
{
  "currentTurn": "player2",
  "score": 1
}
```

Apos desconexao:

```json
{
  "status": "WAITING_FOR_PLAYER"
}
```

### `game:over`

```json
{
  "winner": "player1",
  "score": 3
}
```

## Tipos de pergunta

| Tipo | Parametros | Significado |
| --- | --- | --- |
| `IS_CONNECTED` | nenhum | O grafo e conexo? |
| `IS_BIPARTITE` | nenhum | O grafo e bipartido? |
| `HAS_CYCLE` | nenhum | O grafo possui ciclo? |
| `IS_TREE` | nenhum | O grafo e uma arvore? |
| `HAS_BRIDGE` | nenhum | O grafo possui ponte? |
| `MAX_DEGREE_GREATER_THAN` | `params.threshold` | O grau maximo e maior que o limite? |

## Modelo de grafo publico

```ts
interface Graph {
  id: string;
  vertexCount: number;
  edges: [number, number][];
}
```

Vertices sao inteiros de `0` a `vertexCount - 1`. As arestas sao nao direcionadas e aparecem como pares de vertices.

## Regras de turno

1. A sala e criada com status `WAITING_FOR_PLAYER`.
2. O segundo jogador muda o status para `IN_PROGRESS`.
3. A partida inicia com `currentTurn: "player1"`.
4. Perguntas validas registram uma entrada no log e alternam o turno.
5. Chutes validos alternam o turno quando a partida nao termina.
6. Um jogador que nao possui o turno recebe erro e a acao nao altera o estado.

## Erros

O handler NestJS pode rejeitar um evento com mensagens como:

- `Sala não encontrada`
- `A sala já está cheia ou em andamento`
- `Não é a vez deste jogador`
- `Grafo não encontrado`
- `Nome e socket são obrigatórios`

O cliente deve tratar a falha do acknowledgement ou do mecanismo de erro do Socket.IO sem assumir que a acao foi aplicada.

## Observacao sobre OpenAPI

OpenAPI descreve endpoints HTTP. Como o jogo usa Socket.IO, os eventos acima nao sao inferidos automaticamente pelo Swagger. Este arquivo e a referencia normativa do protocolo de eventos; `/docs` documenta a superficie HTTP e serve como ponto de entrada visual da API.
