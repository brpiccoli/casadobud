import { ChartColumn, MessageCircle, Sparkles } from 'lucide-react';

import type { ChatSuggestion } from './chat.types';

export const CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { id: 'team-week', label: 'Como o time está essa semana?', icon: Sparkles },
  { id: 'checkins-chart', label: 'Crie um gráfico de check-ins', icon: ChartColumn },
  { id: 'since-yesterday', label: 'O que mudou desde ontem?', icon: MessageCircle },
];

export const CHAT_DISCLAIMER =
  'O Bud pode cometer erros. Confira informações importantes com o seu time.';
