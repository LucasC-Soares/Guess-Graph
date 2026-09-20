import { z } from 'zod';

export const createRoomSchema = z.object({
  username: z.string().min(2, 'Mínimo de 2 caracteres').max(20, 'Máximo de 20 caracteres'),
});
export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  code: z.string()
    .trim()
    .toUpperCase()
    .regex(/^[A-HJ-NP-Z2-9]{5,}$/, 'Informe um código válido com pelo menos 5 caracteres'),
  username: z.string().min(2, 'Mínimo de 2 caracteres').max(20, 'Máximo de 20 caracteres'),
});
export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
