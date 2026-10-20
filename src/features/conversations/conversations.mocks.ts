import { subDays, subHours } from 'date-fns';

import type { StaffConversation } from './conversations.types';

export const CONVERSATION_SEED_PROMPTS: Record<string, string[]> = {
  'ritmo-semana-39': ['Como está o ritmo do time nesta semana?', 'Consegue deixar em barras por dia?'],
  'checkins-por-dia': ['Cria um gráfico de check-ins por dia do Sub-17'],
  'preparacao-classico': ['Como está o humor do Sub-17 nesta semana?'],
  'sono-viagem': ['Como foi o sono do elenco nos últimos 7 dias?'],
  'resumo-pos-jogo': ['O que mudou desde ontem?'],
  'pouco-engajamento': ['Como está o engajamento do elenco no mês?'],
  'falar-sub-17': ['Como o time está essa semana?'],
};

export function buildStaffConversationsMock(now: Date = new Date()): StaffConversation[] {
  return [
    {
      id: 'ritmo-semana-39',
      title: 'Ritmo do time · semana 39',
      preview: 'O ritmo geral se manteve estável, com uma leve subida no meio da semana.',
      updatedAt: subHours(now, 1).toISOString(),
    },
    {
      id: 'checkins-por-dia',
      title: 'Gráfico de check-ins por dia',
      preview: 'Montei o gráfico de barras com os check-ins do Sub-17.',
      updatedAt: subHours(now, 3).toISOString(),
    },
    {
      id: 'preparacao-classico',
      title: 'Preparação para o clássico',
      preview: 'A ansiedade pré-jogo apareceu mais nos check-ins de quinta e sexta.',
      updatedAt: subDays(now, 1).toISOString(),
    },
    {
      id: 'sono-viagem',
      title: 'Sono do elenco na viagem',
      preview: '...dormir tarde mexeu no ritmo dos treinos da semana.',
      updatedAt: subDays(now, 2).toISOString(),
    },
    {
      id: 'resumo-pos-jogo',
      title: 'Resumo pós-jogo de domingo',
      preview: '...o ritmo caiu no segundo tempo, junto com o ânimo do grupo.',
      updatedAt: subDays(now, 3).toISOString(),
    },
    {
      id: 'pouco-engajamento',
      title: 'Atletas com pouco engajamento',
      preview: 'Cinco atletas não fizeram check-in nos últimos quatro dias.',
      updatedAt: subDays(now, 4).toISOString(),
    },
    {
      id: 'falar-sub-17',
      title: 'Como falar com o sub-17',
      preview: 'Algumas sugestões de abordagem para a conversa em grupo.',
      updatedAt: subDays(now, 6).toISOString(),
    },
  ];
}
