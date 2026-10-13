export const ROUTES = {
  login: '/login',
  forgotPassword: '/recuperar-senha',
  resetPassword: '/redefinir-senha',
  chat: '/chat',
  charts: '/graficos',
  chartBuilder: '/graficos/novo',
  voice: '/voz',
  profile: '/perfil',
  foundations: '/fundacoes',
} as const;

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.chat;
