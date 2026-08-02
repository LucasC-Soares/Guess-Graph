/**
 * Representação de um grafo simples e não-direcionado.
 * Vértices são inteiros de 0 a n-1; arestas como lista de pares.
 */
export interface Graph {
  id: string; // usado pra referenciar no chute do oponente (uuid ou índice)
  vertexCount: number;
  edges: [number, number][];
}

/**
 * Propriedades pré-computadas no momento da geração — nunca confie no
 * cliente pra calcular isso, o servidor é a fonte da verdade das respostas.
 */
export interface GraphProperties {
  isConnected: boolean;
  isBipartite: boolean;
  hasCycle: boolean;
  isTree: boolean; // conexo + sem ciclo
  hasBridge: boolean;
  maxDegree: number;
  // TODO: adicionar mais propriedades conforme for expandindo o catálogo
  // de perguntas (ver questions/question-catalog.ts). Ex: isEulerian,
  // isRegular, vertexCount par/ímpar (essa nem precisa pré-computar).
}

export interface GraphWithProperties {
  graph: Graph;
  properties: GraphProperties;
}
