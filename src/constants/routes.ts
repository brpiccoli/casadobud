export const ROUTES = {
  login: '/login',
  forgotPassword: '/recuperar-senha',
  resetPassword: '/redefinir-senha',
  chat: '/chat',
  charts: '/graficos',
  profile: '/perfil',
} as const;

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.chat;
