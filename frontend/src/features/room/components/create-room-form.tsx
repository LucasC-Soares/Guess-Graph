'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createRoomSchema, CreateRoomFormValues } from '@/schemas/room-schemas';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createRoom } from '../api/room-socket-api';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';

export function CreateRoomForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
  });
  const onSubmit = async ({ username }: CreateRoomFormValues) => {
    try {
      const { code } = await createRoom(username);
      router.push(`/room/${code}`);
    } catch {
      setError(t('error'));
    }
  };
  return (
    <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
      <h2>{t('createRoom')}</h2>
      <Field label={t('username')} error={errors.username?.message}>
        <Input className="input" placeholder="Alice" {...register('username')} />
      </Field>
      {error ? <p className="error-banner">{error}</p> : null}
      <Button className="button button--primary" disabled={isSubmitting} type="submit">{t('create')}</Button>
    </form>
  );
}
