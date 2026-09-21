import { RoomStateDTO } from '@/types/room';

let pendingRoomState: RoomStateDTO | null = null;

export function savePendingRoomState(state: RoomStateDTO): void {
  pendingRoomState = state;
}

export function consumePendingRoomState(): RoomStateDTO | null {
  const state = pendingRoomState;
  pendingRoomState = null;
  return state;
}
