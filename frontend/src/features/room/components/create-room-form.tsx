'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createRoomSchema, CreateRoomFormValues } from '@/schemas/room-schemas';

/**
 * TODO:
 * 1. useForm<CreateRoomFormValues>({ resolver: zodResolver(createRoomSchema) })
 * 2. onSubmit: getSocket().connect() -> createRoom(username) -> router.push(`/room/${code}`)
 */
export function CreateRoomForm() {
  const router = useRouter();
  return <form>{/* TODO: input de username + botão "Criar sala" */}</form>;
}
