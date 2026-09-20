'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { joinRoomSchema, JoinRoomFormValues } from '@/schemas/room-schemas';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { joinRoom } from '../api/room-socket-api';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';

/**
 * TODO: mesmo padrão do CreateRoomForm, mas com campo de código +
 * chamando joinRoom(code, username) em vez de createRoom.
 */
export function JoinRoomForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
  });
  const onSubmit = ({ code, username }: JoinRoomFormValues) => {
    try {
      joinRoom(code, username);
      router.push(`/room/${code.toUpperCase()}`);
    } catch {
      setError(t('error'));
    }
  };
  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
      <h2>{t('joinRoom')}</h2>
      <Field label={t('roomCode')} error={errors.code?.message}>
        <Input className="input" placeholder="K7M2Q" {...register('code')} />
      </Field>
      <Field label={t('username')} error={errors.username?.message}>
        <Input className="input" placeholder="Bob" {...register('username')} />
      </Field>
      {error ? <p className="error-banner">{error}</p> : null}
      <Button className="button button--quiet" disabled={isSubmitting} type="submit">{t('join')}</Button>
    </form>
  );
}
