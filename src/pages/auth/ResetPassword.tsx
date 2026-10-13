import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { AuthField } from '@/components/auth/AuthField';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/auth.schemas';

import { authPageStyles as styles } from './auth.styles';

export function ResetPassword() {
  const { session, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setSubmitError(null);
    const { error } = await updatePassword(password);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    toast.success('Senha alterada com sucesso.');
    navigate(DEFAULT_AUTHENTICATED_ROUTE, { replace: true });
  });

  if (!session) {
    return (
      <AuthLayout
        title="Link expirado"
        subtitle="Esse link de redefinição não é mais válido. Peça um novo para continuar."
      >
        <Button asChild variant="cta" size="xl" className={styles.submit}>
          <Link to={ROUTES.forgotPassword}>Pedir novo link</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nova senha" subtitle="Crie uma nova senha para acessar a casadobud.">
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle className={styles.errorIcon} aria-hidden />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div className={styles.fields}>
          <AuthField
            label="Nova senha"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <AuthField
            label="Confirmar senha"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthLayout>
  );
}
