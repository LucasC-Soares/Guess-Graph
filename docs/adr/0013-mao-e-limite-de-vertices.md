# ADR-0013: Tamanho da mao e limite de vertices

- Status: Aceito
- Data: 2026-09-20

## Contexto

Cada jogador precisa receber uma mao suficientemente grande para tornar a deducao interessante. Ao mesmo tempo, grafos muito grandes prejudicam a leitura e a interacao na visualizacao do frontend.

## Decisao

Cada mao tera exatamente 12 grafos. A quantidade de vertices de cada grafo sera escolhida aleatoriamente entre 3 e 20, inclusive:

- `HAND_SIZE = 12`;
- `MIN_HAND_VERTEX_COUNT = 3`;
- `MAX_HAND_VERTEX_COUNT = 20`.

O `GraphGeneratorService.generateHand()` concentra essa regra e e usado tanto no inicio da partida quanto em uma revanche.

## Alternativas consideradas

- Tres grafos com cinco vertices: pouca variedade e uma partida curta demais.
- Quantidade fixa de vertices: simplifica a visualizacao, mas reduz a diversidade estrutural.
- Mais de 20 vertices: aumenta o custo visual e dificulta a inspecao manual das arestas.
- Maos com tamanho variavel: torna a comparacao entre jogadores e o balanceamento da partida menos previsiveis.

## Consequencias

- As partidas tem 12 candidatos por jogador e mais espaco para perguntas.
- A variacao de 3 a 20 vertices produz grafos de escalas diferentes.
- O limite superior mantem a visualizacao dentro de uma complexidade aceitavel para o frontend.
- O gerador usa aleatoriedade; testes deterministas devem usar grafos construidos explicitamente.
