import { DEFAULT_DASHBOARD_PERIOD } from '@/features/charts/charts.constants';
import type { DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';

import {
  BUD_DATA_MODE,
  PLACEHOLDER_ALLOWED_CATEGORIES,
  PLACEHOLDER_CLUB_NAME,
} from './bud.constants';
import type {
  BudCategory,
  BudDataMode,
  BudHistoryMessage,
  BudMode,
  BudScreen,
  CurrentSelection,
  GraphSpec,
  PendingConfirmation,
  SessionContext,
} from './bud.types';

export interface BuildSessionContextInput {
  userName: string;
  club?: string;
  allowedCategories?: BudCategory[];
  screen: BudScreen;
  mode?: BudMode;
  focus?: GraphSpec | null;
  dashboardPeriod?: DashboardPeriod;
  dashboardCharts?: DashboardChart[];
  selection?: CurrentSelection;
  dataMode?: BudDataMode;
  history?: BudHistoryMessage[];
  pendingConfirmation?: PendingConfirmation | null;
}

export function buildSessionContext({
  userName,
  club = PLACEHOLDER_CLUB_NAME,
  allowedCategories = PLACEHOLDER_ALLOWED_CATEGORIES,
  screen,
  mode = 'texto',
  focus = null,
  dashboardPeriod = DEFAULT_DASHBOARD_PERIOD,
  dashboardCharts = [],
  selection = { categoria: [], atletas: [] },
  dataMode = BUD_DATA_MODE,
  history = [],
  pendingConfirmation = null,
}: BuildSessionContextInput): SessionContext {
  return {
    usuario: {
      nome: userName,
      papel: 'psicologo',
      clube: club,
      categorias_permitidas: allowedCategories,
    },
    tela_atual: screen,
    modo: mode,
    grafico_em_foco: focus,
    dashboard: {
      periodo_global: dashboardPeriod,
      cards: dashboardCharts.map((chart) => ({
        id: chart.id,
        titulo: chart.title,
        tipo: chart.kind,
      })),
    },
    selecao_atual: selection,
    dados_modo: dataMode,
    historico: history,
    confirmacao_pendente: pendingConfirmation,
  };
}
