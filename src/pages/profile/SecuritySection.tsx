import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

import { AuthField } from '@/components/auth/AuthField';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/auth.schemas';

import { profilePageStyles as styles } from './Profile.styles';

export function SecuritySection() {
  const { changePassword } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    const { error } = await changePassword(currentPassword, newPassword);

    if (error) {
      toast.error(error.message);
      return;
    }

    reset();
    toast.success('Senha alterada com sucesso.');
  });

  return (
    <section className={styles.section} aria-labelledby="profile-security-title">
      <h2 id="profile-security-title" className={styles.sectionTitle}>
        Segurança
      </h2>

      <form className={styles.securityForm} onSubmit={onSubmit} noValidate>
        <div className={styles.fieldsRow}>
          <AuthField
            label="Senha atual"
            type="password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <AuthField
            label="Nova senha"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
        </div>
        <Button
          type="submit"
          variant="pill"
          className={styles.securitySubmit}
          disabled={isSubmitting}
        >
          <Lock />
          {isSubmitting ? 'Alterando…' : 'Alterar senha'}
        </Button>
      </form>
    </section>
  );
}
