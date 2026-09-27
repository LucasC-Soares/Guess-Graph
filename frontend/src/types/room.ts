import { GraphDTO, QuestionType } from './graph';

export type RoomStatus =
  'WAITING_FOR_PLAYER' | 'WAITING_FOR_REMATCH' | 'IN_PROGRESS' | 'FINISHED';

export interface QuestionLogEntryDTO {
  askedBy: 'player1' | 'player2';
  questionLabel: QuestionType;
  questionParams?: { threshold?: number };
  answer: boolean;
  eliminatedGraphIds: string[];
  remainingGraphIds: string[];
}

export interface QuestionAnsweredDTO {
  askedBy: 'player1' | 'player2';
  question: import('./graph').Question;
  answer: boolean;
  eliminatedGraphIds: string[];
  remainingGraphIds: string[];
  remainingCount: number;
  currentTurn: 'player1' | 'player2';
}

/**
 * TODO: ajustar conforme o payload real emitido pelo gateway
 * (OPPONENT_JOINED / ROOM_UPDATED).
 */
export interface RoomStateDTO {
  status: RoomStatus;
  hand: GraphDTO[];
  yourGraphId?: string;
  currentTurn: 'player1' | 'player2';
  questionLog: QuestionLogEntryDTO[];
  yourRole: 'player1' | 'player2';
  rematchRequestedBy?: 'player1' | 'player2' | null;
}
