import { getSocket } from '@/lib/socket-client';
import { SOCKET_EVENTS } from '@/constants/config';
import { RoomStateDTO } from '@/types/room';

const ROOM_SESSION_KEY = 'guess-graph:room-session';

let pendingRoomState: RoomStateDTO | null = null;

export function saveRoomSession(code: string, username: string, role: 'host' | 'guest' = 'guest'): void {
  const entry = { code: code.toUpperCase(), username, role };
  localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(entry));
}

export function restoreRoomSession(): { code: string; username: string; role: 'host' | 'guest' } | null {
  const raw = localStorage.getItem(ROOM_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { code: string; username: string; role: 'host' | 'guest' };
  } catch {
    return null;
  }
}

export function clearRoomSession(): void {
  localStorage.removeItem(ROOM_SESSION_KEY);
}

export function consumePendingRoomState(): RoomStateDTO | null {
  const state = pendingRoomState;
  pendingRoomState = null;
  return state;
}

// TODO: emit CREATE_ROOM e aguardar ack do servidor com { code }.
// Socket.io suporta callback de ack: socket.emit(event, payload, (response) => ...)
export function createRoom(username: string): Promise<{ code: string }> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    const request = () => socket.emit(SOCKET_EVENTS.CREATE_ROOM, { username }, (response: { code: string }) => {
      saveRoomSession(response.code, username, 'host');
      resolve(response);
    });
    if (socket.connected) request();
    else {
      socket.once('connect', request);
      socket.once('connect_error', reject);
      socket.connect();
    }
  });
}

// TODO: emit JOIN_ROOM { code, username }; the server associates the socket with the room
export function joinRoom(code: string, username: string): Promise<{ code: string; status: string; opponentHand?: RoomStateDTO['opponentHand']; currentTurn?: RoomStateDTO['currentTurn']; yourRole?: RoomStateDTO['yourRole'] }> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    const request = () => socket.emit(SOCKET_EVENTS.JOIN_ROOM, { code, username }, (response: { code: string; status: string; opponentHand?: RoomStateDTO['opponentHand']; currentTurn?: RoomStateDTO['currentTurn']; yourRole?: RoomStateDTO['yourRole'] }) => {
      if (response?.status === 'IN_PROGRESS') {
        pendingRoomState = {
          status: response.status,
          opponentHand: response.opponentHand ?? [],
          currentTurn: response.currentTurn ?? 'player1',
          yourRole: response.yourRole ?? 'player1',
          questionLog: [],
        };
      }
      saveRoomSession(response.code, username, 'guest');
      resolve(response);
    });
    socket.once(SOCKET_EVENTS.OPPONENT_JOINED, (state: RoomStateDTO) => {
      pendingRoomState = state;
    });
    if (socket.connected) request();
    else {
      socket.once('connect', request);
      socket.once('connect_error', reject);
      socket.connect();
    }
  });
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
