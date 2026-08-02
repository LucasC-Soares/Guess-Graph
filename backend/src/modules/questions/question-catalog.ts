import { Graph, GraphProperties } from '../graphs/interfaces/graph.interface';

/**
 * Perguntas de sim/não que os jogadores podem fazer. Fixas de propósito:
 * texto livre exigiria NLP pra interpretar "eu sou bipartido?" e não dá
 * pra confiar no cliente pra "responder por si" — o servidor precisa
 * validar a resposta contra as GraphProperties computadas.
 */
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
  // TODO: se for MAX_DEGREE_GREATER_THAN, o jogador precisa enviar um `threshold`
  //   junto — considerar um campo opcional `params?: { threshold?: number }`.
  params?: { threshold?: number };
}

/**
 * Dado o grafo alvo (do oponente) e a pergunta feita, retorna a resposta
 * correta (sim/não). Essa função é a "verdade" do jogo — nunca deixe o
 * cliente calcular isso sozinho.
 */
export function answerQuestion(properties: GraphProperties, question: Question): boolean {
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
      // TODO: validar que params?.threshold existe antes de comparar
      //   (lançar erro ou tratar como pergunta inválida se faltar)
      return properties.maxDegree > (question.params?.threshold ?? 0);
    default:
      throw new Error(`Pergunta desconhecida: ${question.type}`);
  }
}

/**
 * TODO: lista amigável (label em português) pra popular os botões de
 * pergunta no frontend, algo tipo:
 *   export const QUESTION_LABELS: Record<QuestionType, string> = {
 *     [QuestionType.IS_CONNECTED]: 'Este grafo é conexo?',
 *     [QuestionType.IS_BIPARTITE]: 'Este grafo é bipartido?',
 *     ...
 *   };
 * Pode exportar isso e reaproveitar via um pacote compartilhado, ou apenas
 * duplicar a lista no frontend (mais simples pro MVP, já que os dois times
 * de código não compartilham build system aqui).
 */
