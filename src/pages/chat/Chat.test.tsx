import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { createChatSession, type ChatSession } from '@/features/chat/chat.session';
import type { StaffConversation } from '@/features/conversations/conversations.types';
import { upsertConversation } from '@/features/conversations/conversations.utils';

import { Chat } from './Chat';

const mocks = vi.hoisted(() => ({
  session: null as ChatSession | null,
  conversations: [] as StaffConversation[],
  saveMutate: vi.fn(),
  deleteMutate: vi.fn(),
}));

vi.mock('@/hooks/useChatSession', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useChatSession')>();
  return {
    ...actual,
    useChatSession: () => mocks.session!,
  };
});

vi.mock('@/hooks/useCurrentStaff', () => ({
  useCurrentStaff: () => ({ displayName: 'Bruno Perna' }),
}));

vi.mock('@/hooks/useStaffConversationsQuery', () => ({
  useStaffConversationsQuery: () => ({ data: mocks.conversations }),
}));

vi.mock('@/hooks/useStaffConversationMutations', () => ({
  useSaveStaffConversationMutation: () => ({
    mutate: mocks.saveMutate,
    mutateAsync: mocks.saveMutate,
  }),
  useDeleteStaffConversationMutation: () => ({ mutate: mocks.deleteMutate }),
}));

vi.mock('@/hooks/useDictation', async () => {
  const { useState } = await import('react');

  return {
    useDictation: () => {
      const [status, setStatus] = useState<'idle' | 'recording'>('idle');

      return {
        status,
        isActive: status !== 'idle',
        levels: [0.2, 0.55, 0.4, 0.8, 0.3],
        elapsedMs: 4000,
        start: async () => {
          setStatus('recording');
          return 'started' as const;
        },
        stop: async () => {
          setStatus('idle');
          return 'Como está o ritmo do time';
        },
        cancel: () => setStatus('idle'),
      };
    },
  };
});

vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() } }));

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function BuilderStub() {
  return <p>Builder</p>;
}

function renderChat(path = '/chat') {
  const router = createMemoryRouter(
    [
      { path: '/chat', Component: Chat },
      { path: '/chat/:conversationId', Component: Chat },
      { path: '/graficos/novo/:graphId', Component: BuilderStub },
    ],
    { initialEntries: [path] },
  );

  return {
    router,
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}

describe('Chat', () => {
  beforeEach(() => {
    mocks.conversations = [];
    mocks.saveMutate.mockReset().mockImplementation((conversation: StaffConversation) => {
      mocks.conversations = upsertConversation(mocks.conversations, conversation);
      return Promise.resolve(conversation);
    });
    mocks.deleteMutate.mockReset();
    mocks.session = createChatSession('test-user', {
      saveToDashboard: async () => 'dash-1',
      storage: memoryStorage(),
      createId: (() => {
        let count = 0;
        return () => {
          count += 1;
          return `id-${count}`;
        };
      })(),
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('mostra o estado vazio com saudação e sugestões', () => {
    renderChat();

    expect(screen.getByRole('heading', { name: 'O que você tem em mente?' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Como o time está essa semana?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crie um gráfico de check-ins' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O que mudou desde ontem?' })).toBeInTheDocument();
  });

  it('análise continua no chat com gráfico inline', async () => {
    const { user } = renderChat();
    const input = screen.getByRole('textbox', { name: 'Mensagem para o Bud' });

    await user.click(input);
    await user.paste('Como está o ritmo do time nesta semana?');
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText('Como está o ritmo do time nesta semana?', {}, { timeout: 8_000 }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/visão resumida/i, {}, { timeout: 12_000 })).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Abrir nos Gráficos' }, { timeout: 12_000 }),
    ).toBeInTheDocument();
  }, 20_000);

  it('pedido de gráfico redireciona para o builder', async () => {
    const { user, router } = renderChat();

    await user.click(screen.getByRole('button', { name: 'Crie um gráfico de check-ins' }));

    expect(
      await screen.findByText(/Redirecionando para Gráficos/i, {}, { timeout: 12_000 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Builder', {}, { timeout: 8_000 })).toBeInTheDocument();
    expect(router.state.location.pathname).toMatch(/\/graficos\/novo\//);
    expect(router.state.location.state).toEqual(
      expect.objectContaining({ conversationId: expect.any(String) }),
    );
    expect(mocks.saveMutate).toHaveBeenCalled();
  }, 25_000);

  it('anexos oferecem foto, arquivo e dados do companion', async () => {
    const { user } = renderChat();

    await user.click(screen.getByRole('button', { name: 'Adicionar anexo' }));

    expect(screen.getByRole('menuitem', { name: 'Foto ou imagem' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Arquivo' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Dados do companion' })).toBeInTheDocument();
  });

  it('ditado transcreve no input e o texto fica editável', async () => {
    const { user } = renderChat();

    await user.click(screen.getByRole('button', { name: 'Ditar mensagem' }));

    expect(await screen.findByRole('heading', { name: 'Pode falar.' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Ditado por voz' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Parar e transcrever no campo de mensagem' }),
    );

    const input = await screen.findByRole('textbox', { name: 'Mensagem para o Bud' });
    expect(input).toHaveValue('Como está o ritmo do time');

    await user.click(input);
    await user.keyboard(' nesta semana?');
    expect(input).toHaveValue('Como está o ritmo do time nesta semana?');
  });

  it('reabre o histórico pelo item da conversa e oferece o menu', async () => {
    const session = mocks.session!;
    session.store.appendMessage('c1', {
      id: 'u1',
      role: 'user',
      text: 'Como está o ritmo do time nesta semana?',
      status: 'done',
      graphIds: [],
      redirectGraphId: null,
      confirmationGraphId: null,
    });
    session.store.appendMessage('c1', {
      id: 'b1',
      role: 'bud',
      text: 'O ritmo geral se manteve estável.\n\nMontei uma visão resumida com os dados do companion.',
      status: 'done',
      graphIds: [],
      redirectGraphId: null,
      confirmationGraphId: null,
    });
    mocks.conversations = [
      {
        id: 'c1',
        title: 'Ritmo do time · semana 39',
        preview: 'O ritmo geral se manteve estável.',
        updatedAt: new Date().toISOString(),
      },
    ];

    const { user } = renderChat('/chat/c1');

    expect(screen.getByRole('heading', { name: 'Ritmo do time · semana 39' })).toBeInTheDocument();
    expect(screen.getByText('Como está o ritmo do time nesta semana?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Opções da conversa' }));
    expect(screen.getByRole('menuitem', { name: 'Renomear conversa' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Ver gráficos criados aqui' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Excluir conversa' })).toBeInTheDocument();
  });
});
