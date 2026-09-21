# ADR-0007: Modelo e cálculo de propriedades de grafos

- Status: Aceito
- Data: 2026-09-19

## Contexto

O jogo pergunta propriedades estruturais de grafos pequenos. A representação precisa ser simples para gerar, serializar e visualizar, e os cálculos precisam ser deterministas e independentes do transporte.

## Decisão

Representar cada grafo como não direcionado, com vértices inteiros de `0` a `vertexCount - 1` e arestas como pares `[u, v]`. Cada grafo recebe um `id` estável.

Calcular no backend as propriedades `isConnected`, `isBipartite`, `hasCycle`, `isTree`, `hasBridge`, `maxDegree` e `minDegree`. Os algoritmos usados são BFS/DFS, 2-coloração e low-link de Tarjan para pontes.

O gerador usa grafos aleatórios simples e a partida enriquece cada grafo com suas propriedades antes de armazená-lo na mão.

## Alternativas consideradas

- Representação de objetos de vértices e arestas: seria mais verbosa para o MVP.
- Cálculo no frontend: conflitaria com a autoridade do servidor.
- Biblioteca externa de grafos: adicionaria dependência para um domínio pequeno e bem delimitado.

## Consequências

- O modelo é compacto e fácil de enviar por Socket.IO.
- Os algoritmos podem ser testados com grafos clássicos pequenos.
- O gerador aleatório precisa de testes de invariantes e, futuramente, de controles melhores de variedade.
