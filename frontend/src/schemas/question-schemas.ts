import { z } from 'zod';
import { QuestionType } from '@/types/graph';

export const askQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType),
  threshold: z.coerce.number().int().nonnegative().optional(),
  targetGraphId: z.string(),
});
export type AskQuestionFormValues = z.infer<typeof askQuestionSchema>;
