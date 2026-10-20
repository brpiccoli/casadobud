import { PLACEHOLDER_ALLOWED_CATEGORIES } from '@/features/bud/bud.constants';
import { buildAthleteRosterMock } from '@/features/bud/bud.mocks';
import { buildTestSpec } from '@/features/bud/bud.testUtils';
import { isComparison, validateGraphSpec } from '@/features/bud/graphSpec.utils';

import {
  athletesChipLabel,
  athletesPatch,
  builderRailTitle,
  categoryChipLabel,
  categoryPatch,
  comparePatch,
  draftCanvasTitle,
  lastExchangeForGraph,
  periodChipLabel,
  toggleAthleteId,
  toggleGroupIds,
  typePatch,
  versionChipLabel,
  visibleRoster,
} from './charts.builder';
import { buildTemplateSpec, CHART_TEMPLATES } from './charts.templates';

describe('templates do modal', () => {
  it('os 5 modelos geram spec válido sem o usuário escrever nada', () => {
    expect(CHART_TEMPLATES.map((template) => template.tipo)).toEqual([
      'linha',
      'barras',
      'donut',
      'area',
      'kpi',
    ]);

    CHART_TEMPLATES.forEach((template) => {
      const spec = buildTemplateSpec(template.tipo);
      expect(spec.origem).toBe('predefinido');
      const result = validateGraphSpec(
        { ...spec, id: template.tipo, versao: 1, titulo: '', series: [] },
        PLACEHOLDER_ALLOWED_CATEGORIES,
      );
      expect(result.ok).toBe(true);
    });
  });
});

describe('filtros do builder', () => {
  it('combina categoria, atletas, período e comparação', () => {
    const current = buildTestSpec();
    const withCategory = { ...current, ...categoryPatch('sub_15', current) };
    const withAthletes = { ...withCategory, atletas: athletesPatch(['atl-s15-01', 'atl-s15-02']) };
    const withPeriod = {
      ...withAthletes,
      periodo: { tipo: 'ultimos_dias' as const, dias: 30 as const },
    };
    const compared = { ...withPeriod, ...comparePatch(true, withPeriod) };

    expect(categoryChipLabel(withCategory.categoria)).toBe('Sub-15');
    expect(athletesChipLabel(withAthletes.atletas)).toBe('2');
    expect(periodChipLabel(withPeriod.periodo)).toBe('30 dias');
    expect(isComparison(compared)).toBe(true);
    expect(categoryChipLabel(compared.categoria)).toBe('Sub-15 + Sub-17');
    expect(athletesChipLabel(compared.atletas)).toBe('2');
    expect(periodChipLabel(compared.periodo)).toBe('30 dias');
  });

  it('comparar em donut ou KPI muda para barras', () => {
    const donut = buildTestSpec({ tipo: 'donut' });
    expect(comparePatch(true, donut)).toMatchObject({
      tipo: 'barras',
      categoria: ['sub_15', 'sub_17'],
    });
  });

  it('tipo incompatível com comparação desliga as duas séries', () => {
    const compared = buildTestSpec({ categoria: ['sub_15', 'sub_17'] });
    expect(typePatch('kpi', compared)).toMatchObject({
      tipo: 'kpi',
      agrupamento: 'grupo',
      categoria: ['sub_15'],
    });
  });

  it('rótulos batem com as telas', () => {
    expect(versionChipLabel(0, 'barras')).toBe('v1 · barras');
    expect(versionChipLabel(1, 'comparação')).toBe('v2 · comparação');
    expect(draftCanvasTitle('Barras por dia')).toBe('Barras por dia (rascunho)');
    expect(builderRailTitle(buildTestSpec(), false)).toBe('Barras · rascunho');
    expect(builderRailTitle(buildTestSpec(), true)).toBe('Novo gráfico');
  });
});

describe('seleção de atletas', () => {
  const roster = buildAthleteRosterMock();

  it('busca e troca ids, e Limpar volta para todos', () => {
    const sub17 = roster.filter((athlete) => athlete.categoria === 'sub_17');
    const [first, second] = sub17;
    const selected = toggleAthleteId(toggleAthleteId([], first.id), second.id);

    expect(visibleRoster(roster, ['sub_17'], 'pedro')).toEqual(
      roster.filter((athlete) => athlete.nome.toLowerCase().includes('pedro')),
    );
    expect(
      toggleGroupIds(
        [],
        sub17.map((athlete) => athlete.id),
        true,
      ),
    ).toHaveLength(32);
    expect(athletesPatch(selected)).toEqual({ modo: 'selecao', ids: [first.id, second.id] });
    expect(athletesPatch([])).toEqual({ modo: 'todos' });
  });
});

describe('handoff do chat', () => {
  it('traz o último pedido e a resposta que abriu o gráfico', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        text: 'Como está o ritmo?',
        status: 'done' as const,
        graphIds: [],
        redirectGraphId: null,
        confirmationGraphId: null,
      },
      {
        id: '2',
        role: 'bud' as const,
        text: 'Montei uma visão.',
        status: 'done' as const,
        graphIds: ['g1'],
        redirectGraphId: null,
        confirmationGraphId: null,
      },
      {
        id: '3',
        role: 'user' as const,
        text: 'Consegue deixar em barras por dia?',
        status: 'done' as const,
        graphIds: [],
        redirectGraphId: null,
        confirmationGraphId: null,
      },
      {
        id: '4',
        role: 'bud' as const,
        text: 'Vou abrir nos Gráficos.',
        status: 'done' as const,
        graphIds: ['g1'],
        redirectGraphId: 'g1',
        confirmationGraphId: null,
      },
    ];

    expect(lastExchangeForGraph(messages, 'g1').map((message) => message.id)).toEqual(['3', '4']);
  });
});
