'use client';

import { useEffect } from 'react';
import { GameBoard } from '@/features/game/components/game-board';
import { getSocket } from '@/lib/socket-client';
import { joinRoom, restoreRoomSession } from '@/features/room/api/room-socket-api';

interface RoomPageProps {
  params: { code: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  useEffect(() => {
    const session = restoreRoomSession();
    if (!session) return;
    if (session.code !== params.code.toUpperCase()) return;
    if (session.role === 'guest') {
      getSocket();
      void joinRoom(session.code, session.username).catch(() => undefined);
    }
  }, [params.code]);

  return (
    <main>
      <GameBoard roomCode={params.code} />
    </main>
  );
}
