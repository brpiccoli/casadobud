import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COMING_SOON_MESSAGE } from '@/constants/feedback';
import { profileNameSchema, type ProfileNameFormValues } from '@/features/auth/auth.schemas';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import { useUpdateStaffProfileMutation } from '@/hooks/useStaffProfileQuery';

import { profilePageStyles as styles } from './Profile.styles';

export function AccountSection() {
  const { displayName, roleLabel, initials, avatarUrl, email } = useCurrentStaff();
  const { mutateAsync: updateProfile } = useUpdateStaffProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileNameFormValues>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: displayName },
  });

  useEffect(() => {
    reset({ name: displayName });
  }, [displayName, reset]);

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      await updateProfile({ name });
      toast.success('Nome atualizado.');
    } catch {
      toast.error('Não foi possível salvar seu nome.');
    }
  });

  return (
    <section className={styles.section} aria-labelledby="profile-account-title">
      <h2 id="profile-account-title" className={styles.sectionTitle}>
        Conta
      </h2>

      <div className={styles.identityRow}>
        <Avatar size="lg">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={styles.identity}>
          <span className={styles.identityName}>{displayName}</span>
          {roleLabel ? <span className={styles.identityRole}>{roleLabel}</span> : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => toast.info(COMING_SOON_MESSAGE)}>
          Alterar foto
        </Button>
      </div>

      <form className={styles.fieldsRow} onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <Label htmlFor="profile-name">Nome</Label>
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            {...register('name')}
          />
          {errors.name ? <p className={styles.fieldError}>{errors.name.message}</p> : null}
        </div>
        <div className={styles.field}>
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} readOnly />
        </div>
        {isDirty ? (
          <div className={styles.inlineActions}>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => reset({ name: displayName })}
            >
              Cancelar
            </Button>
          </div>
        ) : null}
      </form>
    </section>
  );
}
