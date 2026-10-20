import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { createChatSession, type ChatSession } from '@/features/chat/chat.session';
import type { DashboardChart } from '@/features/charts/charts.types';

import { ChartBuilder } from './ChartBuilder';
import { ChartsDashboard } from './ChartsDashboard';

const mocks = vi.hoisted(() => ({
  session: null as ChatSession | null,
  charts: [] as DashboardChart[],
  addChart: vi.fn(),
  updateCharts: vi.fn(),
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

vi.mock('@/hooks/useDashboardChartsQuery', () => ({
  useDashboardChartsQuery: () => ({ data: mocks.charts, isPending: false }),
  useAddDashboardChart: () => mocks.addChart,
  useUpdateDashboardCharts: () => mocks.updateCharts,
}));

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

function renderApp(path = '/graficos') {
  const router = createMemoryRouter(
    [
      { path: '/graficos', Component: ChartsDashboard },
      { path: '/graficos/novo', Component: ChartBuilder },
      { path: '/graficos/novo/:graphId', Component: ChartBuilder },
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

describe('fluxo de criação de gráfico', () => {
  beforeEach(() => {
    mocks.charts = [];
    mocks.addChart.mockReset().mockImplementation(async (chart: DashboardChart) => {
      mocks.charts = [chart, ...mocks.charts];
    });
    mocks.updateCharts.mockReset();
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
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('abre o modal com os 5 modelos e o card do Bud', async () => {
    const { user } = renderApp();

    await user.click(screen.getAllByRole('button', { name: 'Novo gráfico' })[0]);

    expect(await screen.findByRole('heading', { name: 'Novo gráfico' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Linha/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Barras/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Donut/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Área/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Indicador \(KPI\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar com o Bud/ })).toBeInTheDocument();
  });

  it('modelo pronto vira rascunho editável, combina filtros e salva no dashboard', async () => {
    const { user } = renderApp();

    await user.click(screen.getAllByRole('button', { name: 'Novo gráfico' })[0]);
    await user.click(await screen.findByRole('button', { name: /Barras/ }));

    expect(
      await screen.findByRole('heading', { name: 'Barras · rascunho' }, { timeout: 8_000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tipo · Barras/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Período · 7 dias/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Categoria · Sub-17/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atletas · Todos/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comparar' })).toBeInTheDocument();
    expect(screen.getByText(/v1 ·/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Comparar' }));

    expect(await screen.findByText(/v2 · comparação/i, {}, { timeout: 8_000 })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Categoria · Sub-15 \+ Sub-17/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByText(/v1 ·/i));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Categoria · Sub-17/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Salvar no dashboard' }));

    await waitFor(() => {
      expect(mocks.addChart).toHaveBeenCalledWith(
        expect.objectContaining({ isNew: true, title: expect.any(String) }),
      );
    });
    expect(await screen.findByRole('heading', { name: 'Gráficos' })).toBeInTheDocument();
  }, 20_000);

  it('criar com o Bud abre o builder vazio e o chat lateral monta o gráfico', async () => {
    const { user } = renderApp();

    await user.click(screen.getAllByRole('button', { name: 'Novo gráfico' })[0]);
    await user.click(await screen.findByRole('button', { name: /Criar com o Bud/ }));

    expect(await screen.findByText('Ainda sem rascunho')).toBeInTheDocument();
    expect(screen.getByText(/Me diz o que você quer ver/i)).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Mensagem para o Bud' });
    await user.click(input);
    await user.paste('Crie um gráfico de check-ins');
    await user.keyboard('{Enter}');

    expect(
      await screen.findByRole('button', { name: /Tipo · / }, { timeout: 12_000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /\(rascunho\)/ })).toBeInTheDocument();
  }, 20_000);
});
