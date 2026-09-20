import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

// TODO: emit ASK_QUESTION { question }
export function askQuestion(question: Question): void {
  throw new Error('não implementado');
}

// TODO: emit MAKE_GUESS { guessedGraphId }
export function makeGuess(guessedGraphId: string): void {
  throw new Error('não implementado');
}
