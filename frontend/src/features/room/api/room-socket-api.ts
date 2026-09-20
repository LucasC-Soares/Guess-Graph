import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { RoomStateDTO } from '@/types/room';

// TODO: emit CREATE_ROOM e aguardar ack do servidor com { code }.
// Socket.io suporta callback de ack: socket.emit(event, payload, (response) => ...)
export function createRoom(username: string): Promise<{ code: string }> {
  throw new Error('não implementado');
}

// TODO: emit JOIN_ROOM { code, username }; the server associates the socket with the room
export function joinRoom(code: string, username: string): void {
  throw new Error('não implementado');
}

// TODO: getSocket().on(SOCKET_EVENTS.OPPONENT_JOINED, callback)
//   dispara quando o segundo jogador entra e o jogo de fato começa
export function onOpponentJoined(callback: (state: RoomStateDTO) => void): void {
  throw new Error('não implementado');
}

// TODO: getSocket().on(SOCKET_EVENTS.ROOM_UPDATED, callback)
export function onRoomUpdate(callback: (state: RoomStateDTO) => void): void {
  throw new Error('não implementado');
}
