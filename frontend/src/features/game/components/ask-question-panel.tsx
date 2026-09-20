'use client';

import { QUESTION_LABELS, QuestionType } from '@/types/graph';
import { askQuestion } from '../api/game-socket-api';

interface AskQuestionPanelProps {
  roomCode: string;
  targetRef: string;
  isYourTurn: boolean;
}

/**
 * TODO: renderizar um botão pra cada QuestionType (usando QUESTION_LABELS),
 * desabilitados se !isYourTurn. MAX_DEGREE_GREATER_THAN precisa de um
 * input numérico extra antes de habilitar o botão.
 */
export function AskQuestionPanel({ roomCode, targetRef, isYourTurn }: AskQuestionPanelProps) {
  return <div>{/* TODO */}</div>;
}
