# ADR-0018: Sessão de sala em `sessionStorage`, não `localStorage`

- Status: Aceito
- Data: 2026-09-26

## Contexto

A ADR-0015 definiu manter no `localStorage` a sessão mínima da sala (código, nome do jogador e papel), pra permitir recarregar ou acessar diretamente a página da sala. `localStorage` é compartilhado entre todas as abas da mesma origem, não por aba.

Isso quebra num cenário concreto: host e guest abertos em duas abas do mesmo navegador. As duas chamadas a `saveRoomSession` gravam na mesma chave — a segunda sobrescreve a primeira, e as duas abas passam a ler a mesma sessão (a do jogador que entrou por último). Um reload nas duas abas faz ambas tentarem retomar a sala como o mesmo jogador; o outro jogador nunca é reivindicado e acaba removido por inatividade, derrubando a sala pra `WAITING_FOR_PLAYER` pras duas.

## Decisão

Trocar `localStorage` por `sessionStorage` em `saveRoomSession`, `restoreRoomSession` e `clearRoomSession`. `sessionStorage` tem a mesma API, mas é isolado por aba mesmo dentro da mesma origem, e sobrevive a um F5 — que é exatamente o caso de uso que motivou guardar a sessão no navegador.

## Alternativas consideradas

- Namespacing manual da chave por aba (ex.: incluir um ID de aba gerado em `sessionStorage` só pra desambiguar a chave do `localStorage`): resolve o mesmo problema com mais complexidade, já que `sessionStorage` faz isso nativamente.
- Manter `localStorage` e resolver a colisão no servidor (ex.: `RESUME_ROOM` rejeitar se o `socketId` já pertence a outro papel): não resolve a raiz — as duas abas continuam competindo pela mesma sessão local, só empurra o sintoma pro backend.

## Consequências

- Fechar a aba de verdade (não um reload) perde a sessão da sala — diferente de `localStorage`, que persistiria indefinidamente. Esse é o comportamento correto aqui: uma sessão de sala é inerentemente por aba, não algo que devesse sobreviver e ser retomado depois de a aba ser fechada.
- Esta decisão substitui, nesse ponto específico, o que a ADR-0015 documentou sobre `localStorage` guardar a sessão da sala. O restante da ADR-0015 (não persistir estado de partida, tratar o storage do navegador como entrada não confiável) continua valendo.
