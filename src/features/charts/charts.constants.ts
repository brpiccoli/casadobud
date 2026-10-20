import type { ChartKind, ChartLayout, ChartOrigin, DashboardPeriod } from './charts.types';

export const CHART_ORIGIN_LABELS: Record<ChartOrigin, string> = {
  preset: 'Pré-definido',
  custom: 'Personalizado',
};

export const CHART_ORIGIN_TAG_TONES: Record<ChartOrigin, 'neutral' | 'accent'> = {
  preset: 'neutral',
  custom: 'accent',
};

export const DASHBOARD_PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'last7Days', label: 'Últimos 7 dias' },
  { value: 'last30Days', label: 'Últimos 30 dias' },
  { value: 'last90Days', label: 'Últimos 90 dias' },
  { value: 'season', label: 'Temporada 25/26' },
];

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = 'last30Days';

export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  tertiary: 'var(--chart-3)',
  muted: 'var(--chart-4)',
  track: 'var(--chart-5)',
  grid: 'var(--chart-grid)',
  axis: 'var(--foreground-subtle)',
  inactiveBar: 'var(--border-strong)',
} as const;

export const GRID_COLUMNS = 12;
export const GRID_ROW_HEIGHT = 157;
export const GRID_MAX_HEIGHT = 4;

export const CHART_SIZE_BY_KIND: Record<ChartKind, Pick<ChartLayout, 'w' | 'h'>> = {
  line: { w: 8, h: 2 },
  kpi: { w: 4, h: 1 },
  bar: { w: 4, h: 2 },
  donut: { w: 4, h: 2 },
  area: { w: 4, h: 2 },
};

export const CHART_MIN_SIZE: Record<ChartKind, Pick<ChartLayout, 'w' | 'h'>> = {
  line: { w: 4, h: 2 },
  kpi: { w: 3, h: 1 },
  bar: { w: 3, h: 2 },
  donut: { w: 3, h: 2 },
  area: { w: 3, h: 2 },
};

export const DEFAULT_CHART_LAYOUTS: Record<string, ChartLayout> = {
  'line-placeholder': { x: 0, y: 0, w: 8, h: 2 },
  'kpi-a': { x: 8, y: 0, w: 4, h: 1 },
  'kpi-b': { x: 8, y: 1, w: 4, h: 1 },
  'bars-placeholder': { x: 0, y: 2, w: 4, h: 2 },
  'donut-placeholder': { x: 4, y: 2, w: 4, h: 2 },
  'area-placeholder': { x: 8, y: 2, w: 4, h: 2 },
};

export const SAVED_CHART_TOAST_DURATION_MS = 3000;
export const NEW_CHART_HIGHLIGHT_MS = 8000;
export const NEW_CHART_TAG = 'Novo';
export const NEW_CHART_FOOTER = 'Salvo agora · criado com o Bud';
export const COPY_SUFFIX = ' (cópia)';
