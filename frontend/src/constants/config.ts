export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

/**
 * Precisa bater 1:1 com o objeto EVENTS em
 * backend/src/modules/rooms/rooms.gateway.ts — mantenha sincronizado
 * manualmente (projeto pequeno o bastante pra não valer a pena um
 * pacote compartilhado ainda).
 */
export const SOCKET_EVENTS = {
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  RESUME_ROOM: 'room:resume',
  ASK_QUESTION: 'game:ask-question',
  MAKE_GUESS: 'game:make-guess',
  REMATCH: 'game:rematch',
  CLOSE_ROOM: 'room:close',
  ROOM_UPDATED: 'room:updated',
  OPPONENT_JOINED: 'room:opponent-joined',
  QUESTION_ANSWERED: 'game:question-answered',
  GAME_OVER: 'game:over',
  ROOM_CLOSED: 'room:closed',
} as const;
