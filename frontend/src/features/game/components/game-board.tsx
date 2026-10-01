'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n-context';
import { useRoomState } from '../hooks/use-room-state';
import { GraphVisualization } from './graph-visualization';
import { AskQuestionPanel } from './ask-question-panel';
import { QuestionLog } from './question-log';
import { useGameActions } from '../hooks/use-game-actions';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { clearRoomSession } from '../../room/api/room-socket-api';

interface GameBoardProps {
  roomCode: string;
}

export function GameBoard({ roomCode }: GameBoardProps) {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const { roomState, gameOver, roomClosed } = useRoomState(roomCode);
  const { makeGuess, rematch, closeRoom: closeRoomMutation } = useGameActions(roomCode);
  const [selectedId, setSelectedId] = useState('');
  const [guessNumber, setGuessNumber] = useState('');
  useEffect(() => {
    if (!roomClosed) return;
    const timeout = setTimeout(() => {
      clearRoomSession();
      router.push('/');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [roomClosed, router]);
  if (roomClosed) return <main className="site-shell"><div className="page-frame closed-room-frame">
    <section aria-live="polite" className="closed-room panel">
      <div aria-hidden="true" className="closed-room__mark">×</div>
      <span className="eyebrow">{t('roomClosed')}</span>
      <h1>{t('roomClosedTitle')}</h1>
      <p className="closed-room__message">{t('roomClosedMessage')}</p>
      <p className="closed-room__redirect">{t('returningHome')}</p>
      <div aria-hidden="true" className="closed-room__progress" />
      <Button className="button button--quiet" onClick={() => { clearRoomSession(); router.push('/'); }} type="button">{t('goHome')}</Button>
    </section>
  </div></main>;
  if (!roomState) return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p><p>{t('roomCodeLabel')}</p><div className="waiting-card__code">{roomCode}</div><p className="muted">{t('shareCode')}</p></div></main>;
  if (roomState.status === 'WAITING_FOR_PLAYER') return <main className="site-shell"><div className="waiting-card panel"><p>{t('waiting')}</p><p>{t('roomCodeLabel')}</p><div className="waiting-card__code">{roomCode}</div><p className="muted">{t('shareCode')}</p></div></main>;
  const isYourTurn = roomState.currentTurn === roomState.yourRole;
  const selectedGraph = roomState.hand.find((graph) => graph.id === selectedId);
  const graphNumbers = new Map(roomState.hand.map((graph, index) => [graph.id, index + 1]));
  const guessedGraph = roomState.hand[Number(guessNumber) - 1];
  const eliminatedGraphIds = new Set(
    roomState.questionLog
      .filter((entry) => entry.askedBy === roomState.yourRole)
      .flatMap((entry) => entry.eliminatedGraphIds),
  );
  const remainingCount = roomState.hand.length - eliminatedGraphIds.size;
  const winner = gameOver?.winner === roomState.yourRole;
  return <main className="site-shell"><div className="page-frame">
    <header className="room-header"><div><span className="eyebrow">{t('brand')}</span><h1 className="room-title">{roomCode}</h1></div><div className="button-row"><LanguageSwitcher locale={locale} onChange={setLocale} /><Button className="button button--danger" onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></div></header>
    <div className="status-strip"><span className="status-strip__turn">{isYourTurn ? t('yourTurn') : t('opponentTurn')}</span><Badge>{remainingCount} {t('candidates')}</Badge></div>
    {roomState.status === 'FINISHED' ? <section className="game-over panel"><span className="eyebrow">{t('gameOver')}</span><h1>{winner ? t('youWon') : t('youLost')}</h1><p>{t('winner')}: {gameOver?.winnerName ?? '—'}</p>{roomState.rematchRequestedBy === roomState.yourRole ? <p className="rematch-note">{t('rematchWaiting')}</p> : null}<div className="button-row"><Button className="button button--primary" disabled={rematch.isPending || roomState.rematchRequestedBy === roomState.yourRole} onClick={() => { void rematch.mutateAsync(); }}>{t('rematch')}</Button><Button className="button button--danger" disabled={closeRoomMutation.isPending} onClick={() => { void closeRoomMutation.mutateAsync(); }}>{t('closeRoom')}</Button></div></section> : <div className="room-layout">
      <section className="panel"><h2>{t('graph')}</h2><div className="graph-grid">{roomState.hand.map((graph, index) => { const graphNumber = index + 1; const eliminated = eliminatedGraphIds.has(graph.id); const isYours = graph.id === roomState.yourGraphId; return <button className={`${selectedId === graph.id ? 'graph-card is-selected' : 'graph-card'}${eliminated ? ' is-eliminated' : ''}${isYours ? ' is-yours' : ''}`} disabled={eliminated || isYours} key={graph.id} onClick={() => { setSelectedId(graph.id); setGuessNumber(String(graphNumber)); }} type="button"><GraphVisualization graph={graph} graphNumber={graphNumber} /><div className="graph-card__meta"><span>#{graphNumber}</span><span>{isYours ? t('yourGraph') : eliminated ? t('eliminated') : `${graph.vertexCount} ${t('vertices')}`}</span></div></button>; })}</div></section>
      <aside className="room-layout__side"><AskQuestionPanel isYourTurn={isYourTurn} roomCode={roomCode} /><section className="panel"><h2>{t('guess')}</h2><input className="input" inputMode="numeric" min="1" onChange={(event) => setGuessNumber(event.target.value)} placeholder={t('guessPlaceholder')} type="number" value={guessNumber} /><Button className="button button--quiet" disabled={!isYourTurn || !guessedGraph || eliminatedGraphIds.has(guessedGraph.id) || guessedGraph.id === roomState.yourGraphId || makeGuess.isPending} onClick={() => { if (guessedGraph) void makeGuess.mutateAsync(guessedGraph.id); }} type="button">{t('guess')}</Button></section><section className="panel"><h2>{t('question')}</h2><QuestionLog entries={roomState.questionLog} graphNumbers={graphNumbers} yourRole={roomState.yourRole} /></section></aside>
    </div>}
    {selectedGraph ? <p className="muted">{t('selected')}: #{graphNumbers.get(selectedGraph.id)}</p> : null}
  </div></main>;
}
