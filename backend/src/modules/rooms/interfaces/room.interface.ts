import { GraphWithProperties } from '../../graphs/interfaces/graph.interface';
import { Question } from '../../questions/question-catalog';

export type RoomStatus = 'WAITING_FOR_PLAYER' | 'IN_PROGRESS' | 'FINISHED';

export interface PlayerState {
  socketId: string;
  username: string;
  hand: GraphWithProperties[]; // os grafos DESSE jogador (o oponente tenta adivinhar)
  score: number;
}

export interface QuestionLogEntry {
  askedBy: 'player1' | 'player2';
  question: Question;
  answer: boolean;
}

export interface Room {
  code: string;
  status: RoomStatus;
  players: [PlayerState | null, PlayerState | null]; // player1, player2
  currentTurn: 'player1' | 'player2';
  questionLog: QuestionLogEntry[];
  // TODO: pra rodadas com pontuação por grafo adivinhado, considerar
  // guardar aqui quais grafos já foram "chutados corretamente" por cada lado.
}
