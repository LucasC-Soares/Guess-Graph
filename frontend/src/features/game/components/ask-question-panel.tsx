'use client';

import { QuestionType, PARAMETRIC_QUESTION_TYPES, Question } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useGameActions } from '../hooks/use-game-actions';

interface AskQuestionPanelProps {
  isYourTurn: boolean;
}

/**
 * TODO: renderizar um botão pra cada QuestionType (usando QUESTION_LABELS),
 * desabilitados se !isYourTurn. MAX_DEGREE_GREATER_THAN precisa de um
 * input numérico extra antes de habilitar o botão.
 */
export function AskQuestionPanel({ isYourTurn }: AskQuestionPanelProps) {
  const { t } = useI18n();
  const { askQuestion } = useGameActions();
  const [selected, setSelected] = useState<QuestionType>(QuestionType.IS_CONNECTED);
  const [threshold, setThreshold] = useState(2);
  const supported = Object.values(QuestionType).filter((type) => ![
    QuestionType.HAS_ARTICULATION_POINT, QuestionType.HAS_ISOLATED_VERTEX, QuestionType.HAS_LEAF,
    QuestionType.HAS_TRIANGLE, QuestionType.IS_COMPLETE, QuestionType.IS_REGULAR,
    QuestionType.HAS_EULERIAN_CIRCUIT, QuestionType.EDGE_COUNT_GREATER_THAN, QuestionType.DIAMETER_GREATER_THAN,
  ].includes(type));
  return <div className="panel"><h2>{t('question')}</h2><div className="question-list">
    {supported.map((type) => <button className={selected === type ? 'question-option is-selected' : 'question-option'} key={type} onClick={() => setSelected(type)} type="button">{type}</button>)}
  </div>
  {PARAMETRIC_QUESTION_TYPES.includes(selected) ? <input className="input" min="0" onChange={(event) => setThreshold(Number(event.target.value))} type="number" value={threshold} /> : null}
  <Button className="button button--primary" disabled={!isYourTurn || askQuestion.isPending} onClick={() => { void askQuestion.mutateAsync(questionForSelection(selected, threshold)); }} type="button">{t('ask')}</Button></div>;
}

function questionForSelection(type: QuestionType, threshold: number): Question {
  return PARAMETRIC_QUESTION_TYPES.includes(type) ? { type, params: { threshold } } : { type };
}
