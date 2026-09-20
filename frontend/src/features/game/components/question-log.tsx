import { QuestionLogEntryDTO } from '@/types/room';
import { translateQuestion } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-context';

interface QuestionLogProps {
  entries: QuestionLogEntryDTO[];
  graphNumbers: ReadonlyMap<string, number>;
}

// TODO: lista simples do histórico de perguntas/respostas (mais recente no topo).
export function QuestionLog({ entries, graphNumbers }: QuestionLogProps) {
  const { locale, t } = useI18n();
  return <div className="question-list">{entries.slice().reverse().map((entry, index) => (
    <div className="log-entry" key={`${entry.questionLabel}-${index}`}>
      <div>{translateQuestion(locale, entry.questionLabel, entry.questionParams?.threshold)}</div>
      <div className="log-entry__answer">{entry.answer ? t('yes') : t('no')}</div>
      <small className="muted">{t('eliminatedGraphIds')}: {entry.eliminatedGraphIds.map((id) => `#${graphNumbers.get(id) ?? '?'}`).join(', ') || '—'} · {entry.remainingGraphIds.length} {t('remainingGraphs')}</small>
    </div>
  ))}</div>;
}
