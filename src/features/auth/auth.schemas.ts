import { z } from 'zod';

import { PASSWORD_MIN_LENGTH } from '@/constants/auth';

export const loginSchema = z.object({
  email: z.email('Informe um email válido'),
  password: z.string().min(1, 'Informe sua senha'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Informe um email válido'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH, `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`),
});

export const profileNameSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100, 'Nome muito longo'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ProfileNameFormValues = z.infer<typeof profileNameSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
