# ADR-0010: Estado efemero de salas no Redis

- Status: Aceito
- Data: 2026-09-20

## Contexto

O estado das salas, jogadores, maos e turno era mantido em um `Map` dentro do processo do backend. Isso impede compartilhar partidas entre instancias e perde todas as salas quando o processo reinicia. Alem disso, os eventos de jogo recebiam o codigo da sala repetidamente, embora a conexao ja estivesse associada a uma sala.

## Decisao

Usar Redis como banco de dados nao persistente para o estado efemero das salas. Cada sala e serializada como JSON na chave `guess-graph:room:{code}`, acessada pelo `RedisRoomStore`. A URL pode ser configurada por `REDIS_URL` e o padrao local e `redis://localhost:6379`.

Depois de criar ou entrar em uma sala, o gateway grava o codigo em `socket.data.roomCode`. Os eventos de pergunta e palpite identificam a sala pela conexao, e nao recebem mais o codigo. O cliente recebe apenas referencias opacas (`targetRef`) para selecionar alvos; o servidor resolve essas referencias para os grafos armazenados no Redis. Grafos e propriedades do oponente nunca sao enviados ao cliente.

## Alternativas consideradas

- `Map` local: simples, mas nao funciona com varias instancias e perde o estado no reinicio.
- Banco de dados persistente: desnecessario para partidas temporarias e adicionaria custo de armazenamento e limpeza.
- Redis com dados persistentes: nao atende ao requisito de estado descartavel do MVP.

## Consequencias

- Salas podem ser lidas por varias instancias do backend e sobrevivem ao reinicio de uma instancia enquanto o Redis estiver ativo.
- O Redis passa a ser uma dependencia de infraestrutura local e de deploy.
- O estado e serializado a cada mutacao; operacoes transacionais ou TTL podem ser adicionadas se a concorrencia e a limpeza automatica exigirem.
- O cliente nao precisa repetir o codigo da sala em cada acao nem enviar dados privados do grafo.