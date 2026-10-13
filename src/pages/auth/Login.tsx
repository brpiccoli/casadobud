import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

import { AuthField } from '@/components/auth/AuthField';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { BUD_CONTACT_URL } from '@/constants/auth';
import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth.schemas';
import type { LoginLocationState } from '@/types/navigation.types';

import { authPageStyles as styles } from './auth.styles';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    const { error } = await signIn(email, password);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    const from = (location.state as LoginLocationState | null)?.from;
    navigate(from ?? DEFAULT_AUTHENTICATED_ROUTE, { replace: true });
  });

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para acompanhar o seu time."
      footer={
        <>
          Ainda não tem acesso?{' '}
          <a href={BUD_CONTACT_URL} className={styles.footerLink}>
            Fale com o Bud
          </a>
        </>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle className={styles.errorIcon} aria-hidden />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div className={styles.fields}>
          <AuthField
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="voce@clube.com.br"
            error={errors.email?.message}
            {...register('email')}
          />
          <AuthField
            label="Senha"
            type="password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className={styles.forgotLinkRow}>
          <Link to={ROUTES.forgotPassword} className={styles.link}>
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
