'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { Question } from '@/types/graph';
import { gameOverQueryKey, roomQueryKey } from './use-room-state';

function emitAck<T>(event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    getSocket()
      .timeout(8000)
      .emit(event, payload, (error: Error | null, response: T) =>
        error ? reject(error) : resolve(response),
      );
  });
}

export function useGameActions(roomCode: string) {
  const queryClient = useQueryClient();
  const invalidateRoom = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: roomQueryKey(roomCode) }),
    queryClient.invalidateQueries({ queryKey: gameOverQueryKey(roomCode) }),
  ]);
  const askQuestion = useMutation({
    mutationFn: (question: Question) =>
      emitAck(SOCKET_EVENTS.ASK_QUESTION, { question }),
    onSuccess: invalidateRoom,
  });
  const makeGuess = useMutation({
    mutationFn: (guessedGraphId: string) =>
      emitAck(SOCKET_EVENTS.MAKE_GUESS, { guessedGraphId }),
    onSuccess: invalidateRoom,
  });
  const rematch = useMutation({
    mutationFn: () => emitAck(SOCKET_EVENTS.REMATCH),
    onSuccess: invalidateRoom,
  });
  const closeRoom = useMutation({
    mutationFn: () => emitAck(SOCKET_EVENTS.CLOSE_ROOM),
    onSuccess: invalidateRoom,
  });
  return { askQuestion, makeGuess, rematch, closeRoom };
}
