'use client';

import { useRoomState } from '../hooks/use-room-state';
import { GraphVisualization } from './graph-visualization';
import { AskQuestionPanel } from './ask-question-panel';
import { QuestionLog } from './question-log';

interface GameBoardProps {
  roomCode: string;
}

/**
 * Composição principal da tela de jogo.
 * TODO:
 * 1. const { roomState } = useRoomState(roomCode);
 * 2. enquanto roomState === null ou status === WAITING_FOR_PLAYER,
 *    mostrar tela de espera com o código pra compartilhar.
 * 3. quando IN_PROGRESS: renderizar os grafos do oponente (GraphVisualization,
 *    um por vez ou em grid), o AskQuestionPanel e o QuestionLog.
 * 4. GAME_OVER: mostrar resultado final (quem venceu).
 */
export function GameBoard({ roomCode }: GameBoardProps) {
  return <div>{/* TODO */}</div>;
}
