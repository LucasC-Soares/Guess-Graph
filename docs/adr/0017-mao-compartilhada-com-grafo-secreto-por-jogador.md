# ADR-0017: Mão compartilhada com grafo secreto por jogador

- Status: Aceito
- Data: 2026-09-26

## Contexto

Cada jogador recebia sua própria mão de 12 grafos, e o oponente tentava adivinhar um grafo "ativo" dentro dessa mão privada (`PlayerState.hand` + `activeOpponentGraphId`). Isso trazia dois problemas:

- Os IDs eliminados por perguntas feitas pelo oponente pertenciam à mão do próprio jogador — uma mão que ele nunca recebe do servidor. O question log ficava sem como mapear esses IDs pra um número de carta, mostrando `#?` nessas entradas.
- O contador de restantes (`remainingGraphIds`) era calculado a partir de uma cópia de mão distinta por direção, sem uma fonte única compartilhada entre os dois clientes.

Uma partida termina no primeiro palpite, certo ou errado — não existe avanço sequencial por vários alvos dentro da mesma partida.

## Decisão

A sala passa a ter uma única mão compartilhada (`Room.hand`, 12 grafos), enviada igual para os dois jogadores. Ao montar a mão (entrada do segundo jogador ou revanche), sorteiam-se dois índices distintos dela como o `secretGraphId` de cada jogador — o grafo que o oponente precisa adivinhar.

O alvo de cada jogador (`getActiveOpponentGraph`) passa a ser sempre o `secretGraphId` do oponente, fixo durante toda a partida. `remainingOpponentGraphIds` é filtrado contra a mão compartilhada, então o contador de restantes reflete a mesma fonte pros dois lados.

## Alternativas consideradas

- Manter mãos privadas e mapear IDs entre elas pro question log: exigiria uma tabela de tradução de IDs por jogador, adicionando complexidade sem necessidade.
- Guardar o "restante" só no cliente, recalculado localmente a partir do log: fica sujeito a divergência entre os dois clientes; o servidor já tem a informação e deve ser a fonte única.

## Consequências

- `PlayerState.hand` deixa de existir; `PlayerState.activeOpponentGraphId` vira `secretGraphId`.
- `RoomsService.getOnlyRemainingOpponentGraph` e `advanceActiveOpponentGraph` foram removidos — dependiam da mão privada e de um avanço sequencial por vários alvos que não existe no jogo.
- O payload emitido pro frontend troca `opponentHand` por `hand` (compartilhada) e ganha `yourGraphId`.
- Uma mão com menos de 2 grafos não permite sortear dois secretos distintos; `GraphGeneratorService.HAND_SIZE` precisa continuar `>= 2`.
