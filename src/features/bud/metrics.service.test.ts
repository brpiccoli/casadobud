import { WEEKDAY_LABELS } from './bud.constants';
import { SQUAD_SIZES, buildAthleteRosterMock } from './bud.mocks';
import { REFERENCE_DATE } from './bud.testUtils';
import type { MetricQuery } from './bud.types';
import { fetchMetricSeries } from './metrics.service';

const BASE_QUERY: MetricQuery = {
  metrica: 'check_ins',
  periodo: { tipo: 'ultimos_dias', dias: 7 },
  categoria: ['sub_17'],
  atletas: { modo: 'todos' },
  agrupamento: 'dia_semana',
};

describe('elenco placeholder', () => {
  it('tem os tamanhos das telas e nomes únicos', () => {
    const roster = buildAthleteRosterMock();

    expect(roster.filter((athlete) => athlete.categoria === 'sub_15')).toHaveLength(
      SQUAD_SIZES.sub_15,
    );
    expect(roster.filter((athlete) => athlete.categoria === 'sub_17')).toHaveLength(
      SQUAD_SIZES.sub_17,
    );
    expect(new Set(roster.map((athlete) => athlete.nome)).size).toBe(roster.length);
    expect(roster.slice(0, 3).map((athlete) => athlete.nome)).toEqual([
      'Pedro Martins',
      'Lucas Ferreira',
      'Rafael Souza',
    ]);
  });
});

describe('fetchMetricSeries', () => {
  it('agrega por dia da semana (Seg..Dom) em uma série', async () => {
    const [serie, ...rest] = await fetchMetricSeries(BASE_QUERY, REFERENCE_DATE);

    expect(rest).toHaveLength(0);
    expect(serie.pontos.map((point) => point.rotulo)).toEqual([...WEEKDAY_LABELS]);
    expect(serie.pontos.every((point) => point.valor <= SQUAD_SIZES.sub_17)).toBe(true);
    expect(serie.resumo.valor).toBeGreaterThan(0);
    expect(serie.resumo.valor).toBeLessThanOrEqual(100);
  });

  it('é determinístico para a mesma data de referência', async () => {
    const first = await fetchMetricSeries(BASE_QUERY, REFERENCE_DATE);
    const second = await fetchMetricSeries(BASE_QUERY, REFERENCE_DATE);

    expect(first).toEqual(second);
  });

  it('devolve N séries na comparação de categorias', async () => {
    const series = await fetchMetricSeries(
      { ...BASE_QUERY, categoria: ['sub_15', 'sub_17'] },
      REFERENCE_DATE,
    );

    expect(series.map((serie) => serie.rotulo)).toEqual(['Sub-15', 'Sub-17']);
  });

  it('agrega por data no período de 30 dias', async () => {
    const [serie] = await fetchMetricSeries(
      { ...BASE_QUERY, periodo: { tipo: 'ultimos_dias', dias: 30 }, agrupamento: 'data' },
      REFERENCE_DATE,
    );

    expect(serie.pontos).toHaveLength(30);
    expect(serie.pontos.at(-1)?.rotulo).toBe('13/10');
  });

  it('agrega por atleta respeitando a seleção, do maior para o menor', async () => {
    const [serie] = await fetchMetricSeries(
      {
        ...BASE_QUERY,
        agrupamento: 'atleta',
        atletas: { modo: 'selecao', ids: ['atl-s17-01', 'atl-s17-02', 'atl-s17-03'] },
      },
      REFERENCE_DATE,
    );

    expect(serie.pontos).toHaveLength(3);
    const values = serie.pontos.map((point) => point.valor);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it('agrega por grupo quando é o elenco todo', async () => {
    const [serie] = await fetchMetricSeries(
      { ...BASE_QUERY, categoria: ['elenco_todo'], agrupamento: 'grupo' },
      REFERENCE_DATE,
    );

    expect(serie.pontos.map((point) => point.rotulo)).toEqual(['Sub-15', 'Sub-17']);
  });

  it('usa média para métricas que não são contagem', async () => {
    const [serie] = await fetchMetricSeries({ ...BASE_QUERY, metrica: 'humor' }, REFERENCE_DATE);

    expect(serie.pontos.every((point) => point.valor >= 1 && point.valor <= 5)).toBe(true);
  });

  it('não devolve pontos fora do histórico disponível', async () => {
    const [serie] = await fetchMetricSeries(
      { ...BASE_QUERY, periodo: { tipo: 'intervalo', inicio: '2025-01-01', fim: '2025-01-31' } },
      REFERENCE_DATE,
    );

    expect(serie.pontos).toEqual([]);
  });
});
