import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

// TODO: emit ASK_QUESTION { question }
export function askQuestion(question: Question): void {
  getSocket().emit(SOCKET_EVENTS.ASK_QUESTION, { question });
}

// TODO: emit MAKE_GUESS { guessedGraphId }
export function makeGuess(guessedGraphId: string): void {
  getSocket().emit(SOCKET_EVENTS.MAKE_GUESS, { guessedGraphId });
}
