import { QuestionLogEntryDTO } from '@/types/room';

interface QuestionLogProps {
  entries: QuestionLogEntryDTO[];
}

// TODO: lista simples do histórico de perguntas/respostas (mais recente no topo).
export function QuestionLog({ entries }: QuestionLogProps) {
  return <ul>{/* TODO: entries.map(...) */}</ul>;
}
