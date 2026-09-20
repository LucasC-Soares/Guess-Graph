import { GraphDTO } from './graph';

export type RoomStatus = 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';

export interface QuestionLogEntryDTO {
  askedBy: 'player1' | 'player2';
  questionLabel: string;
  answer: boolean;
  eliminatedGraphIds: string[];
  remainingGraphIds: string[];
}

export interface QuestionAnsweredDTO {
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
  opponentHand: GraphDTO[];
  currentTurn: 'player1' | 'player2';
  questionLog: QuestionLogEntryDTO[];
  yourRole: 'player1' | 'player2';
}
