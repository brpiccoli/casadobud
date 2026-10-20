import { buildDashboardChartsMock } from './charts.mocks';
import {
  fetchDashboardCharts,
  persistDashboardCharts,
  readDashboardCharts,
} from './charts.service';

describe('charts.service', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('aplica o período na leitura sem gravar a série filtrada', async () => {
    const items = buildDashboardChartsMock();
    persistDashboardCharts('user-1', items);

    const viewed = await fetchDashboardCharts('user-1', 'last7Days');
    expect(viewed[0]).not.toEqual(items[0]);
    expect(readDashboardCharts('user-1')).toEqual(items);
  });

  it('sobrevive a um refresh lendo o mesmo storage do usuário', () => {
    const items = buildDashboardChartsMock();
    const moved = items.map((chart, index) =>
      index === 0 ? { ...chart, layout: { ...chart.layout, x: 2 } } : chart,
    );
    persistDashboardCharts('user-1', moved);

    expect(readDashboardCharts('user-1')).toEqual(moved);
    persistDashboardCharts('user-2', items.slice(0, 1));
    expect(readDashboardCharts('user-1')).toEqual(moved);
    expect(readDashboardCharts('user-2')).toHaveLength(1);
  });
});
