import { defaultLayoutForKind } from '@/features/charts/charts.layout';
import type { DashboardChart, KpiTrend } from '@/features/charts/charts.types';

import {
  BUD_CATEGORIES,
  BUD_METRICS,
  CATEGORY_LABELS,
  GRAPH_GROUPINGS,
  GRAPH_TYPE_SHORT_LABELS,
  GRAPH_TYPES,
  GROUPING_LABELS,
  METRIC_DEFINITIONS,
  PERIOD_DAYS_OPTIONS,
} from './bud.constants';
import type {
  BudCategory,
  BudMetric,
  BudToolError,
  GraphAthletes,
  GraphPeriod,
  GraphSpec,
  GraphSpecPatch,
  GraphSpecValidation,
  MetricQuery,
  Serie,
} from './bud.types';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function fail(erro: BudToolError['erro'], mensagem: string): BudToolError {
  return { ok: false, erro, mensagem };
}

export function isBudMetric(value: unknown): value is BudMetric {
  return typeof value === 'string' && (BUD_METRICS as readonly string[]).includes(value);
}

export function isBudCategory(value: unknown): value is BudCategory {
  return typeof value === 'string' && (BUD_CATEGORIES as readonly string[]).includes(value);
}

export function isComparison(spec: Pick<GraphSpec, 'categoria'>): boolean {
  return spec.categoria.length > 1;
}

export function selectedAthletesCount(atletas: GraphAthletes): number {
  if (atletas.modo === 'todos') return 0;
  return atletas.ids.length;
}

function isValidPeriod(periodo: GraphPeriod): boolean {
  if (periodo.tipo === 'ultimos_dias') return PERIOD_DAYS_OPTIONS.includes(periodo.dias);
  if (!ISO_DATE_PATTERN.test(periodo.inicio) || !ISO_DATE_PATTERN.test(periodo.fim)) return false;
  return periodo.inicio <= periodo.fim;
}

function normalizeAthletes(atletas: GraphAthletes): GraphAthletes {
  if (atletas.modo === 'todos') return atletas;
  const ids = [...new Set(atletas.ids)];
  if (ids.length === 0) return { modo: 'todos' };
  return { modo: 'selecao', ids };
}

export function validateGraphSpec(
  spec: GraphSpec,
  allowedCategories: readonly BudCategory[],
): GraphSpecValidation {
  if (!isBudMetric(spec.metrica)) {
    return fail('metrica_fora_do_enum', `Ainda não acompanho "${String(spec.metrica)}".`);
  }
  if (!(GRAPH_TYPES as readonly string[]).includes(spec.tipo)) {
    return fail('tipo_fora_do_enum', `Não sei montar gráfico do tipo "${String(spec.tipo)}".`);
  }
  if (!(GRAPH_GROUPINGS as readonly string[]).includes(spec.agrupamento)) {
    return fail('spec_invalido', `Agrupamento "${String(spec.agrupamento)}" não existe.`);
  }
  if (!isValidPeriod(spec.periodo)) {
    return fail('spec_invalido', 'Período inválido. Use 7 ou 30 dias, ou um intervalo de datas.');
  }

  const categoria = [...new Set(spec.categoria)];
  if (categoria.length === 0) {
    return fail('spec_invalido', 'Escolha pelo menos uma categoria.');
  }

  const unknownCategory = categoria.find((item) => !isBudCategory(item));
  if (unknownCategory) {
    return fail('categoria_fora_do_enum', `Não conheço a categoria "${String(unknownCategory)}".`);
  }

  const forbiddenCategory = categoria.find((item) => !allowedCategories.includes(item));
  if (forbiddenCategory) {
    return fail(
      'categoria_nao_permitida',
      `Você não tem acesso aos dados de ${CATEGORY_LABELS[forbiddenCategory]}.`,
    );
  }

  if (categoria.length > 1 && categoria.includes('elenco_todo')) {
    return fail(
      'spec_invalido',
      'Todo o elenco já inclui as categorias. Compare Sub-15 com Sub-17.',
    );
  }

  if (categoria.length > 1 && (spec.tipo === 'kpi' || spec.tipo === 'donut')) {
    return fail(
      'spec_invalido',
      'Donut e KPI mostram um grupo só. Para comparar, use barras, linha ou área.',
    );
  }

  return {
    ok: true,
    spec: { ...spec, categoria, atletas: normalizeAthletes(spec.atletas) },
  };
}

export function toMetricQuery(spec: MetricQuery): MetricQuery {
  return {
    metrica: spec.metrica,
    periodo: spec.periodo,
    categoria: spec.categoria,
    atletas: spec.atletas,
    agrupamento: spec.agrupamento,
  };
}

export function buildGraphTitle(
  spec: Omit<GraphSpec, 'id' | 'versao' | 'series' | 'titulo'>,
): string {
  const { label: metricLabel, plural } = METRIC_DEFINITIONS[spec.metrica];

  if (spec.tipo === 'kpi') return metricLabel;
  if (spec.tipo === 'donut') return `Distribuição de ${metricLabel.toLowerCase()}`;

  const groupingLabel = GROUPING_LABELS[spec.agrupamento];

  if (isComparison(spec)) {
    const categories = spec.categoria.map((item) => CATEGORY_LABELS[item]).join(' vs ');
    return `${categories} ${groupingLabel}`;
  }

  const isWeekly = spec.agrupamento === 'dia_semana' && spec.tipo !== 'barras';
  const weeklyLabel = plural ? 'semanais' : 'semanal';
  const base = isWeekly ? `${metricLabel} ${weeklyLabel}` : `${metricLabel} ${groupingLabel}`;
  const [category] = spec.categoria;
  if (category === 'elenco_todo') return base;
  return `${base} · ${CATEGORY_LABELS[category]}`;
}

export function applyGraphPatch(
  spec: GraphSpec,
  patch: GraphSpecPatch,
  options: { keepTitle: boolean },
): GraphSpec {
  const next: GraphSpec = { ...spec, ...patch, versao: spec.versao + 1, series: [] };
  if (patch.titulo || options.keepTitle) return next;
  return { ...next, titulo: buildGraphTitle(next) };
}

export function describeVersion(previous: GraphSpec | null, next: GraphSpec): string {
  if (!previous) return GRAPH_TYPE_SHORT_LABELS[next.tipo];
  if (!isComparison(previous) && isComparison(next)) return 'comparação';
  if (previous.tipo !== next.tipo) return GRAPH_TYPE_SHORT_LABELS[next.tipo];
  if (previous.metrica !== next.metrica)
    return METRIC_DEFINITIONS[next.metrica].label.toLowerCase();
  if (previous.agrupamento !== next.agrupamento) return GROUPING_LABELS[next.agrupamento];
  if (previous.categoria.join() !== next.categoria.join()) {
    return next.categoria.map((item) => CATEGORY_LABELS[item]).join(' + ');
  }
  if (JSON.stringify(previous.periodo) !== JSON.stringify(next.periodo)) {
    return formatPeriod(next.periodo);
  }
  if (JSON.stringify(previous.atletas) !== JSON.stringify(next.atletas)) return 'atletas';
  return 'ajuste';
}

export function formatPeriod(periodo: GraphPeriod): string {
  if (periodo.tipo === 'ultimos_dias') return `${periodo.dias} dias`;
  const [startYear, startMonth, startDay] = periodo.inicio.split('-');
  const [endYear, endMonth, endDay] = periodo.fim.split('-');
  const start =
    startYear === endYear ? `${startDay}/${startMonth}` : `${startDay}/${startMonth}/${startYear}`;
  return `${start} a ${endDay}/${endMonth}/${endYear}`;
}

const decimalFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatMetricSummary(metrica: BudMetric, valor: number): string {
  const formatted = decimalFormatter.format(valor);
  switch (METRIC_DEFINITIONS[metrica].unit) {
    case 'contagem':
    case 'percentual':
      return `${Math.round(valor)}%`;
    case 'horas':
      return `${formatted} h`;
    case 'escala':
      return `${formatted}/5`;
    case 'indice':
      return formatted;
  }
}

export function formatMetricPoint(metrica: BudMetric, valor: number): string {
  const formatted = decimalFormatter.format(valor);
  switch (METRIC_DEFINITIONS[metrica].unit) {
    case 'contagem':
      return `${Math.round(valor)} check-ins`;
    case 'percentual':
      return `${Math.round(valor)}%`;
    case 'horas':
      return `${formatted} h`;
    case 'escala':
      return `${formatted}/5`;
    case 'indice':
      return formatted;
  }
}

export function findPeakIndex(serie: Serie | undefined): number | undefined {
  if (!serie || serie.pontos.length === 0) return undefined;
  return serie.pontos.reduce(
    (peak, point, index) => (point.valor > serie.pontos[peak].valor ? index : peak),
    0,
  );
}

export function hasSeriesData(series: Serie[]): boolean {
  return series.some((serie) => serie.pontos.length > 0);
}

function resolveTrend(variacao: number): KpiTrend {
  if (variacao >= 1) return 'up';
  if (variacao <= -1) return 'down';
  return 'flat';
}

function formatVariation(variacao: number): string {
  const rounded = Math.round(variacao);
  if (rounded === 0) return 'estável no período';
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded} pts vs início do período`;
}

export function toDashboardChart(
  spec: GraphSpec,
  options: { id: string; footer: string; isNew?: boolean },
): DashboardChart {
  const base = {
    id: options.id,
    title: spec.titulo,
    origin: spec.origem === 'chat' ? ('custom' as const) : ('preset' as const),
    footer: options.footer,
    isNew: options.isNew,
  };
  const [primary, comparison] = spec.series;
  const summary = primary?.resumo ?? { valor: 0, variacao: 0 };

  if (spec.tipo === 'kpi') {
    return {
      ...base,
      kind: 'kpi',
      layout: defaultLayoutForKind('kpi'),
      value: formatMetricSummary(spec.metrica, summary.valor),
      caption: formatVariation(summary.variacao),
      trend: resolveTrend(summary.variacao),
    };
  }

  if (spec.tipo === 'donut') {
    const max = METRIC_DEFINITIONS[spec.metrica].donutMax;
    const percentage = Math.round(Math.min(Math.max((summary.valor / max) * 100, 0), 100));
    return { ...base, kind: 'donut', layout: defaultLayoutForKind('donut'), percentage };
  }

  const kindByType = { linha: 'line', barras: 'bar', area: 'area' } as const;
  const kind = kindByType[spec.tipo];

  return {
    ...base,
    kind,
    layout: defaultLayoutForKind(kind),
    points: (primary?.pontos ?? []).map((point, index) => ({
      label: point.rotulo,
      value: point.valor,
      comparison: comparison?.pontos[index]?.valor,
    })),
    highlightIndex: comparison ? undefined : findPeakIndex(primary),
    legend: comparison ? { value: primary.rotulo, comparison: comparison.rotulo } : undefined,
  };
}
