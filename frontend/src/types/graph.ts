/** Espelha backend/src/modules/graphs/interfaces/graph.interface.ts */
export interface GraphDTO {
  id: string;
  vertexCount: number;
  edges: [number, number][];
}

export enum QuestionType {
  IS_CONNECTED = 'IS_CONNECTED',
  IS_BIPARTITE = 'IS_BIPARTITE',
  HAS_CYCLE = 'HAS_CYCLE',
  IS_TREE = 'IS_TREE',
  HAS_BRIDGE = 'HAS_BRIDGE',
  HAS_ARTICULATION_POINT = 'HAS_ARTICULATION_POINT',
  HAS_ISOLATED_VERTEX = 'HAS_ISOLATED_VERTEX',
  HAS_LEAF = 'HAS_LEAF',
  HAS_TRIANGLE = 'HAS_TRIANGLE',
  IS_COMPLETE = 'IS_COMPLETE',
  IS_REGULAR = 'IS_REGULAR',
  HAS_EULERIAN_CIRCUIT = 'HAS_EULERIAN_CIRCUIT',
  MAX_DEGREE_GREATER_THAN = 'MAX_DEGREE_GREATER_THAN',
  EDGE_COUNT_GREATER_THAN = 'EDGE_COUNT_GREATER_THAN',
  DIAMETER_GREATER_THAN = 'DIAMETER_GREATER_THAN',
}

export const QUESTION_LABELS: Record<QuestionType, string> = {
  [QuestionType.IS_CONNECTED]: 'Este grafo é conexo?',
  [QuestionType.IS_BIPARTITE]: 'Este grafo é bipartido?',
  [QuestionType.HAS_CYCLE]: 'Este grafo tem ciclo?',
  [QuestionType.IS_TREE]: 'Este grafo é uma árvore?',
  [QuestionType.HAS_BRIDGE]: 'Este grafo tem alguma ponte?',
  [QuestionType.HAS_ARTICULATION_POINT]: 'Este grafo tem algum ponto de articulação?',
  [QuestionType.HAS_ISOLATED_VERTEX]: 'Este grafo tem algum vértice isolado (grau 0)?',
  [QuestionType.HAS_LEAF]: 'Este grafo tem algum vértice folha (grau 1)?',
  [QuestionType.HAS_TRIANGLE]: 'Este grafo tem algum triângulo?',
  [QuestionType.IS_COMPLETE]: 'Este grafo é completo?',
  [QuestionType.IS_REGULAR]: 'Este grafo é regular (todos os vértices com mesmo grau)?',
  [QuestionType.HAS_EULERIAN_CIRCUIT]: 'Este grafo tem um circuito euleriano?',
  [QuestionType.MAX_DEGREE_GREATER_THAN]: 'O grau máximo é maior que X?',
  [QuestionType.EDGE_COUNT_GREATER_THAN]: 'O número de arestas é maior que X?',
  [QuestionType.DIAMETER_GREATER_THAN]: 'O diâmetro é maior que X?',
};

/**
 * Perguntas paramétricas: o jogador escolhe X, então precisam de um input
 * numérico extra na UI (ver features/game/components/ask-question-panel.tsx).
 * As demais são puramente binárias — nenhum parâmetro necessário.
 */
export const PARAMETRIC_QUESTION_TYPES: QuestionType[] = [
  QuestionType.MAX_DEGREE_GREATER_THAN,
  QuestionType.EDGE_COUNT_GREATER_THAN,
  QuestionType.DIAMETER_GREATER_THAN,
];

export interface Question {
  type: QuestionType;
  params?: { threshold?: number };
}