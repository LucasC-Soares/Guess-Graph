'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n-context';
import { useRoomState } from '../hooks/use-room-state';
import { GraphVisualization } from './graph-visualization';
import { AskQuestionPanel } from './ask-question-panel';
import { QuestionLog } from './question-log';
import { useGameActions } from '../hooks/use-game-actions';

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
  const { t } = useI18n();
  const { roomState, gameOver } = useRoomState(roomCode);
  const { makeGuess, rematch, closeRoom: closeRoomMutation } = useGameActions();
  const [selectedId, setSelectedId] = useState('');
  const [guessId, setGuessId] = useState('');
  if (!roomState) return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p></div></main>;
  if (roomState.status === 'WAITING_FOR_PLAYER') return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p><div className="waiting-card__code">{roomCode}</div><p className="muted">{t('shareCode')}</p></div></main>;
  const isYourTurn = roomState.currentTurn === roomState.yourRole;
  const selectedGraph = roomState.opponentHand.find((graph) => graph.id === selectedId);
  const winner = gameOver?.winner === roomState.yourRole;
  return <main className="site-shell"><div className="page-frame">
    <header className="room-header"><div><span className="eyebrow">{t('brand')}</span><h1 className="room-title">{roomCode}</h1></div><Button className="button button--danger" onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></header>
    <div className="status-strip"><span className="status-strip__turn">{isYourTurn ? t('yourTurn') : t('opponentTurn')}</span><Badge>{roomState.opponentHand.length} {t('candidates')}</Badge></div>
    {roomState.status === 'FINISHED' ? <section className="game-over panel"><span className="eyebrow">{t('gameOver')}</span><h1>{winner ? t('yes') : t('no')}</h1><p>{t('winner')}: {gameOver?.winner ?? '—'}</p><div className="button-row"><Button className="button button--primary" onClick={() => { void rematch.mutateAsync(); }}>{t('rematch')}</Button><Button className="button button--danger" onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></div></section> : <div className="room-layout">
      <section className="panel"><h2>{t('graph')}</h2><div className="graph-grid">{roomState.opponentHand.map((graph) => <button className={selectedId === graph.id ? 'graph-card is-selected' : 'graph-card'} key={graph.id} onClick={() => { setSelectedId(graph.id); setGuessId(graph.id); }} type="button"><GraphVisualization graph={graph} /><div className="graph-card__meta"><span>#{graph.id.slice(0, 6)}</span><span>{graph.vertexCount} {t('vertices')}</span></div></button>)}</div></section>
      <aside className="room-layout__side"><AskQuestionPanel isYourTurn={isYourTurn} /><section className="panel"><h2>{t('guess')}</h2><input className="input" onChange={(event) => setGuessId(event.target.value)} placeholder={t('guessPlaceholder')} value={guessId} /><Button className="button button--quiet" disabled={!isYourTurn || !guessId || makeGuess.isPending} onClick={() => { void makeGuess.mutateAsync(guessId); }} type="button">{t('guess')}</Button></section><section className="panel"><h2>{t('question')}</h2><QuestionLog entries={roomState.questionLog} /></section></aside>
    </div>}
    {selectedGraph ? <p className="muted">{t('selected')}: {selectedGraph.id}</p> : null}
  </div></main>;
}
