import type {
  BudCategory,
  BudDataMode,
  BudMetric,
  BudToolName,
  GraphGrouping,
  GraphType,
  PeriodDays,
} from './bud.types';

export const BUD_METRICS: readonly BudMetric[] = [
  'check_ins',
  'sono',
  'humor',
  'engajamento',
  'ritmo',
];

export const BUD_CATEGORIES: readonly BudCategory[] = ['sub_15', 'sub_17', 'elenco_todo'];

export const SQUAD_CATEGORIES: readonly Exclude<BudCategory, 'elenco_todo'>[] = [
  'sub_15',
  'sub_17',
];

export const GRAPH_TYPES: readonly GraphType[] = ['linha', 'barras', 'donut', 'area', 'kpi'];

export const GRAPH_GROUPINGS: readonly GraphGrouping[] = ['dia_semana', 'data', 'atleta', 'grupo'];

export const PERIOD_DAYS_OPTIONS: readonly PeriodDays[] = [7, 30];

export const BUD_TOOL_NAMES: readonly BudToolName[] = [
  'consultar_metricas',
  'criar_grafico',
  'ajustar_grafico',
  'salvar_grafico',
  'descartar_grafico',
  'abrir_no_builder',
  'confirmar_por_voz',
];

export type MetricUnit = 'contagem' | 'horas' | 'escala' | 'percentual' | 'indice';

export interface MetricDefinition {
  label: string;
  plural: boolean;
  unit: MetricUnit;
  donutMax: number;
  plainLanguage: string;
  confirmed: boolean;
}

export const METRIC_DEFINITIONS: Record<BudMetric, MetricDefinition> = {
  check_ins: {
    label: 'Check-ins',
    plural: true,
    unit: 'contagem',
    donutMax: 100,
    plainLanguage: 'contando quantos check-ins o time fez',
    confirmed: true,
  },
  sono: {
    label: 'Sono',
    plural: false,
    unit: 'horas',
    donutMax: 9,
    plainLanguage: 'vendo quantas horas o time disse que dormiu',
    confirmed: false,
  },
  humor: {
    label: 'Humor',
    plural: false,
    unit: 'escala',
    donutMax: 5,
    plainLanguage: 'vendo como o time disse que estava se sentindo',
    confirmed: false,
  },
  engajamento: {
    label: 'Engajamento',
    plural: false,
    unit: 'percentual',
    donutMax: 100,
    plainLanguage: 'medindo quanto o time usou o companion',
    confirmed: false,
  },
  ritmo: {
    label: 'Ritmo',
    plural: false,
    unit: 'indice',
    donutMax: 100,
    plainLanguage: 'acompanhando o ritmo do time',
    confirmed: false,
  },
};

export const CATEGORY_LABELS: Record<BudCategory, string> = {
  sub_15: 'Sub-15',
  sub_17: 'Sub-17',
  elenco_todo: 'Todo o elenco',
};

export const GRAPH_TYPE_LABELS: Record<GraphType, string> = {
  linha: 'Linha',
  barras: 'Barras',
  donut: 'Donut',
  area: 'Área',
  kpi: 'Indicador (KPI)',
};

export const GRAPH_TYPE_SHORT_LABELS: Record<GraphType, string> = {
  linha: 'linha',
  barras: 'barras',
  donut: 'donut',
  area: 'área',
  kpi: 'KPI',
};

export const GROUPING_LABELS: Record<GraphGrouping, string> = {
  dia_semana: 'por dia',
  data: 'por data',
  atleta: 'por atleta',
  grupo: 'por grupo',
};

export const GROUPING_PLAIN_LANGUAGE: Record<GraphGrouping, string> = {
  dia_semana: 'em cada dia da semana',
  data: 'em cada data',
  atleta: 'por atleta',
  grupo: 'em cada grupo',
};

export const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export const WEEKDAY_FULL_LABELS = [
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
  'domingo',
] as const;

export const METRIC_HISTORY_DAYS = 90;

export const BUD_DATA_MODE: BudDataMode = 'placeholder';

export const PLACEHOLDER_ALLOWED_CATEGORIES: BudCategory[] = ['sub_15', 'sub_17', 'elenco_todo'];

export const PLACEHOLDER_CLUB_NAME = 'Juventus Mooca';

export const BUD_MAX_TOOL_ROUNDS = 4;

export const VOICE_AUTO_ADVANCE_MS = 3000;

export const CHAT_REDIRECT_DELAY_MS = 1400;

export const PLACEHOLDER_DATA_NOTICE = 'Dados do companion · placeholder';

export const PLACEHOLDER_PREVIEW_NOTICE = 'Pré-visualização com dados placeholder';
