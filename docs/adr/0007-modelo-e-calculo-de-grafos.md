# ADR-0007: Modelo e calculo de propriedades de grafos

- Status: Aceito
- Data: 2026-09-19

## Contexto

O jogo pergunta propriedades estruturais de grafos pequenos. A representacao precisa ser simples para gerar, serializar e visualizar, e os calculos precisam ser deterministas e independentes do transporte.

## Decisao

Representar cada grafo como nao direcionado, com vertices inteiros de `0` a `vertexCount - 1` e arestas como pares `[u, v]`. Cada grafo recebe um `id` estavel.

Calcular no backend as propriedades `isConnected`, `isBipartite`, `hasCycle`, `isTree`, `hasBridge`, `maxDegree` e `minDegree`. Os algoritmos usados sao BFS/DFS, 2-coloracao e low-link de Tarjan para pontes.

O gerador usa grafos aleatorios simples e a partida enriquece cada grafo com suas propriedades antes de armazena-lo na mao.

## Alternativas consideradas

- Representacao de objetos de vertices e arestas: seria mais verbosa para o MVP.
- Calculo no frontend: conflitaria com a autoridade do servidor.
- Biblioteca externa de grafos: adicionaria dependencia para um dominio pequeno e bem delimitado.

## Consequencias

- O modelo e compacto e facil de enviar por Socket.IO.
- Os algoritmos podem ser testados com grafos classicos pequenos.
- O gerador aleatorio precisa de testes de invariantes e, futuramente, de controles melhores de variedade.
