# ADR-0014: Redução do limite de vértices

- Status: Aceito
- Data: 2026-09-20
- Substitui: [ADR-0013](0013-mao-e-limite-de-vertices.md)

## Contexto

A ADR-0013 estabeleceu mãos com 12 grafos e entre 3 e 20 vértices por grafo. A experiência de uso mostrou que o limite superior de 20 ainda produz grafos grandes demais para a leitura e a interação durante a partida.

## Decisão

Manter o tamanho da mão em 12 grafos e reduzir o intervalo permitido para 3 a 10 vértices, inclusive:

- `HAND_SIZE = 12`;
- `MIN_HAND_VERTEX_COUNT = 3`;
- `MAX_HAND_VERTEX_COUNT = 10`.

O `GraphGeneratorService.generateHand()` continua sendo a fonte dessa regra para a criação inicial e para revanches.

## Consequências

- As partidas mantêm 12 candidatos por jogador.
- A visualização fica mais legível e a inspeção das arestas exige menos espaço.
- A variedade estrutural permanece, mas grafos muito grandes deixam de ser gerados.