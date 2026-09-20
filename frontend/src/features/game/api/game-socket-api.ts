import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

// TODO: emit ASK_QUESTION { graphId, question }
export function askQuestion(graphId: string, question: Question): void {
  throw new Error('não implementado');
}

// TODO: emit MAKE_GUESS { graphId, guessedGraphId }
export function makeGuess(graphId: string, guessedGraphId: string): void {
  throw new Error('não implementado');
}
