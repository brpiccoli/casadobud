import { ROUTES } from '@/constants/routes';

export const PASSWORD_MIN_LENGTH = 8;

export const BUD_CONTACT_URL = 'mailto:suporte@falecombud.com.br';

export function buildPasswordResetRedirectUrl(): string {
  return `${window.location.origin}${ROUTES.resetPassword}`;
}
