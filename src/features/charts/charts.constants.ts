import type { ChartOrigin, DashboardPeriod } from './charts.types';

export const CHART_ORIGIN_LABELS: Record<ChartOrigin, string> = {
  preset: 'Pré-definido',
  custom: 'Personalizado',
};

export const DASHBOARD_PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
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
  axis: 'var(--label-muted)',
  inactiveBar: 'var(--chip-border)',
} as const;
