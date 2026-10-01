import { GraphProperties } from '../graphs/interfaces/graph.interface';

export enum QuestionType {
  IS_CONNECTED = 'IS_CONNECTED',
  IS_BIPARTITE = 'IS_BIPARTITE',
  HAS_CYCLE = 'HAS_CYCLE',
  IS_TREE = 'IS_TREE',
  HAS_BRIDGE = 'HAS_BRIDGE',
  MAX_DEGREE_GREATER_THAN = 'MAX_DEGREE_GREATER_THAN', // pergunta parametrizada
}

export interface Question {
  type: QuestionType;
  params?: { threshold?: number };
}

export function answerQuestion(
  properties: GraphProperties,
  question: Question,
): boolean {
  switch (question.type) {
    case QuestionType.IS_CONNECTED:
      return properties.isConnected;
    case QuestionType.IS_BIPARTITE:
      return properties.isBipartite;
    case QuestionType.HAS_CYCLE:
      return properties.hasCycle;
    case QuestionType.IS_TREE:
      return properties.isTree;
    case QuestionType.HAS_BRIDGE:
      return properties.hasBridge;
    case QuestionType.MAX_DEGREE_GREATER_THAN:
      if (question.params?.threshold === undefined) {
        throw new Error('A pergunta precisa de params.threshold');
      }
      return properties.maxDegree > question.params.threshold;
    default:
      throw new Error(`Pergunta desconhecida: ${question.type}`);
  }
}
