# ADR-0004: Comunicacao em tempo real com Socket.IO

- Status: Aceito
- Data: 2026-09-19

## Contexto

Criar sala, entrar em partida, responder perguntas e atualizar turnos sao eventos interativos entre dois jogadores. Polling introduziria atraso e complexidade desnecessaria.

## Decisao

Usar Socket.IO entre frontend e backend. Cada acao tem um evento nomeado, como `room:create`, `room:join`, `game:ask-question` e `game:make-guess`. O servidor emite eventos de estado, respostas e fim de jogo.

Os nomes dos eventos ficam centralizados em constantes em cada aplicacao e devem permanecer sincronizados.

## Alternativas consideradas

- REST com polling: mais simples para requisicoes isoladas, mas inadequado para atualizacoes imediatas nos dois clientes.
- WebSocket puro: teria menos abstracao, mas exigiria implementar manualmente recursos que Socket.IO ja oferece, como rooms e acknowledgements.

## Consequencias

- O servidor pode emitir a mesma mudanca para os dois jogadores.
- Rooms do Socket.IO mapeiam naturalmente para o codigo da sala.
- O frontend precisa remover listeners ao desmontar hooks para evitar duplicacao.
- O contrato de eventos passa a ser uma API publica entre as duas aplicacoes.
