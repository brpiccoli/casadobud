import { COPY_SUFFIX } from './charts.constants';
import { findPlacement, sizeForKind } from './charts.layout';
import type { DashboardChart, DashboardPeriod, KpiTrend } from './charts.types';

const PERIOD_VALUE_SCALE: Record<DashboardPeriod, number> = {
  last7Days: 0.88,
  last30Days: 1,
  last90Days: 1.14,
  season: 1.22,
};

export function duplicateChart(chart: DashboardChart, id: string): DashboardChart {
  const size = { w: chart.layout.w, h: chart.layout.h };
  return {
    ...chart,
    id,
    title: `${chart.title}${COPY_SUFFIX}`,
    origin: 'custom',
    isNew: false,
    layout: { ...chart.layout, ...size },
  };
}

export function placeChart(
  charts: DashboardChart[],
  chart: DashboardChart,
  occupied = charts.map((item) => item.layout),
): DashboardChart {
  return {
    ...chart,
    layout: findPlacement(occupied, sizeForKind(chart.kind)),
  };
}

export function insertChart(charts: DashboardChart[], chart: DashboardChart): DashboardChart[] {
  return [placeChart(charts, chart), ...charts];
}

export function insertAfter(
  charts: DashboardChart[],
  targetId: string,
  chart: DashboardChart,
): DashboardChart[] {
  const placed = placeChart(charts, chart);
  const index = charts.findIndex((item) => item.id === targetId);
  if (index === -1) return [...charts, placed];
  return [...charts.slice(0, index + 1), placed, ...charts.slice(index + 1)];
}

export function renameChart(
  charts: DashboardChart[],
  chartId: string,
  title: string,
): DashboardChart[] {
  const nextTitle = title.trim();
  if (!nextTitle) return charts;
  return charts.map((chart) => (chart.id === chartId ? { ...chart, title: nextTitle } : chart));
}

export function clearNewFlag(charts: DashboardChart[], chartId?: string): DashboardChart[] {
  return charts.map((chart) => {
    if (!chart.isNew) return chart;
    if (chartId && chart.id !== chartId) return chart;
    return { ...chart, isNew: false };
  });
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

function scaleNumber(value: number, scale: number): number {
  return Math.round(value * scale);
}

function scaleLabeledValue(value: string, scale: number): string {
  const match = value.match(/^(-?\d+)(.*)$/);
  if (!match) return value;
  return `${scaleNumber(Number(match[1]), scale)}${match[2]}`;
}

function trendFromCaption(caption: string): KpiTrend {
  if (caption.startsWith('+')) return 'up';
  if (caption.startsWith('-')) return 'down';
  return 'flat';
}

export function applyPeriodToChart(chart: DashboardChart, period: DashboardPeriod): DashboardChart {
  const scale = PERIOD_VALUE_SCALE[period];
  if (scale === 1) return chart;

  if (chart.kind === 'kpi') {
    const caption = scaleLabeledValue(chart.caption, scale);
    return {
      ...chart,
      value: scaleLabeledValue(chart.value, scale),
      caption,
      trend: trendFromCaption(caption),
    };
  }

  if (chart.kind === 'donut') {
    return {
      ...chart,
      percentage: Math.min(100, Math.max(0, scaleNumber(chart.percentage, scale))),
    };
  }

  const points =
    period === 'last7Days' ? chart.points.slice(0, 7) : chart.points.map((point) => ({ ...point }));

  return {
    ...chart,
    points: points.map((point) => ({
      ...point,
      value: scaleNumber(point.value, scale),
      comparison: point.comparison === undefined ? undefined : scaleNumber(point.comparison, scale),
    })),
  };
}

export function applyPeriodToCharts(
  charts: DashboardChart[],
  period: DashboardPeriod,
): DashboardChart[] {
  return charts.map((chart) => applyPeriodToChart(chart, period));
}
