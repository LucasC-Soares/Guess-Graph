import { z } from 'zod';

export const createRoomSchema = z.object({
  username: z.string().min(2, 'Mínimo de 2 caracteres').max(20, 'Máximo de 20 caracteres'),
});
export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  code: z.string().length(4, 'O código tem 4 caracteres').toUpperCase(),
  username: z.string().min(2, 'Mínimo de 2 caracteres').max(20, 'Máximo de 20 caracteres'),
});
export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
