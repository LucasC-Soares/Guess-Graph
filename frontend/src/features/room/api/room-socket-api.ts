import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { RoomStateDTO } from '@/types/room';

// TODO: emit CREATE_ROOM e aguardar ack do servidor com { code }.
// Socket.io suporta callback de ack: socket.emit(event, payload, (response) => ...)
export function createRoom(username: string): Promise<{ code: string }> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    const request = () => socket.emit(SOCKET_EVENTS.CREATE_ROOM, { username }, resolve);
    if (socket.connected) request();
    else {
      socket.once('connect', request);
      socket.once('connect_error', reject);
      socket.connect();
    }
  });
}

// TODO: emit JOIN_ROOM { code, username }; the server associates the socket with the room
export function joinRoom(code: string, username: string): void {
  const socket = getSocket();
  const request = () => socket.emit(SOCKET_EVENTS.JOIN_ROOM, { code, username });
  if (socket.connected) request();
  else {
    socket.once('connect', request);
    socket.connect();
  }
}

export function requestRematch(): void {
  getSocket().emit(SOCKET_EVENTS.REMATCH);
}

export function closeRoom(): void {
  getSocket().emit(SOCKET_EVENTS.CLOSE_ROOM);
}

// TODO: getSocket().on(SOCKET_EVENTS.OPPONENT_JOINED, callback)
//   dispara quando o segundo jogador entra e o jogo de fato começa
export function onOpponentJoined(callback: (state: RoomStateDTO) => void): void {
  getSocket().on(SOCKET_EVENTS.OPPONENT_JOINED, callback);
}

// TODO: getSocket().on(SOCKET_EVENTS.ROOM_UPDATED, callback)
export function onRoomUpdate(callback: (state: RoomStateDTO) => void): void {
  getSocket().on(SOCKET_EVENTS.ROOM_UPDATED, callback);
}
