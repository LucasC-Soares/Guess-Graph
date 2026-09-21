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
import { LanguageSwitcher } from '@/components/ui/language-switcher';

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
  const { locale, setLocale, t } = useI18n();
  const { roomState, gameOver, roomClosed } = useRoomState(roomCode);
  const { makeGuess, rematch, closeRoom: closeRoomMutation } = useGameActions();
  const [selectedId, setSelectedId] = useState('');
  const [guessNumber, setGuessNumber] = useState('');
  if (roomClosed) return <main className="site-shell"><div className="waiting-card panel"><p>{t('roomClosedMessage')}</p></div></main>;
  if (!roomState) return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p><p>{t('roomCodeLabel')}</p><div className="waiting-card__code">{roomCode}</div><p className="muted">{t('shareCode')}</p></div></main>;
  if (roomState.status === 'WAITING_FOR_PLAYER') return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p><p>{t('roomCodeLabel')}</p><div className="waiting-card__code">{roomCode}</div><p className="muted">{t('shareCode')}</p></div></main>;
  const isYourTurn = roomState.currentTurn === roomState.yourRole;
  const selectedGraph = roomState.opponentHand.find((graph) => graph.id === selectedId);
  const graphNumbers = new Map(roomState.opponentHand.map((graph, index) => [graph.id, index + 1]));
  const guessedGraph = roomState.opponentHand[Number(guessNumber) - 1];
  const eliminatedGraphIds = new Set(roomState.questionLog.flatMap((entry) => entry.eliminatedGraphIds));
  const winner = gameOver?.winner === roomState.yourRole;
  return <main className="site-shell"><div className="page-frame">
    <header className="room-header"><div><span className="eyebrow">{t('brand')}</span><h1 className="room-title">{roomCode}</h1></div><div className="button-row"><LanguageSwitcher locale={locale} onChange={setLocale} /><Button className="button button--danger" onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></div></header>
    <div className="status-strip"><span className="status-strip__turn">{isYourTurn ? t('yourTurn') : t('opponentTurn')}</span><Badge>{roomState.opponentHand.length} {t('candidates')}</Badge></div>
    {roomState.status === 'FINISHED' ? <section className="game-over panel"><span className="eyebrow">{t('gameOver')}</span><h1>{winner ? t('youWon') : t('youLost')}</h1><p>{t('winner')}: {gameOver?.winnerName ?? '—'}</p>{roomState.rematchRequestedBy === roomState.yourRole ? <p className="rematch-note">{t('rematchWaiting')}</p> : null}<div className="button-row"><Button className="button button--primary" disabled={rematch.isPending || roomState.rematchRequestedBy === roomState.yourRole} onClick={() => { void rematch.mutateAsync(); }}>{t('rematch')}</Button><Button className="button button--danger" disabled={closeRoomMutation.isPending} onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></div></section> : <div className="room-layout">
      <section className="panel"><h2>{t('graph')}</h2><div className="graph-grid">{roomState.opponentHand.map((graph, index) => { const graphNumber = index + 1; const eliminated = eliminatedGraphIds.has(graph.id); return <button className={`${selectedId === graph.id ? 'graph-card is-selected' : 'graph-card'}${eliminated ? ' is-eliminated' : ''}`} disabled={eliminated} key={graph.id} onClick={() => { setSelectedId(graph.id); setGuessNumber(String(graphNumber)); }} type="button"><GraphVisualization graph={graph} graphNumber={graphNumber} /><div className="graph-card__meta"><span>#{graphNumber}</span><span>{eliminated ? t('eliminated') : `${graph.vertexCount} ${t('vertices')}`}</span></div></button>; })}</div></section>
      <aside className="room-layout__side"><AskQuestionPanel isYourTurn={isYourTurn} /><section className="panel"><h2>{t('guess')}</h2><input className="input" inputMode="numeric" min="1" onChange={(event) => setGuessNumber(event.target.value)} placeholder={t('guessPlaceholder')} type="number" value={guessNumber} /><Button className="button button--quiet" disabled={!isYourTurn || !guessedGraph || eliminatedGraphIds.has(guessedGraph.id) || makeGuess.isPending} onClick={() => { if (guessedGraph) void makeGuess.mutateAsync(guessedGraph.id); }} type="button">{t('guess')}</Button></section><section className="panel"><h2>{t('question')}</h2><QuestionLog entries={roomState.questionLog} graphNumbers={graphNumbers} yourRole={roomState.yourRole} /></section></aside>
    </div>}
    {selectedGraph ? <p className="muted">{t('selected')}: #{graphNumbers.get(selectedGraph.id)}</p> : null}
  </div></main>;
}
