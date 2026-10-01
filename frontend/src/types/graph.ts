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
  MAX_DEGREE_GREATER_THAN = 'MAX_DEGREE_GREATER_THAN',
}

export const QUESTION_LABELS: Record<QuestionType, string> = {
  [QuestionType.IS_CONNECTED]: 'Este grafo é conexo?',
  [QuestionType.IS_BIPARTITE]: 'Este grafo é bipartido?',
  [QuestionType.HAS_CYCLE]: 'Este grafo tem ciclo?',
  [QuestionType.IS_TREE]: 'Este grafo é uma árvore?',
  [QuestionType.HAS_BRIDGE]: 'Este grafo tem alguma ponte?',
  [QuestionType.MAX_DEGREE_GREATER_THAN]: 'O grau máximo é maior que X?',
};

export const PARAMETRIC_QUESTION_TYPES: QuestionType[] = [
  QuestionType.MAX_DEGREE_GREATER_THAN,
];

export interface Question {
  type: QuestionType;
  params?: { threshold?: number };
}
