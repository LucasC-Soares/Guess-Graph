# ADR-0012: Encerramento de sala e revanche por consenso

- Status: Aceito
- Data: 2026-09-20

## Contexto

Uma sala representa uma partida por vez. Depois de `FINISHED`, os jogadores precisam poder encerrar a sala ou propor uma revanche sem criar outro código e sem reiniciar a partida unilateralmente.

## Decisao

Adicionar `room:close` para remover a sala do Redis e emitir `room:closed` aos participantes.

Adicionar `game:rematch` sem payload. Cada jogador registra seu voto no estado Redis. A revanche só começa quando `player1` e `player2` concordarem. Nesse momento, o servidor zera mãos, placares, histórico, candidatos e votos, gera novas mãos e inicia outra partida na mesma sala com `currentTurn: player1`.

## Alternativas consideradas

- Reiniciar com o primeiro jogador que pedir: permitiria alterar a partida contra a vontade do outro.
- Criar uma nova sala para a revanche: exigiria compartilhar outro código e perderia a continuidade da sessão.
- Manter a sala finalizada sem ações: impediria uma revanche conveniente entre os mesmos jogadores.

## Consequencias

- A sala continua sendo uma unidade de sessão, mas pode conter partidas sequenciais mediante consenso.
- O estado da revanche é compartilhado no Redis, funcionando entre instâncias do backend.
- O cliente precisa tratar os estados `WAITING_FOR_REMATCH`, `IN_PROGRESS`, `FINISHED` e `room:closed`.