# ADR-0004: Comunicação em tempo real com Socket.IO

- Status: Aceito
- Data: 2026-09-19

## Contexto

Criar sala, entrar em partida, responder perguntas e atualizar turnos são eventos interativos entre dois jogadores. Polling introduziria atraso e complexidade desnecessária.

## Decisão

Usar Socket.IO entre frontend e backend. Cada ação tem um evento nomeado, como `room:create`, `room:join`, `game:ask-question` e `game:make-guess`. O servidor emite eventos de estado, respostas e fim de jogo.

Os nomes dos eventos ficam centralizados em constantes em cada aplicação e devem permanecer sincronizados.

No frontend, existe um único socket por sessão. Operações de criação, entrada, perguntas, palpite, revanche e encerramento usam acknowledgements do Socket.IO; mutações da partida também aplicam timeout de 8 segundos. Os hooks registram listeners para atualizações da sala e removem esses listeners no cleanup do efeito.

## Alternativas consideradas

- REST com polling: mais simples para requisições isoladas, mas inadequado para atualizações imediatas nos dois clientes.
- WebSocket puro: teria menos abstração, mas exigiria implementar manualmente recursos que Socket.IO já oferece, como rooms e acknowledgements.

## Consequências

- O servidor pode emitir a mesma mudança para os dois jogadores.
- Rooms do Socket.IO mapeiam naturalmente para o código da sala.
- O frontend precisa remover listeners ao desmontar hooks para evitar duplicação.
- O contrato de eventos passa a ser uma API pública entre as duas aplicações.
- O cache do React Query e atualizado diretamente pelos eventos recebidos, mantendo a tela sincronizada sem polling.
- Falhas ou ausência de acknowledgement rejeitam a operação no frontend e podem ser exibidas como erro de ação.
