import { GameBoard } from '@/features/game/components/game-board';

interface RoomPageProps {
  params: { code: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <main>
      <GameBoard roomCode={params.code} />
    </main>
  );
}
