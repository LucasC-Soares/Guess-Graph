import { z } from 'zod';
import { QuestionType } from '@/types/graph';

/**
 * TODO: refinamento condicional -- threshold só é obrigatório quando
 * type === MAX_DEGREE_GREATER_THAN. Dá pra fazer com z.discriminatedUnion
 * ou um .superRefine() checando o campo `type`.
 */
export const askQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType),
  threshold: z.coerce.number().int().nonnegative().optional(),
  targetGraphId: z.string(),
});
export type AskQuestionFormValues = z.infer<typeof askQuestionSchema>;
