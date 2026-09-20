import { QuestionLogEntryDTO } from '@/types/room';

interface QuestionLogProps {
  entries: QuestionLogEntryDTO[];
}

// TODO: lista simples do histórico de perguntas/respostas (mais recente no topo).
export function QuestionLog({ entries }: QuestionLogProps) {
  return <div className="question-list">{entries.slice().reverse().map((entry, index) => (
    <div className="log-entry" key={`${entry.questionLabel}-${index}`}>
      <div>{entry.questionLabel}</div>
      <div className="log-entry__answer">{entry.answer ? 'YES / SIM' : 'NO / NÃO'}</div>
      <small className="muted">{entry.eliminatedGraphIds.length} discarded, {entry.remainingGraphIds.length} remaining</small>
    </div>
  ))}</div>;
}
