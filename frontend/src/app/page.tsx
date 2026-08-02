import { CreateRoomForm } from '@/features/room/components/create-room-form';
import { JoinRoomForm } from '@/features/room/components/join-room-form';

export default function HomePage() {
  return (
    <main>
      <h1>Guess Graph</h1>
      <CreateRoomForm />
      <JoinRoomForm />
    </main>
  );
}
