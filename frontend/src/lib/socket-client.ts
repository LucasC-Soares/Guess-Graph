import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/constants/config';

/**
 * Socket único, compartilhado por toda a sessão do jogador.
 * TODO: chamar getSocket().connect() explicitamente ao entrar/criar uma
 * sala (autoConnect: false evita abrir conexão antes da hora).
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { autoConnect: true });
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}
