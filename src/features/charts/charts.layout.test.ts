import { DEFAULT_CHART_LAYOUTS } from './charts.constants';
import {
  applyLayoutChange,
  clampLayout,
  expandLayout,
  findPlacement,
  layoutsOverlap,
  shrinkLayout,
} from './charts.layout';
import { buildDashboardChartsMock } from './charts.mocks';

describe('charts.layout', () => {
  it('impede o card de sair da grade de 12 colunas', () => {
    expect(clampLayout({ x: 10, y: -2, w: 8, h: 8 }, 'bar')).toEqual({
      x: 4,
      y: 0,
      w: 8,
      h: 4,
    });
  });

  it('encontra o primeiro espaço livre sem sobrepor os cards do dashboard', () => {
    const occupied = Object.values(DEFAULT_CHART_LAYOUTS);
    expect(findPlacement(occupied, { w: 4, h: 2 })).toEqual({ x: 0, y: 4, w: 4, h: 2 });
  });

  it('empura o card sobreposto para baixo ao mover', () => {
    const charts = buildDashboardChartsMock();
    const next = applyLayoutChange(charts, 'donut-placeholder', {
      x: 0,
      y: 2,
      w: 4,
      h: 2,
    });
    const donut = next.find((chart) => chart.id === 'donut-placeholder');
    const bars = next.find((chart) => chart.id === 'bars-placeholder');

    expect(donut?.layout).toEqual({ x: 0, y: 2, w: 4, h: 2 });
    expect(bars?.layout.y).toBeGreaterThanOrEqual(4);
    expect(layoutsOverlap(donut!.layout, bars!.layout)).toBe(false);
  });

  it('expande e compacta respeitando o tamanho mínimo do tipo', () => {
    const compact = DEFAULT_CHART_LAYOUTS['bars-placeholder'];
    const expanded = expandLayout(compact, 'bar');
    expect(expanded.w).toBeGreaterThan(compact.w);
    expect(shrinkLayout(expanded, 'bar')).toEqual(compact);
  });
});
