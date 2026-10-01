import {
  answerQuestion,
  QuestionType,
} from './question-catalog';

describe('answerQuestion', () => {
  const properties = {
    isConnected: true,
    isBipartite: false,
    hasCycle: true,
    isTree: false,
    hasBridge: true,
    maxDegree: 3,
    minDegree: 1,
  };

  it.each([
    [QuestionType.IS_CONNECTED, true],
    [QuestionType.IS_BIPARTITE, false],
    [QuestionType.HAS_CYCLE, true],
    [QuestionType.IS_TREE, false],
    [QuestionType.HAS_BRIDGE, true],
  ] as const)('answers %s from graph properties', (type, expected) => {
    expect(answerQuestion(properties, { type })).toBe(expected);
  });

  it('answers a maximum-degree question using its threshold', () => {
    expect(
      answerQuestion(properties, {
        type: QuestionType.MAX_DEGREE_GREATER_THAN,
        params: { threshold: 2 },
      }),
    ).toBe(true);
    expect(
      answerQuestion(properties, {
        type: QuestionType.MAX_DEGREE_GREATER_THAN,
        params: { threshold: 3 },
      }),
    ).toBe(false);
  });

  it('rejects a parameterized question without a threshold', () => {
    expect(() =>
      answerQuestion(properties, {
        type: QuestionType.MAX_DEGREE_GREATER_THAN,
      }),
    ).toThrow('A pergunta precisa de params.threshold');
  });

  it('rejects an unknown question type', () => {
    expect(() =>
      answerQuestion(properties, { type: 'UNKNOWN' as QuestionType }),
    ).toThrow('Pergunta desconhecida: UNKNOWN');
  });
});
