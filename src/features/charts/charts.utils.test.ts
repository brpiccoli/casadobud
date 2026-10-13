import { buildDashboardChartsMock } from './charts.mocks';
import { duplicateChart, insertAfter, removeChart, restoreChart } from './charts.utils';

describe('charts.utils', () => {
  const charts = buildDashboardChartsMock();

  it('duplica como gráfico personalizado logo após o original', () => {
    const copy = duplicateChart(charts[0], 'copy-id');
    const next = insertAfter(charts, charts[0].id, copy);

    expect(next[1]).toMatchObject({ id: 'copy-id', origin: 'custom' });
    expect(next[1].title).toBe(`${charts[0].title} (cópia)`);
    expect(next).toHaveLength(charts.length + 1);
  });

  it('remove e restaura na mesma posição (desfazer)', () => {
    const target = charts[3];
    const { charts: withoutTarget, removed, index } = removeChart(charts, target.id);

    expect(withoutTarget).toHaveLength(charts.length - 1);
    expect(removed).toBe(target);

    const restored = restoreChart(withoutTarget, target, index);
    expect(restored.map((chart) => chart.id)).toEqual(charts.map((chart) => chart.id));
  });

  it('não duplica ao restaurar um gráfico que já está no dashboard', () => {
    expect(restoreChart(charts, charts[0], 2)).toBe(charts);
  });
});
