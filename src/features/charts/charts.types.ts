export type ChartOrigin = 'preset' | 'custom';

export type DashboardPeriod = 'last7Days' | 'last30Days' | 'last90Days' | 'season';

export type KpiTrend = 'up' | 'down' | 'flat';

export interface ChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartPoint {
  label: string;
  value: number;
  comparison?: number;
}

interface DashboardChartBase {
  id: string;
  title: string;
  origin: ChartOrigin;
  footer: string;
  layout: ChartLayout;
  isNew?: boolean;
}

export interface ChartLegend {
  value: string;
  comparison?: string;
}

export interface SeriesChart extends DashboardChartBase {
  kind: 'line' | 'bar' | 'area';
  points: ChartPoint[];
  highlightIndex?: number;
  legend?: ChartLegend;
}

export interface DonutChart extends DashboardChartBase {
  kind: 'donut';
  percentage: number;
}

export interface KpiChart extends DashboardChartBase {
  kind: 'kpi';
  value: string;
  caption: string;
  trend: KpiTrend;
}

export type DashboardChart = SeriesChart | DonutChart | KpiChart;

export type ChartKind = DashboardChart['kind'];

export interface StoredDashboard {
  version: 1;
  initialized: boolean;
  items: DashboardChart[];
}
