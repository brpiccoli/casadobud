import type { BudMetric, GraphGrouping } from '@/features/bud/bud.types';

import type { VoicePlainLanguage, VoiceSessionState, VoiceTiming } from './voice.types';

export const VOICE_LANG = 'pt-BR';

export const VOICE_TIMING: VoiceTiming = {
  stepDwellMs: 650,
  revealTotalMs: 2800,
  revealStepMinMs: 90,
  revealStepMaxMs: 420,
  fallbackMsPerChar: 55,
};

export const VOICE_COPY = {
  liveBadge: 'Ao vivo com o Bud',
  listeningTitle: 'Pode falar, estou com você',
  userLabel: 'Você',
  budSpeaking: 'Bud · falando',
  budListening: 'Bud · ouvindo',
  budThinking: 'Bud · pensando',
  micOff: 'Microfone desligado',
  liveHint: 'O Bud responde por voz e mostra na tela o que estiver construindo.',
  confirmHint: 'Responda por voz ou toque em uma opção.',
  adjustHint: 'Diga o que você quer mudar, por exemplo "em linha" ou "só o Sub-15".',
  mutedHint: 'Microfone desligado. Digite se preferir.',
  deniedHint: 'Não consegui acessar o microfone. Digite se preferir.',
  unsupportedHint: 'Seu navegador não reconhece voz. Digite se preferir, o Bud responde falando.',
  inputPlaceholder: 'Digite se preferir',
  buildingTag: 'Construindo',
  buildingProgress: 'Montando o gráfico',
  confirmQuestion: 'Pronto. Era isso que você tinha em mente?',
  confirmYes: 'Sim, salva no dashboard',
  confirmAdjust: 'Quase, quero ajustar',
  plainLanguageLead: 'Em bom português: estou ',
  checkStep: 'Conferindo com você',
  conversationTitle: 'Conversa por voz',
} as const;

export const VOICE_PLAIN_LANGUAGE: Record<BudMetric, Omit<VoicePlainLanguage, 'lead'>> = {
  check_ins: { highlight: 'contando quantos check-ins', rest: 'o time fez' },
  sono: { highlight: 'vendo quantas horas', rest: 'o time disse que dormiu' },
  humor: { highlight: 'vendo como', rest: 'o time disse que estava se sentindo' },
  engajamento: { highlight: 'medindo quanto', rest: 'o time usou o companion' },
  ritmo: { highlight: 'acompanhando o ritmo', rest: 'do time' },
};

export const VOICE_GROUPING_STEPS: Record<GraphGrouping, string> = {
  dia_semana: 'Separando por dia da semana',
  data: 'Organizando data a data',
  atleta: 'Separando por atleta',
  grupo: 'Separando por grupo',
};

export const VOICE_PROGRESS_UNITS: Record<GraphGrouping, string> = {
  dia_semana: 'dias',
  data: 'dias',
  atleta: 'atletas',
  grupo: 'grupos',
};

export const VOICE_INITIAL_STATE: VoiceSessionState = {
  stage: 'live',
  speaker: 'idle',
  thinking: false,
  muted: false,
  micStatus: 'off',
  userText: '',
  budText: '',
  budRevealed: 0,
  steps: [],
  plainLanguage: null,
  build: null,
  savedGraphId: null,
  ended: false,
};
