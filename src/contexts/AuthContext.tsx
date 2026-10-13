import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { env } from '@/config/env';
import { PASSWORD_MIN_LENGTH, buildPasswordResetRedirectUrl } from '@/constants/auth';
import { isEmailAllowed } from '@/features/auth/auth.utils';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.email('Email inválido').max(255, 'Email muito longo');
const passwordSchema = z.string().min(1, 'Informe sua senha');
const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`);

const INVALID_CREDENTIALS_MESSAGE =
  'Email ou senha incorretos. Tente de novo ou recupere sua senha.';
const ACCESS_DENIED_MESSAGE = 'Este email ainda não tem acesso à casadobud. Fale com o Bud.';

function hasCasaDoBudAccess(session: Session | null): session is Session {
  return session !== null && isEmailAllowed(session.user.email, env.allowedEmails);
}

function discardLocalSession() {
  setTimeout(() => {
    void supabase.auth.signOut({ scope: 'local' });
  }, 0);
}

type AuthResult = { error: Error | null };

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  passwordRecoveryPending: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthError(error: unknown, fallback: string): Error {
  if (error instanceof z.ZodError) {
    return new Error(error.issues[0]?.message ?? fallback);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecoveryPending, setPasswordRecoveryPending] = useState(false);

  useEffect(() => {
    const applySession = (nextSession: Session | null) => {
      if (nextSession && !hasCasaDoBudAccess(nextSession)) {
        discardLocalSession();
        setSession(null);
        return;
      }
      setSession(nextSession);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY' && hasCasaDoBudAccess(nextSession)) {
        setPasswordRecoveryPending(true);
      }
      applySession(nextSession);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao recuperar sessão:', error);
          setSession(null);
          return;
        }
        applySession(data.session);
      })
      .catch((error: unknown) => {
        console.error('Erro inesperado de autenticação:', error);
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: new Error(INVALID_CREDENTIALS_MESSAGE) };
      }

      if (!hasCasaDoBudAccess(data.session)) {
        return { error: new Error(ACCESS_DENIED_MESSAGE) };
      }

      return { error: null };
    } catch (error) {
      return { error: toAuthError(error, 'Não foi possível entrar.') };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      emailSchema.parse(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildPasswordResetRedirectUrl(),
      });
      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: toAuthError(error, 'Não foi possível enviar o link.') };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    try {
      newPasswordSchema.parse(newPassword);

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: new Error(error.message) };
      }

      setPasswordRecoveryPending(false);
      return { error: null };
    } catch (error) {
      return { error: toAuthError(error, 'Não foi possível alterar a senha.') };
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
      const email = session?.user.email;
      if (!email) {
        return { error: new Error('Sessão inválida. Entre novamente.') };
      }

      try {
        passwordSchema.parse(currentPassword);
        newPasswordSchema.parse(newPassword);

        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (reauthError) {
          return { error: new Error('Senha atual incorreta.') };
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { error: new Error(error.message) };
        }

        return { error: null };
      } catch (error) {
        return { error: toAuthError(error, 'Não foi possível alterar a senha.') };
      }
    },
    [session?.user.email],
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Erro ao sair:', error);
      }
    } finally {
      setPasswordRecoveryPending(false);
      setSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      passwordRecoveryPending,
      signIn,
      requestPasswordReset,
      updatePassword,
      changePassword,
      signOut,
    }),
    [
      session,
      loading,
      passwordRecoveryPending,
      signIn,
      requestPasswordReset,
      updatePassword,
      changePassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
