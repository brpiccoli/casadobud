import type { DashboardChart } from './charts.types';

const COPY_SUFFIX = ' (cópia)';

export function duplicateChart(chart: DashboardChart, id: string): DashboardChart {
  return { ...chart, id, title: `${chart.title}${COPY_SUFFIX}`, origin: 'custom' };
}

export function insertAfter(
  charts: DashboardChart[],
  targetId: string,
  chart: DashboardChart,
): DashboardChart[] {
  const index = charts.findIndex((item) => item.id === targetId);
  if (index === -1) return [...charts, chart];
  return [...charts.slice(0, index + 1), chart, ...charts.slice(index + 1)];
}

export function removeChart(
  charts: DashboardChart[],
  chartId: string,
): { charts: DashboardChart[]; removed: DashboardChart | null; index: number } {
  const index = charts.findIndex((item) => item.id === chartId);
  if (index === -1) return { charts, removed: null, index };
  return {
    charts: [...charts.slice(0, index), ...charts.slice(index + 1)],
    removed: charts[index],
    index,
  };
}

export function restoreChart(
  charts: DashboardChart[],
  chart: DashboardChart,
  index: number,
): DashboardChart[] {
  if (charts.some((item) => item.id === chart.id)) return charts;
  const safeIndex = Math.min(Math.max(index, 0), charts.length);
  return [...charts.slice(0, safeIndex), chart, ...charts.slice(safeIndex)];
}
