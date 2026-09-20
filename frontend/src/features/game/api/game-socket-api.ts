import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

// TODO: emit ASK_QUESTION { graphId, question }
// TODO: emit ASK_QUESTION { targetRef, question }
export function askQuestion(targetRef: string, question: Question): void {
  throw new Error('não implementado');
}

// TODO: emit MAKE_GUESS { graphId, guessedGraphId }
// TODO: emit MAKE_GUESS { targetRef, guessedGraphId }
export function makeGuess(targetRef: string, guessedGraphId: string): void {
  throw new Error('não implementado');
}
