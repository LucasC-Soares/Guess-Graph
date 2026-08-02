'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { joinRoomSchema, JoinRoomFormValues } from '@/schemas/room-schemas';

/**
 * TODO: mesmo padrão do CreateRoomForm, mas com campo de código +
 * chamando joinRoom(code, username) em vez de createRoom.
 */
export function JoinRoomForm() {
  const router = useRouter();
  return <form>{/* TODO: input de código + username + botão "Entrar" */}</form>;
}
