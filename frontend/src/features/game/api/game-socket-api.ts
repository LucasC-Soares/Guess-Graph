import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

// TODO: emit ASK_QUESTION { code, question }
export function askQuestion(code: string, question: Question): void {
  throw new Error('não implementado');
}

// TODO: emit MAKE_GUESS { code, graphId, guessedGraphId }
export function makeGuess(code: string, graphId: string, guessedGraphId: string): void {
  throw new Error('não implementado');
}
