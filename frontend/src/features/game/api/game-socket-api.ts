import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

export function askQuestion(question: Question): void {
  getSocket().emit(SOCKET_EVENTS.ASK_QUESTION, { question });
}

export function makeGuess(guessedGraphId: string): void {
  getSocket().emit(SOCKET_EVENTS.MAKE_GUESS, { guessedGraphId });
}
