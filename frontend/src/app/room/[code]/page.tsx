'use client';

import { use, useEffect } from 'react';
import { GameBoard } from '@/features/game/components/game-board';
import { getSocket } from '@/lib/socket-client';
import {
  clearRoomSession,
  restoreRoomSession,
  resumeRoom,
} from '@/features/room/api/room-socket-api';

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { code } = use(params);

  useEffect(() => {
    const session = restoreRoomSession();
    if (!session) return;
    if (session.code !== code.toUpperCase()) return;
    getSocket();
    void resumeRoom(session.code, session.username, session.role).catch(
      () => {
        clearRoomSession();
      },
    );
  }, [code]);

  return (
    <main>
      <GameBoard roomCode={code} />
    </main>
  );
}
