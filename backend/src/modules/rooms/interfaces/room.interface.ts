import { GraphWithProperties } from '../../graphs/interfaces/graph.interface';
import { Question, QuestionType } from '../../questions/question-catalog';

export type RoomStatus = 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';

export interface PlayerState {
  socketId: string;
  username: string;
  secretGraphId?: string;
  remainingOpponentGraphIds: string[];
  score: number;
  guessedGraphIds: string[];
}

export interface QuestionLogEntry {
  askedBy: 'player1' | 'player2';
  questionLabel: QuestionType;
  questionParams?: Question['params'];
  answer: boolean;
  eliminatedGraphIds: string[];
  remainingGraphIds: string[];
}

export interface Room {
  code: string;
  status: RoomStatus;
  players: [PlayerState | null, PlayerState | null];
  currentTurn: 'player1' | 'player2';
  questionLog: QuestionLogEntry[];
  rematchVotes: ('player1' | 'player2')[];
  hand: GraphWithProperties[];
}
