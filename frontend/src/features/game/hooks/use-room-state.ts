'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket-client';
import { consumePendingRoomState } from '@/lib/pending-room-state';
import { SOCKET_EVENTS } from '@/constants/config';
import { QuestionAnsweredDTO, RoomStateDTO } from '@/types/room';

export const roomQueryKey = (roomCode: string) => ['room', roomCode] as const;
export const gameOverQueryKey = (roomCode: string) =>
  ['room', roomCode, 'game-over'] as const;

const emptyRoom = (): RoomStateDTO => ({
  status: 'WAITING_FOR_PLAYER',
  currentTurn: 'player1',
  hand: [],
  yourGraphId: '',
  questionLog: [],
  yourRole: 'player1',
});

export function useRoomState(roomCode: string) {
  const [roomClosed, setRoomClosed] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: roomQueryKey(roomCode),
    queryFn: async () => null as RoomStateDTO | null,
    enabled: false,
  });
  const gameOverQuery = useQuery<{
    winner: 'player1' | 'player2';
    winnerName: string;
    correct?: boolean;
  } | null>({
    queryKey: gameOverQueryKey(roomCode),
    queryFn: async () => null,
    enabled: false,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const update = (partial: Partial<RoomStateDTO>) =>
      queryClient.setQueryData<RoomStateDTO>(
        roomQueryKey(roomCode),
        (current) => ({ ...emptyRoom(), ...current, ...partial }),
      );
    const pendingState = consumePendingRoomState();
    if (pendingState) {
      setRoomClosed(false);
      queryClient.setQueryData(gameOverQueryKey(roomCode), null);
      update(pendingState);
    }
    const onJoined = (state: RoomStateDTO) => {
      setRoomClosed(false);
      queryClient.setQueryData(gameOverQueryKey(roomCode), null);
      update(state);
    };
    const onUpdate = (state: Partial<RoomStateDTO>) => update(state);
    const onQuestion = (event: QuestionAnsweredDTO) =>
      queryClient.setQueryData<RoomStateDTO>(
        roomQueryKey(roomCode),
        (current) => ({
          ...emptyRoom(),
          ...current,
          currentTurn: event.currentTurn,
          questionLog: [
            ...(current?.questionLog ?? []),
            {
              askedBy: event.askedBy,
              questionLabel: event.question.type,
              questionParams: event.question.params,
              answer: event.answer,
              eliminatedGraphIds: event.eliminatedGraphIds,
              remainingGraphIds: event.remainingGraphIds,
            },
          ],
        }),
      );
    const onOver = (event: {
      winner: 'player1' | 'player2';
      winnerName: string;
      correct?: boolean;
    }) => {
      queryClient.setQueryData(gameOverQueryKey(roomCode), event);
      update({ status: 'FINISHED' });
    };
    const onClosed = () => {
      setRoomClosed(true);
      queryClient.setQueryData(gameOverQueryKey(roomCode), null);
    };
    socket.on(SOCKET_EVENTS.OPPONENT_JOINED, onJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, onUpdate);
    socket.on(SOCKET_EVENTS.QUESTION_ANSWERED, onQuestion);
    socket.on(SOCKET_EVENTS.GAME_OVER, onOver);
    socket.on(SOCKET_EVENTS.ROOM_CLOSED, onClosed);
    return () => {
      socket.off(SOCKET_EVENTS.OPPONENT_JOINED, onJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, onUpdate);
      socket.off(SOCKET_EVENTS.QUESTION_ANSWERED, onQuestion);
      socket.off(SOCKET_EVENTS.GAME_OVER, onOver);
      socket.off(SOCKET_EVENTS.ROOM_CLOSED, onClosed);
    };
  }, [queryClient, roomCode]);

  return {
    roomState: query.data ?? null,
    gameOver: gameOverQuery.data ?? null,
    roomClosed,
    isLoading: query.isLoading,
  };
}
