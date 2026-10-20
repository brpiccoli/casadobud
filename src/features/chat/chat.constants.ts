import { ChartColumn, File, Image, MessageCircle, Sparkles, type LucideIcon } from 'lucide-react';

import type { BudAttachmentKind } from '@/features/bud/bud.engine.types';

import type { ChatAttachmentOption, ChatSuggestion } from './chat.types';

export const CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { id: 'team-week', label: 'Como o time está essa semana?', icon: Sparkles },
  { id: 'checkins-chart', label: 'Crie um gráfico de check-ins', icon: ChartColumn },
  { id: 'since-yesterday', label: 'O que mudou desde ontem?', icon: MessageCircle },
];

export const CHAT_EMPTY_TITLE = 'O que você tem em mente?';

export const CHAT_DICTATION_TITLE = 'Pode falar.';

export const CHAT_DISCLAIMER =
  'O Bud pode cometer erros. Confira informações importantes com o seu time.';

export const CHAT_GRAPH_TAG = 'Gráfico';

export const CHAT_OPEN_IN_CHARTS = 'Abrir nos Gráficos';

export const CHAT_REDIRECTING_LABEL = 'Redirecionando para Gráficos';

export const CHAT_MENU_RENAME = 'Renomear conversa';

export const CHAT_MENU_GRAPHS = 'Ver gráficos criados aqui';

export const CHAT_MENU_DELETE = 'Excluir conversa';

export const CHAT_NO_GRAPHS_MESSAGE = 'Esta conversa ainda não criou gráficos.';

export const CHAT_RENAME_MAX_LENGTH = 80;

export const CHAT_FILE_ATTACHMENT_OPTIONS: ChatAttachmentOption[] = [
  { kind: 'image', label: 'Foto ou imagem', icon: Image, accept: 'image/*' },
  { kind: 'file', label: 'Arquivo', icon: File, accept: '' },
];

export const CHAT_COMPANION_ATTACHMENT_LABEL = 'Dados do companion';

export const CHAT_ATTACHMENT_ICONS: Record<BudAttachmentKind, LucideIcon> = {
  image: Image,
  file: File,
  companion: ChartColumn,
};

export const CHAT_STREAM_DELAY_MS = 28;

export const CHAT_TITLE_MAX_LENGTH = 48;

export const CHAT_PREVIEW_MAX_LENGTH = 120;

export const CHAT_AUTOSCROLL_THRESHOLD_PX = 160;

export const CHAT_ERROR_REPLY = 'Tive um problema para responder agora. Tenta de novo?';

export const DICTATION_WAVEFORM_SLOTS = 56;

export const DICTATION_SAMPLE_INTERVAL_MS = 90;

export const DICTATION_STOP_TIMEOUT_MS = 1500;

export const DICTATION_LANGUAGE = 'pt-BR';

export const DICTATION_MESSAGES = {
  unsupported: 'Seu navegador não tem ditado por voz. Tente no Chrome, Edge ou Safari.',
  denied: 'Não consegui acessar o microfone. Libere a permissão no navegador e tente de novo.',
  empty: 'Não captei nenhuma fala. Tenta de novo?',
} as const;
