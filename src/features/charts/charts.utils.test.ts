import { buildDashboardChartsMock } from './charts.mocks';
import {
  applyPeriodToChart,
  duplicateChart,
  insertAfter,
  insertChart,
  removeChart,
  renameChart,
  restoreChart,
} from './charts.utils';

describe('charts.utils', () => {
  const charts = buildDashboardChartsMock();

  it('duplica como gráfico personalizado logo após o original, sem sobrepor o layout', () => {
    const copy = duplicateChart(charts[0], 'copy-id');
    const next = insertAfter(charts, charts[0].id, copy);

    expect(next[1]).toMatchObject({ id: 'copy-id', origin: 'custom' });
    expect(next[1].title).toBe(`${charts[0].title} (cópia)`);
    expect(next).toHaveLength(charts.length + 1);
    expect(next[1].layout).not.toEqual(charts[0].layout);
  });

  it('remove e restaura na mesma posição (desfazer)', () => {
    const target = charts[3];
    const { charts: withoutTarget, removed, index } = removeChart(charts, target.id);

    expect(withoutTarget).toHaveLength(charts.length - 1);
    expect(removed).toBe(target);

    const restored = restoreChart(withoutTarget, target, index);
    expect(restored.map((chart) => chart.id)).toEqual(charts.map((chart) => chart.id));
  });

  it('desfazer exclusão restaura a série canônica, não a visão do período', () => {
    const target = charts[0];
    const scaled = applyPeriodToChart(target, 'last7Days');
    const { charts: withoutTarget, removed, index } = removeChart(charts, scaled.id);

    expect(removed).toEqual(target);
    expect(removed).not.toEqual(scaled);

    const restored = restoreChart(withoutTarget, removed!, index);
    expect(restored[0]).toEqual(target);
  });

  it('não duplica ao restaurar um gráfico que já está no dashboard', () => {
    expect(restoreChart(charts, charts[0], 2)).toBe(charts);
  });

  it('renomeia o título e ignora vazio', () => {
    expect(renameChart(charts, charts[0].id, '  Ritmo do time  ')[0].title).toBe('Ritmo do time');
    expect(renameChart(charts, charts[0].id, '   ')).toBe(charts);
  });

  it('reconsulta o card ao trocar o período sem perder identidade', () => {
    const source = charts[0];
    const scaled = applyPeriodToChart(source, 'last7Days');
    expect(scaled.id).toBe(source.id);
    if (source.kind !== 'line' || scaled.kind !== 'line')
      throw new Error('esperado gráfico de linha');
    expect(scaled.points).toHaveLength(7);
    expect(scaled.points[0].value).not.toBe(source.points[0].value);
  });

  it('coloca um gráfico novo no primeiro espaço livre', () => {
    const incoming = duplicateChart(charts[3], 'new-id');
    const next = insertChart(charts, incoming);
    expect(next[0].id).toBe('new-id');
    expect(next[0].layout.y).toBeGreaterThanOrEqual(4);
  });
});
