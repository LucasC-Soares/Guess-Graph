# ADR-0010: Estado efêmero de salas no Redis

- Status: Aceito
- Data: 2026-09-20

## Contexto

O estado das salas, jogadores, mãos e turno era mantido em um `Map` dentro do processo do backend. Isso impede compartilhar partidas entre instâncias e perde todas as salas quando o processo reinicia. Além disso, os eventos de jogo recebiam o código da sala repetidamente, embora a conexão já estivesse associada a uma sala.

## Decisão

Usar Redis como banco de dados não persistente para o estado efêmero das salas. Cada sala é serializada como JSON na chave `guess-graph:room:{code}`, acessada pelo `RedisRoomStore`. A URL pode ser configurada por `REDIS_URL` e o padrão local é `redis://localhost:6379`.

Depois de criar ou entrar em uma sala, o gateway grava o código em `socket.data.roomCode`. Os eventos de pergunta e palpite identificam a sala pela conexão, e não recebem o código nem qualquer referência de grafo. O Redis mantém o alvo ativo de cada jogador; após um palpite correto, o servidor avança para o próximo grafo. Grafos e propriedades do oponente nunca são enviados ao cliente.

## Alternativas consideradas

- `Map` local: simples, mas não funciona com várias instâncias e perde o estado no reinício.
- Banco de dados persistente: desnecessário para partidas temporárias e adicionaria custo de armazenamento e limpeza.
- Redis com dados persistentes: não atende ao requisito de estado descartável do MVP.

## Consequências

- Salas podem ser lidas por várias instâncias do backend e sobrevivem ao reinício de uma instância enquanto o Redis estiver ativo.
- O Redis passa a ser uma dependência de infraestrutura local e de deploy.
- O estado é serializado a cada mutação; operações transacionais ou TTL podem ser adicionadas se a concorrência e a limpeza automática exigirem.
- O cliente não precisa repetir o código da sala em cada ação nem enviar dados privados do grafo.