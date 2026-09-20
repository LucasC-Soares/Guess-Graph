/**
 * Representação de um grafo simples e não-direcionado.
 * Vértices são inteiros de 0 a n-1; arestas como lista de pares.
 */
export interface Graph {
  id: string; // usado pra referenciar no chute do oponente (uuid ou índice)
  vertexCount: number;
  edges: [number, number][];
}

export interface GraphProperties {
  isConnected: boolean;
  isBipartite: boolean;
  hasCycle: boolean;
  isTree: boolean;
  hasBridge: boolean;
  maxDegree: number;
  minDegree: number;
}

export interface GraphWithProperties {
  graph: Graph;
  properties: GraphProperties;
}
