# ADR-0013: Tamanho da mão e limite de vértices

- Status: Substituído por [ADR-0014](0014-reducao-do-limite-de-vertices.md)
- Data: 2026-09-20

## Contexto

Cada jogador precisa receber uma mão suficientemente grande para tornar a dedução interessante. Ao mesmo tempo, grafos muito grandes prejudicam a leitura e a interação na visualização do frontend.

## Decisao

Cada mão terá exatamente 12 grafos. A quantidade de vértices de cada grafo será escolhida aleatoriamente entre 3 e 20, inclusive:

- `HAND_SIZE = 12`;
- `MIN_HAND_VERTEX_COUNT = 3`;
- `MAX_HAND_VERTEX_COUNT = 20`.

O `GraphGeneratorService.generateHand()` concentra essa regra e é usado tanto no início da partida quanto em uma revanche.

## Alternativas consideradas

- Três grafos com cinco vértices: pouca variedade e uma partida curta demais.
- Quantidade fixa de vértices: simplifica a visualização, mas reduz a diversidade estrutural.
- Mais de 20 vértices: aumenta o custo visual e dificulta a inspeção manual das arestas.
- Mãos com tamanho variável: torna a comparação entre jogadores e o balanceamento da partida menos previsíveis.

## Consequências

- As partidas têm 12 candidatos por jogador e mais espaço para perguntas.
- A variação de 3 a 20 vértices produz grafos de escalas diferentes.
- O limite superior mantém a visualização dentro de uma complexidade aceitável para o frontend.
- O gerador usa aleatoriedade; testes deterministas devem usar grafos construídos explicitamente.

Esta decisão foi substituída pela ADR-0014, que reduziu o limite superior para 10 vértices.
