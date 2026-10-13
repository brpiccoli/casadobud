import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, MailCheck, Mail } from 'lucide-react';
import { Link } from 'react-router';

import { AuthField } from '@/components/auth/AuthField';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/auth.schemas';

import { authPageStyles as styles } from './auth.styles';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitError(null);
    const { error } = await requestPasswordReset(email);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSentTo(email);
  });

  const handleResend = async () => {
    if (!sentTo) return;
    setResending(true);
    await requestPasswordReset(sentTo);
    setResending(false);
  };

  if (sentTo) {
    return (
      <AuthLayout title="Link enviado" subtitle="Agora é só conferir seu email.">
        <div className={styles.form}>
          <span className={styles.sentIconWrap} aria-hidden>
            <MailCheck className="size-5" />
          </span>
          <p className={styles.sentText}>
            Enviamos o link de redefinição para <span className={styles.sentEmail}>{sentTo}</span>.
          </p>
          <Button asChild variant="cta" size="xl" className={styles.submit}>
            <Link to={ROUTES.login}>Voltar ao login</Link>
          </Button>
          <p className={styles.resendRow}>
            Não chegou?{' '}
            <button
              type="button"
              className={styles.resendButton}
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Reenviando…' : 'Reenviar'}
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Digite o email da sua conta e enviaremos um link para criar uma nova senha."
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle className={styles.errorIcon} aria-hidden />
            <span>{submitError}</span>
          </div>
        ) : null}

        <AuthField
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="voce@clube.com.br"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </Button>
        <Button asChild variant="ghost" size="xl" className={styles.secondaryAction}>
          <Link to={ROUTES.login}>Voltar ao login</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
