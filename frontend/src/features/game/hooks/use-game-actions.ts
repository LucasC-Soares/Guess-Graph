'use client';

import { useMutation } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';

function emitAck<T>(event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    getSocket()
      .timeout(8000)
      .emit(event, payload, (error: Error | null, response: T) =>
        error ? reject(error) : resolve(response),
      );
  });
}

export function useGameActions() {
  const askQuestion = useMutation({
    mutationFn: (question: Question) =>
      emitAck(SOCKET_EVENTS.ASK_QUESTION, { question }),
  });
  const makeGuess = useMutation({
    mutationFn: (guessedGraphId: string) =>
      emitAck(SOCKET_EVENTS.MAKE_GUESS, { guessedGraphId }),
  });
  const rematch = useMutation({
    mutationFn: () => emitAck(SOCKET_EVENTS.REMATCH),
  });
  const closeRoom = useMutation({
    mutationFn: () => emitAck(SOCKET_EVENTS.CLOSE_ROOM),
  });
  return { askQuestion, makeGuess, rematch, closeRoom };
}
