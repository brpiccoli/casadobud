import { subDays, subHours } from 'date-fns';

import type { StaffConversation } from './conversations.types';
import {
  buildSearchExcerpt,
  filterConversations,
  groupConversationsByRecency,
} from './conversations.utils';

const NOW = new Date('2026-09-29T15:00:00');

function buildConversation(
  id: string,
  updatedAt: Date,
  title = id,
  preview = '',
): StaffConversation {
  return { id, title, preview, updatedAt: updatedAt.toISOString() };
}

describe('groupConversationsByRecency', () => {
  it('agrupa por hoje, últimos 7 dias, últimos 30 dias e anteriores, mais recentes primeiro', () => {
    const groups = groupConversationsByRecency(
      [
        buildConversation('old', subDays(NOW, 45)),
        buildConversation('today-early', subHours(NOW, 5)),
        buildConversation('week', subDays(NOW, 3)),
        buildConversation('today-late', subHours(NOW, 1)),
        buildConversation('month', subDays(NOW, 12)),
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual([
      'Hoje',
      'Últimos 7 dias',
      'Últimos 30 dias',
      'Anteriores',
    ]);
    expect(groups[0].conversations.map((conversation) => conversation.id)).toEqual([
      'today-late',
      'today-early',
    ]);
  });

  it('omite grupos vazios', () => {
    const groups = groupConversationsByRecency([buildConversation('week', subDays(NOW, 2))], NOW);

    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('last7Days');
  });
});

describe('filterConversations', () => {
  const conversations = [
    buildConversation('a', NOW, 'Ritmo do time', 'estável na semana'),
    buildConversation('b', NOW, 'Sono do elenco', 'dormir tarde mexeu no ritmo'),
    buildConversation('c', NOW, 'Preparação para o clássico', 'ansiedade pré-jogo'),
  ];

  it('busca no título e na prévia', () => {
    expect(
      filterConversations(conversations, 'ritmo').map((conversation) => conversation.id),
    ).toEqual(['a', 'b']);
  });

  it('ignora acentos e caixa', () => {
    expect(
      filterConversations(conversations, 'CLASSICO').map((conversation) => conversation.id),
    ).toEqual(['c']);
  });

  it('retorna tudo quando a busca está vazia', () => {
    expect(filterConversations(conversations, '   ')).toHaveLength(3);
  });
});

describe('buildSearchExcerpt', () => {
  it('separa o trecho encontrado preservando o texto original', () => {
    expect(buildSearchExcerpt('O ritmo geral se manteve estável', 'RITMO')).toEqual({
      before: 'O ',
      match: 'ritmo',
      after: ' geral se manteve estável',
    });
  });

  it('encontra termos sem acento em texto acentuado', () => {
    expect(buildSearchExcerpt('Preparação para o clássico', 'classico')?.match).toBe('clássico');
  });

  it('recorta o início longo em uma quebra de palavra com reticências', () => {
    const excerpt = buildSearchExcerpt(
      'Cinco atletas não fizeram check-in nos últimos quatro dias de treino',
      'treino',
    );

    expect(excerpt?.before.startsWith('...')).toBe(true);
    expect(excerpt?.before.endsWith('de ')).toBe(true);
    expect(excerpt?.match).toBe('treino');
  });

  it('retorna null quando o termo não aparece ou a busca está vazia', () => {
    expect(buildSearchExcerpt('Sono do elenco', 'ritmo')).toBeNull();
    expect(buildSearchExcerpt('Sono do elenco', '  ')).toBeNull();
  });
});
