import { applyPeriodToCharts, insertChart } from './charts.utils';
import { buildDashboardChartsMock } from './charts.mocks';
import { readStoredDashboard, writeStoredDashboard } from './charts.storage';
import type { DashboardChart, DashboardPeriod } from './charts.types';

// Mock + localStorage até existirem as tabelas de gráficos e a agregação dos dados do companion.
function canonicalCharts(userId: string, storage: Storage = window.localStorage): DashboardChart[] {
  const stored = readStoredDashboard(userId, storage);
  if (stored.initialized) return stored.items;
  const items = buildDashboardChartsMock();
  writeStoredDashboard(userId, { version: 1, initialized: true, items }, storage);
  return items;
}

export function readDashboardCharts(
  userId: string,
  storage: Storage = window.localStorage,
): DashboardChart[] {
  return canonicalCharts(userId, storage);
}

export function persistDashboardCharts(
  userId: string,
  charts: DashboardChart[],
  storage: Storage = window.localStorage,
): DashboardChart[] {
  writeStoredDashboard(userId, { version: 1, initialized: true, items: charts }, storage);
  return charts;
}

export async function fetchDashboardCharts(
  userId: string,
  period: DashboardPeriod,
): Promise<DashboardChart[]> {
  return applyPeriodToCharts(readDashboardCharts(userId), period);
}

export async function saveDashboardCharts(
  userId: string,
  charts: DashboardChart[],
): Promise<DashboardChart[]> {
  return persistDashboardCharts(userId, charts);
}

export async function addDashboardChart(
  userId: string,
  chart: DashboardChart,
): Promise<DashboardChart[]> {
  return persistDashboardCharts(userId, insertChart(readDashboardCharts(userId), chart));
}
