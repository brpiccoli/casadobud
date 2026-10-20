import type { BudChatMessage, GraphDraft } from '@/features/bud/bud.engine.types';
import { buildTestSpec } from '@/features/bud/bud.testUtils';

import {
  appendTranscript,
  buildChatHistory,
  buildConversationPreview,
  buildConversationTitle,
  buildEngineMessage,
  buildStaffConversationFromThread,
  collectConversationGraphIds,
  isThreadStreaming,
  listConversationGraphs,
  resolveGraphSpec,
  splitMessageParagraphs,
} from './chat.utils';

function buildDraft(overrides: Partial<GraphDraft> = {}): GraphDraft {
  const spec = buildTestSpec({ id: 'grafico-1', titulo: 'Ritmo semanal' });
  return {
    id: spec.id,
    versions: [spec],
    versionLabels: ['linha'],
    activeIndex: 0,
    titleLocked: false,
    status: 'draft',
    source: 'chat',
    dashboardChartId: null,
    ...overrides,
  };
}

function buildMessage(overrides: Partial<BudChatMessage> = {}): BudChatMessage {
  return {
    id: 'm1',
    role: 'user',
    text: 'Oi',
    status: 'done',
    graphIds: [],
    redirectGraphId: null,
    confirmationGraphId: null,
    ...overrides,
  };
}

describe('buildConversationTitle', () => {
  it('capitaliza e corta no limite de palavras', () => {
    expect(buildConversationTitle('como está o ritmo do time nesta semana?')).toBe(
      'Como está o ritmo do time nesta semana',
    );
  });

  it('usa fallback quando o texto está vazio', () => {
    expect(buildConversationTitle('   ')).toBe('Nova conversa');
  });
});

describe('buildConversationPreview', () => {
  it('colapsa quebras e corta o recorte', () => {
    expect(
      buildConversationPreview('Primeira linha.\n\nSegunda linha bem longa para o recorte.'),
    ).toBe('Primeira linha. Segunda linha bem longa para o recorte.');
  });
});

describe('splitMessageParagraphs', () => {
  it('separa blocos e ignora vazios', () => {
    expect(splitMessageParagraphs('Lead.\n\n\nCorpo.\n\n')).toEqual(['Lead.', 'Corpo.']);
  });
});

describe('buildEngineMessage', () => {
  it('acrescenta métricas do companion ao texto', () => {
    expect(
      buildEngineMessage('Olha isso', [
        { id: 'a1', kind: 'companion', name: 'Ritmo', metric: 'ritmo' },
      ]),
    ).toBe('Olha isso\n\n(dados do companion: ritmo)');
  });

  it('devolve o texto puro sem métrica', () => {
    expect(
      buildEngineMessage('Olha isso', [{ id: 'a1', kind: 'file', name: 'planilha.csv' }]),
    ).toBe('Olha isso');
  });
});

describe('buildChatHistory e streaming', () => {
  it('só inclui mensagens concluídas com texto', () => {
    expect(
      buildChatHistory([
        buildMessage({ text: 'Pergunta', status: 'done' }),
        buildMessage({ id: 'm2', role: 'bud', text: 'Res', status: 'streaming' }),
      ]),
    ).toEqual([{ papel: 'usuario', texto: 'Pergunta' }]);
  });

  it('detecta turno em streaming', () => {
    expect(isThreadStreaming([buildMessage({ status: 'streaming' })])).toBe(true);
    expect(isThreadStreaming([buildMessage()])).toBe(false);
  });
});

describe('gráficos da conversa', () => {
  it('deduplica ids de gráfico e redirect', () => {
    expect(
      collectConversationGraphIds([
        buildMessage({ graphIds: ['g1'], redirectGraphId: 'g1' }),
        buildMessage({ id: 'm2', graphIds: ['g2'], redirectGraphId: 'g3' }),
      ]),
    ).toEqual(['g1', 'g2', 'g3']);
  });

  it('resolve a versão pedida e ignora rascunhos descartados', () => {
    const v1 = buildTestSpec({ id: 'g1', titulo: 'v1', versao: 1 });
    const v2 = buildTestSpec({ id: 'g1', titulo: 'v2', versao: 2 });
    const drafts = {
      g1: buildDraft({ versions: [v1, v2], activeIndex: 1 }),
      g2: buildDraft({ id: 'g2', status: 'discarded' }),
    };

    expect(resolveGraphSpec(drafts, 'g1')?.titulo).toBe('v2');
    expect(resolveGraphSpec(drafts, 'g1', 0)?.titulo).toBe('v1');
    expect(resolveGraphSpec(drafts, 'g2')).toBeNull();
  });

  it('lista só gráficos ainda ativos', () => {
    const drafts = {
      g1: buildDraft(),
      g2: buildDraft({ id: 'g2', status: 'discarded' }),
    };

    expect(
      listConversationGraphs(
        [buildMessage({ graphIds: ['g1', 'g2'], redirectGraphId: 'g1' })],
        drafts,
      ),
    ).toEqual([{ id: 'g1', title: 'Ritmo semanal' }]);
  });
});

describe('appendTranscript', () => {
  it('concatena falas com espaço e ignora vazio', () => {
    expect(appendTranscript('Como está', 'o time')).toBe('Como está o time');
    expect(appendTranscript('', '  Olá  ')).toBe('Olá');
    expect(appendTranscript('Oi', '   ')).toBe('Oi');
  });
});

describe('buildStaffConversationFromThread', () => {
  it('mantém o título já salvo e atualiza o preview', () => {
    const conversation = buildStaffConversationFromThread(
      'c1',
      {
        messages: [
          buildMessage({ text: 'como está o ritmo do time nesta semana?' }),
          buildMessage({ id: 'm2', role: 'bud', text: 'O ritmo se manteve estável.' }),
        ],
        transcript: [],
        focusGraphId: null,
        pendingConfirmation: null,
      },
      {
        id: 'c1',
        title: 'Ritmo do time · semana 39',
        preview: '',
        updatedAt: '2026-09-29T12:00:00.000Z',
      },
      new Date('2026-09-29T15:00:00.000Z'),
    );

    expect(conversation).toEqual({
      id: 'c1',
      title: 'Ritmo do time · semana 39',
      preview: 'O ritmo se manteve estável.',
      updatedAt: '2026-09-29T15:00:00.000Z',
    });
  });
});
