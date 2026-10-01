import { QuestionLogEntryDTO } from '@/types/room';
import { translateQuestion } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-context';

interface QuestionLogProps {
  entries: QuestionLogEntryDTO[];
  graphNumbers: ReadonlyMap<string, number>;
  yourRole: 'player1' | 'player2';
}

export function QuestionLog({ entries, graphNumbers, yourRole }: QuestionLogProps) {
  const { locale, t } = useI18n();
  return <div className="question-list">{entries.map((entry, index) => {
    const questionNumber = index + 1;
    const askedBy = entry.askedBy === yourRole ? t('you') : t('opponent');
    const entryKey = [
      entry.askedBy,
      entry.questionLabel,
      JSON.stringify(entry.questionParams),
      entry.answer,
      entry.eliminatedGraphIds.join(','),
      entry.remainingGraphIds.join(','),
    ].join(':');
    return (
      <div className="log-entry" key={entryKey}>
        <div><strong>{t('questionNumber').replace('{number}', String(questionNumber))}</strong> · {askedBy}</div>
        <div>{translateQuestion(locale, entry.questionLabel, entry.questionParams?.threshold)}</div>
        <div className="log-entry__answer">{entry.answer ? t('yes') : t('no')}</div>
        <small className="muted">{t('eliminatedGraphIds')}: {entry.eliminatedGraphIds.map((id) => `#${graphNumbers.get(id) ?? '?'}`).join(', ') || '—'} · {entry.remainingGraphIds.length} {t('remainingGraphs')}</small>
      </div>
    );
  })}</div>;
}
