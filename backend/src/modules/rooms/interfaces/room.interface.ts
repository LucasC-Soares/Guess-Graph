import { GraphWithProperties } from '../../graphs/interfaces/graph.interface';
import { Question } from '../../questions/question-catalog';

export type RoomStatus = 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';

export interface PlayerState {
  socketId: string;
  username: string;
  secretGraphId?: string; // o grafo secreto DESSE jogador, dentro da mão compartilhada (Room.hand)
  remainingOpponentGraphIds: string[];
  score: number;
  guessedGraphIds: string[];
}

export interface QuestionLogEntry {
  askedBy: 'player1' | 'player2';
  question: Question;
  answer: boolean;
  eliminatedGraphIds: string[];
  remainingGraphIds: string[];
}

export interface Room {
  code: string;
  status: RoomStatus;
  players: [PlayerState | null, PlayerState | null]; // player1, player2
  currentTurn: 'player1' | 'player2';
  questionLog: QuestionLogEntry[];
  rematchVotes: ('player1' | 'player2')[];
  hand: GraphWithProperties[]; // mão compartilhada entre os dois jogadores
}
