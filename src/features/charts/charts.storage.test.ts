import { buildDashboardChartsMock } from './charts.mocks';
import { readStoredDashboard, writeStoredDashboard } from './charts.storage';

describe('charts.storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('grava e lê o dashboard por usuário', () => {
    const items = buildDashboardChartsMock();
    writeStoredDashboard('user-1', { version: 1, initialized: true, items });

    expect(readStoredDashboard('user-1')).toEqual({
      version: 1,
      initialized: true,
      items,
    });
    expect(readStoredDashboard('user-2').initialized).toBe(false);
  });

  it('descarta payload inválido', () => {
    window.localStorage.setItem('casadobud:dashboard:user-1', '{not-json');
    expect(readStoredDashboard('user-1').initialized).toBe(false);
  });
});
