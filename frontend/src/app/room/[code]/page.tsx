'use client';

import { use, useEffect } from 'react';
import { GameBoard } from '@/features/game/components/game-board';
import { getSocket } from '@/lib/socket-client';
import { restoreRoomSession } from '@/features/room/api/room-socket-api';

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { code } = use(params);

  useEffect(() => {
    const session = restoreRoomSession();
    if (!session) return;
    if (session.code !== code.toUpperCase()) return;
    if (session.role === 'guest') {
      getSocket();
    }
  }, [code]);

  return (
    <main>
      <GameBoard roomCode={code} />
    </main>
  );
}
