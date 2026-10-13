import type { ChartKind, DashboardPeriod } from '@/features/charts/charts.types';

export type BudMetric = 'check_ins' | 'sono' | 'humor' | 'engajamento' | 'ritmo';

export type BudCategory = 'sub_15' | 'sub_17' | 'elenco_todo';

export type GraphType = 'linha' | 'barras' | 'donut' | 'area' | 'kpi';

export type GraphGrouping = 'dia_semana' | 'data' | 'atleta' | 'grupo';

export type GraphOrigin = 'predefinido' | 'chat';

export type PeriodDays = 7 | 30;

export type GraphPeriod =
  { tipo: 'ultimos_dias'; dias: PeriodDays } | { tipo: 'intervalo'; inicio: string; fim: string };

export type GraphAthletes = { modo: 'todos' } | { modo: 'selecao'; ids: string[] };

export interface SeriePoint {
  rotulo: string;
  valor: number;
}

export interface SerieSummary {
  valor: number;
  variacao: number;
}

export interface Serie {
  id: string;
  rotulo: string;
  categoria: BudCategory;
  pontos: SeriePoint[];
  resumo: SerieSummary;
}

export interface GraphSpec {
  id: string;
  titulo: string;
  versao: number;
  origem: GraphOrigin;
  tipo: GraphType;
  metrica: BudMetric;
  periodo: GraphPeriod;
  categoria: BudCategory[];
  atletas: GraphAthletes;
  agrupamento: GraphGrouping;
  series: Serie[];
}

export type GraphSpecInput = Omit<GraphSpec, 'id' | 'versao' | 'series' | 'titulo'> & {
  titulo?: string;
};

export type GraphSpecPatch = Partial<
  Pick<
    GraphSpec,
    'titulo' | 'tipo' | 'metrica' | 'periodo' | 'categoria' | 'atletas' | 'agrupamento'
  >
>;

export type MetricQuery = Pick<
  GraphSpec,
  'metrica' | 'periodo' | 'categoria' | 'atletas' | 'agrupamento'
>;

export interface Athlete {
  id: string;
  nome: string;
  categoria: Exclude<BudCategory, 'elenco_todo'>;
}

export type BudScreen = 'chat' | 'builder' | 'dashboard' | 'voz_ao_vivo';

export type BudMode = 'texto' | 'voz_ditado' | 'voz_ao_vivo';

export type BudDataMode = 'placeholder' | 'real';

export type BudRole = 'psicologo';

export interface BudUser {
  nome: string;
  papel: BudRole;
  clube: string;
  categorias_permitidas: BudCategory[];
}

export interface DashboardCardSnapshot {
  id: string;
  titulo: string;
  tipo: ChartKind;
}

export interface DashboardSnapshot {
  periodo_global: DashboardPeriod;
  cards: DashboardCardSnapshot[];
}

export interface CurrentSelection {
  categoria: BudCategory[];
  atletas: string[];
}

export interface PendingConfirmation {
  acao: 'salvar_grafico';
  grafico_id: string;
}

export interface BudHistoryMessage {
  papel: 'usuario' | 'bud';
  texto: string;
}

export interface SessionContext {
  usuario: BudUser;
  tela_atual: BudScreen;
  modo: BudMode;
  grafico_em_foco: GraphSpec | null;
  dashboard: DashboardSnapshot;
  selecao_atual: CurrentSelection;
  dados_modo: BudDataMode;
  historico: BudHistoryMessage[];
  confirmacao_pendente: PendingConfirmation | null;
}

export type BudToolName =
  | 'consultar_metricas'
  | 'criar_grafico'
  | 'ajustar_grafico'
  | 'salvar_grafico'
  | 'descartar_grafico'
  | 'abrir_no_builder'
  | 'confirmar_por_voz';

export type VoiceConfirmationAnswer = 'salvar' | 'ajustar';

export interface BudToolArgsMap {
  consultar_metricas: MetricQuery;
  criar_grafico: { spec: GraphSpecInput };
  ajustar_grafico: { id: string; patch: GraphSpecPatch };
  salvar_grafico: { id: string };
  descartar_grafico: { id: string };
  abrir_no_builder: { id: string };
  confirmar_por_voz: { id: string; resposta: VoiceConfirmationAnswer };
}

export interface BudToolResultMap {
  consultar_metricas: { series: Serie[]; ilustrativo: boolean };
  criar_grafico: { id: string; versao: number };
  ajustar_grafico: { id: string; versao: number };
  salvar_grafico: { id: string; status: 'aguardando_confirmacao' | 'salvo' };
  descartar_grafico: { id: string; status: 'descartado' };
  abrir_no_builder: { id: string; rota: string };
  confirmar_por_voz: { id: string; status: 'salvo' | 'ajustando' };
}

export type BudToolCall = {
  [Name in BudToolName]: { id: string; nome: Name; argumentos: BudToolArgsMap[Name] };
}[BudToolName];

export type BudToolErrorCode =
  | 'metrica_fora_do_enum'
  | 'categoria_fora_do_enum'
  | 'categoria_nao_permitida'
  | 'tipo_fora_do_enum'
  | 'spec_invalido'
  | 'grafico_nao_encontrado'
  | 'sem_dados'
  | 'fora_do_modo_voz';

export interface BudToolError {
  ok: false;
  erro: BudToolErrorCode;
  mensagem: string;
}

export type BudToolSuccess = {
  [Name in BudToolName]: { ok: true; nome: Name; dados: BudToolResultMap[Name] };
}[BudToolName];

export type BudToolOutcome = BudToolSuccess | (BudToolError & { nome: BudToolName });

export type GraphSpecValidation = { ok: true; spec: GraphSpec } | BudToolError;
