import { GRAPH_TYPE_SHORT_LABELS, PLACEHOLDER_PREVIEW_NOTICE } from '@/features/bud/bud.constants';
import type { GraphSpecInput, GraphType } from '@/features/bud/bud.types';

import { defaultLayoutForKind } from './charts.layout';
import type { ChartKind, DashboardChart } from './charts.types';

export interface ChartTemplate {
  tipo: GraphType;
  kind: ChartKind;
  label: string;
  preview: DashboardChart;
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

const LINE_POINTS = [36, 42, 50, 48, 40, 46, 58, 62].map((value, index) => ({
  label: `S${index + 1}`,
  value,
}));

const BAR_POINTS = [48, 62, 36, 74, 57, 66, 50].map((value, index) => ({
  label: WEEKDAYS[index],
  value,
}));

const AREA_POINTS = [30, 42, 50, 44, 34, 40, 58, 66].map((value, index) => ({
  label: `S${index + 1}`,
  value,
}));

export const CHART_TEMPLATES: ChartTemplate[] = [
  {
    tipo: 'linha',
    kind: 'line',
    label: 'Linha',
    preview: {
      id: 'template-line',
      kind: 'line',
      origin: 'preset',
      title: 'Linha',
      footer: '',
      layout: defaultLayoutForKind('line'),
      points: LINE_POINTS,
    },
  },
  {
    tipo: 'barras',
    kind: 'bar',
    label: 'Barras',
    preview: {
      id: 'template-bar',
      kind: 'bar',
      origin: 'preset',
      title: 'Barras',
      footer: '',
      layout: defaultLayoutForKind('bar'),
      points: BAR_POINTS,
      highlightIndex: 3,
    },
  },
  {
    tipo: 'donut',
    kind: 'donut',
    label: 'Donut',
    preview: {
      id: 'template-donut',
      kind: 'donut',
      origin: 'preset',
      title: 'Donut',
      footer: '',
      layout: defaultLayoutForKind('donut'),
      percentage: 62,
    },
  },
  {
    tipo: 'area',
    kind: 'area',
    label: 'Área',
    preview: {
      id: 'template-area',
      kind: 'area',
      origin: 'preset',
      title: 'Área',
      footer: '',
      layout: defaultLayoutForKind('area'),
      points: AREA_POINTS,
    },
  },
  {
    tipo: 'kpi',
    kind: 'kpi',
    label: 'Indicador (KPI)',
    preview: {
      id: 'template-kpi',
      kind: 'kpi',
      origin: 'preset',
      title: 'Indicador (KPI)',
      footer: '',
      layout: defaultLayoutForKind('kpi'),
      value: '82%',
      caption: '',
      trend: 'up',
    },
  },
];

export function buildTemplateSpec(tipo: GraphType): GraphSpecInput {
  const grouped = tipo === 'donut' || tipo === 'kpi';

  return {
    origem: 'predefinido',
    tipo,
    metrica: 'check_ins',
    periodo: { tipo: 'ultimos_dias', dias: 7 },
    categoria: ['sub_17'],
    atletas: { modo: 'todos' },
    agrupamento: grouped ? 'grupo' : 'dia_semana',
  };
}

export const TEMPLATE_WELCOME = (tipo: GraphType) =>
  `Montei um gráfico de ${GRAPH_TYPE_SHORT_LABELS[tipo]} a partir do modelo. Ajuste os filtros acima do gráfico ou me diga o que mudar.`;

export const BUD_CREATE_WELCOME =
  'Me diz o que você quer ver. Pode ser check-ins, sono, humor, engajamento ou ritmo — em linha, barras, donut, área ou KPI.';

export const BUILDER_CHART_FOOTER = PLACEHOLDER_PREVIEW_NOTICE;
