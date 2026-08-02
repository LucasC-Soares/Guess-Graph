'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { RoomStateDTO } from '@/types/room';

/**
 * Hook central da tela de jogo: mantém o estado da sala sincronizado
 * com os eventos do servidor.
 * TODO:
 * 1. useState<RoomStateDTO | null>(null)
 * 2. useEffect: registrar listeners pra ROOM_UPDATED, OPPONENT_JOINED,
 *    QUESTION_ANSWERED, GAME_OVER — todos atualizando o state local.
 * 3. cleanup: remover os listeners no return do useEffect
 *    (getSocket().off(evento, handler)) pra evitar handlers duplicados
 *    se o componente remontar.
 */
export function useRoomState(roomCode: string) {
  const [roomState, setRoomState] = useState<RoomStateDTO | null>(null);

  useEffect(() => {
    // TODO: registrar listeners aqui
    return () => {
      // TODO: remover listeners aqui
    };
  }, [roomCode]);

  return { roomState };
}
