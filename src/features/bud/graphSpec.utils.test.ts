import { PLACEHOLDER_ALLOWED_CATEGORIES } from './bud.constants';
import { buildTestSpec } from './bud.testUtils';
import type { GraphSpec, Serie } from './bud.types';
import {
  applyGraphPatch,
  buildGraphTitle,
  describeVersion,
  isComparison,
  selectedAthletesCount,
  toDashboardChart,
  validateGraphSpec,
} from './graphSpec.utils';

function buildSerie(categoria: Serie['categoria'], valores: number[]): Serie {
  return {
    id: categoria,
    rotulo: categoria === 'sub_15' ? 'Sub-15' : 'Sub-17',
    categoria,
    pontos: valores.map((valor, index) => ({ rotulo: `P${index + 1}`, valor })),
    resumo: { valor: 82, variacao: 4 },
  };
}

describe('validateGraphSpec', () => {
  it('aceita um spec válido e normaliza seleção vazia de atletas para todos', () => {
    const result = validateGraphSpec(
      buildTestSpec({ atletas: { modo: 'selecao', ids: [] } }),
      PLACEHOLDER_ALLOWED_CATEGORIES,
    );

    expect(result).toMatchObject({ ok: true, spec: { atletas: { modo: 'todos' } } });
  });

  it('recusa métrica fora do enum fechado', () => {
    const spec = { ...buildTestSpec(), metrica: 'lesoes' } as unknown as GraphSpec;

    expect(validateGraphSpec(spec, PLACEHOLDER_ALLOWED_CATEGORIES)).toMatchObject({
      ok: false,
      erro: 'metrica_fora_do_enum',
    });
  });

  it('recusa tipo de gráfico fora do enum', () => {
    const spec = { ...buildTestSpec(), tipo: 'radar' } as unknown as GraphSpec;

    expect(validateGraphSpec(spec, PLACEHOLDER_ALLOWED_CATEGORIES)).toMatchObject({
      ok: false,
      erro: 'tipo_fora_do_enum',
    });
  });

  it('respeita categorias_permitidas do usuário', () => {
    expect(validateGraphSpec(buildTestSpec({ categoria: ['sub_15'] }), ['sub_17'])).toMatchObject({
      ok: false,
      erro: 'categoria_nao_permitida',
    });
  });

  it('não combina elenco_todo com outra categoria', () => {
    const spec = buildTestSpec({ categoria: ['elenco_todo', 'sub_17'] });

    expect(validateGraphSpec(spec, PLACEHOLDER_ALLOWED_CATEGORIES)).toMatchObject({
      ok: false,
      erro: 'spec_invalido',
    });
  });

  it('não deixa donut nem kpi compararem categorias', () => {
    const categoria: GraphSpec['categoria'] = ['sub_15', 'sub_17'];

    expect(
      validateGraphSpec(
        buildTestSpec({ tipo: 'donut', categoria }),
        PLACEHOLDER_ALLOWED_CATEGORIES,
      ),
    ).toMatchObject({ ok: false });
    expect(
      validateGraphSpec(buildTestSpec({ tipo: 'kpi', categoria }), PLACEHOLDER_ALLOWED_CATEGORIES),
    ).toMatchObject({ ok: false });
  });

  it('recusa período fora de 7 ou 30 dias e intervalo invertido', () => {
    const invalidDays = buildTestSpec({
      periodo: { tipo: 'ultimos_dias', dias: 14 as 7 },
    });
    const inverted = buildTestSpec({
      periodo: { tipo: 'intervalo', inicio: '2026-10-10', fim: '2026-10-01' },
    });

    expect(validateGraphSpec(invalidDays, PLACEHOLDER_ALLOWED_CATEGORIES).ok).toBe(false);
    expect(validateGraphSpec(inverted, PLACEHOLDER_ALLOWED_CATEGORIES).ok).toBe(false);
  });
});

describe('regras derivadas do GraphSpec', () => {
  it('comparar = categoria com mais de um item', () => {
    expect(isComparison(buildTestSpec())).toBe(false);
    expect(isComparison(buildTestSpec({ categoria: ['sub_15', 'sub_17'] }))).toBe(true);
  });

  it('o contador do Aplicar é o número de atletas selecionados', () => {
    expect(selectedAthletesCount({ modo: 'todos' })).toBe(0);
    expect(selectedAthletesCount({ modo: 'selecao', ids: ['a', 'b', 'c'] })).toBe(3);
  });

  it('gera títulos como nas telas', () => {
    expect(buildGraphTitle(buildTestSpec())).toBe('Check-ins por dia · Sub-17');
    expect(
      buildGraphTitle(
        buildTestSpec({ metrica: 'ritmo', tipo: 'linha', categoria: ['elenco_todo'] }),
      ),
    ).toBe('Ritmo semanal');
    expect(buildGraphTitle(buildTestSpec({ metrica: 'ritmo', categoria: ['elenco_todo'] }))).toBe(
      'Ritmo por dia',
    );
    expect(buildGraphTitle(buildTestSpec({ categoria: ['sub_15', 'sub_17'] }))).toBe(
      'Sub-15 vs Sub-17 por dia',
    );
  });
});

describe('versões', () => {
  it('ajuste incrementa a versão, zera as séries e regenera o título', () => {
    const v1 = buildTestSpec({ series: [buildSerie('sub_17', [1, 2])] });
    const v2 = applyGraphPatch(v1, { tipo: 'linha' }, { keepTitle: false });

    expect(v2).toMatchObject({
      versao: 2,
      tipo: 'linha',
      series: [],
      titulo: 'Check-ins semanais · Sub-17',
    });
    expect(v1).toMatchObject({ versao: 1, tipo: 'barras' });
  });

  it('mantém o título quando o usuário renomeou', () => {
    const v1 = buildTestSpec({ titulo: 'Meu gráfico' });

    expect(applyGraphPatch(v1, { tipo: 'linha' }, { keepTitle: true }).titulo).toBe('Meu gráfico');
  });

  it('descreve o chip da versão pelo que mudou', () => {
    const v1 = buildTestSpec();

    expect(describeVersion(null, v1)).toBe('barras');
    expect(describeVersion(v1, { ...v1, categoria: ['sub_15', 'sub_17'] })).toBe('comparação');
    expect(describeVersion(v1, { ...v1, tipo: 'linha' })).toBe('linha');
    expect(describeVersion(v1, { ...v1, periodo: { tipo: 'ultimos_dias', dias: 30 } })).toBe(
      '30 dias',
    );
  });
});

describe('toDashboardChart', () => {
  it('converte comparação em barras com legenda e duas séries', () => {
    const spec = buildTestSpec({
      categoria: ['sub_15', 'sub_17'],
      series: [buildSerie('sub_15', [10, 20]), buildSerie('sub_17', [15, 12])],
    });

    expect(toDashboardChart(spec, { id: 'c1', footer: '' })).toMatchObject({
      kind: 'bar',
      origin: 'custom',
      legend: { value: 'Sub-15', comparison: 'Sub-17' },
      points: [
        { label: 'P1', value: 10, comparison: 15 },
        { label: 'P2', value: 20, comparison: 12 },
      ],
    });
  });

  it('destaca o pico quando há uma série só', () => {
    const spec = buildTestSpec({ series: [buildSerie('sub_17', [4, 9, 3])] });

    expect(toDashboardChart(spec, { id: 'c1', footer: '' })).toMatchObject({ highlightIndex: 1 });
  });

  it('kpi vira um número único com tendência', () => {
    const spec = buildTestSpec({ tipo: 'kpi', series: [buildSerie('sub_17', [1])] });

    expect(toDashboardChart(spec, { id: 'c1', footer: '', isNew: true })).toMatchObject({
      kind: 'kpi',
      value: '82%',
      trend: 'up',
      caption: '+4 pts vs início do período',
      isNew: true,
    });
  });
});
