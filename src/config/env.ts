import { z } from 'zod';

import { parseEmailList } from '@/features/auth/auth.utils';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url('VITE_SUPABASE_URL inválida'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY ausente'),
  VITE_ALLOWED_EMAILS: z.string().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Variáveis de ambiente inválidas. Confira o .env.local (modelo em .env.example).\n${parsed.error.issues
      .map((issue) => `- ${issue.message}`)
      .join('\n')}`,
  );
}

export const env = {
  supabaseUrl: parsed.data.VITE_SUPABASE_URL,
  supabasePublishableKey: parsed.data.VITE_SUPABASE_PUBLISHABLE_KEY,
  allowedEmails: parseEmailList(parsed.data.VITE_ALLOWED_EMAILS),
} as const;
