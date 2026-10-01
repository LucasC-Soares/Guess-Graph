'use client';

import { QuestionType, PARAMETRIC_QUESTION_TYPES, Question } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { translateQuestion } from '@/lib/i18n';
import { useGameActions } from '../hooks/use-game-actions';

interface AskQuestionPanelProps {
  isYourTurn: boolean;
}

export function AskQuestionPanel({ isYourTurn }: AskQuestionPanelProps) {
  const { locale, t } = useI18n();
  const { askQuestion } = useGameActions();
  const [selected, setSelected] = useState<QuestionType>(QuestionType.IS_CONNECTED);
  const [threshold, setThreshold] = useState('2');
  const supported = Object.values(QuestionType);
  return <div className="panel"><h2>{t('question')}</h2><div className="question-list">
    {supported.map((type) => <button className={selected === type ? 'question-option is-selected' : 'question-option'} key={type} onClick={() => setSelected(type)} type="button">{translateQuestion(locale, type, Number(threshold))}</button>)}
  </div>
  {PARAMETRIC_QUESTION_TYPES.includes(selected) ? <input aria-label={t('threshold')} className="input" min="0" max="10" onChange={(event) => {
    const value = event.target.value;
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
      setThreshold(value);
    }
  }} type="number" value={threshold} /> : null}
  <Button className="button button--primary" disabled={!isYourTurn || askQuestion.isPending || threshold === ''} onClick={() => { void askQuestion.mutateAsync(questionForSelection(selected, Number(threshold))); }} type="button">{t('ask')}</Button></div>;
}

function questionForSelection(type: QuestionType, threshold: number): Question {
  return PARAMETRIC_QUESTION_TYPES.includes(type) ? { type, params: { threshold } } : { type };
}
