import { buildDashboardChartsMock } from './charts.mocks';
import type { DashboardChart, DashboardPeriod } from './charts.types';

// Mock até existirem as tabelas de gráficos e a agregação dos dados do companion.
export async function fetchDashboardCharts(
  _userId: string,
  _period: DashboardPeriod,
): Promise<DashboardChart[]> {
  return buildDashboardChartsMock();
}
