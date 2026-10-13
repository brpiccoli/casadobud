import { normalizeSearchText } from '@/features/conversations/conversations.utils';

import { CATEGORY_LABELS } from './bud.constants';
import type {
  Athlete,
  BudCategory,
  BudMetric,
  GraphGrouping,
  GraphPeriod,
  GraphSpecInput,
  GraphSpecPatch,
  GraphType,
  SessionContext,
} from './bud.types';

export type BudIntent =
  | { kind: 'confirm_yes' }
  | { kind: 'confirm_no' }
  | { kind: 'save' }
  | { kind: 'discard' }
  | { kind: 'open_builder' }
  | { kind: 'clinical' }
  | { kind: 'out_of_scope_action' }
  | { kind: 'unknown_metric'; term: string | null }
  | { kind: 'forbidden_category'; category: BudCategory }
  | { kind: 'ambiguous_reference' }
  | { kind: 'ambiguous_athlete'; name: string; matches: Athlete[] }
  | { kind: 'adjust'; patch: GraphSpecPatch }
  | { kind: 'create'; spec: GraphSpecInput; style: 'chart' | 'analysis' }
  | { kind: 'changes_since_yesterday' }
  | { kind: 'team_overview' }
  | { kind: 'missing_metric' }
  | { kind: 'help' };

interface PatternRule<Value> {
  pattern: RegExp;
  value: Value;
}

const TYPE_RULES: PatternRule<GraphType>[] = [
  { pattern: /\bbarras?\b/, value: 'barras' },
  { pattern: /\blinhas?\b/, value: 'linha' },
  { pattern: /\b(donut|rosca|pizza)\b/, value: 'donut' },
  { pattern: /\b(grafico de )?area\b/, value: 'area' },
  { pattern: /\b(kpi|indicador|numero unico|so o numero)\b/, value: 'kpi' },
];

const GROUPING_RULES: PatternRule<GraphGrouping>[] = [
  { pattern: /\bpor (atleta|jogador)s?\b|\bcada (atleta|jogador)\b/, value: 'atleta' },
  { pattern: /\bpor (grupo|categoria)s?\b/, value: 'grupo' },
  { pattern: /\bpor data\b|\bdia apos dia\b|\bao longo d[oa]\b/, value: 'data' },
  { pattern: /\bpor dia\b|\bdia a dia\b|\bcada dia\b|\bdia da semana\b/, value: 'dia_semana' },
];

const METRIC_RULES: PatternRule<BudMetric>[] = [
  { pattern: /\bcheck[\s-]?ins?\b/, value: 'check_ins' },
  { pattern: /\bsono\b|\bdorm(ir|iu|indo|iram)\b/, value: 'sono' },
  { pattern: /\bhumor\b|\banimo\b/, value: 'humor' },
  { pattern: /\bengaja(mento|dos?)\b|\badesao\b/, value: 'engajamento' },
  { pattern: /\britmo\b/, value: 'ritmo' },
];

const UNKNOWN_METRIC_LABELS: Record<string, string> = {
  lesoes: 'lesões',
  lesao: 'lesão',
  gol: 'gol',
  gols: 'gols',
  'frequencia cardiaca': 'frequência cardíaca',
  batimento: 'batimento',
  batimentos: 'batimentos',
  peso: 'peso',
  'carga de treino': 'carga de treino',
  gps: 'GPS',
  velocidade: 'velocidade',
  'minutos jogados': 'minutos jogados',
  hidratacao: 'hidratação',
  nutricao: 'nutrição',
  alimentacao: 'alimentação',
  vo2: 'VO2',
  sprint: 'sprint',
  sprints: 'sprints',
};

const UNKNOWN_METRIC_PATTERN = new RegExp(
  `\\b(${Object.keys(UNKNOWN_METRIC_LABELS).join('|')})\\b`,
);

const WEEK_PATTERN =
  /\b(ultimos? 7 dias|7 dias|ultima semana|nesta semana|essa semana|esta semana|na semana|semana passada|semanal)\b/;
const MONTH_PATTERN =
  /\b(ultimos? 30 dias|30 dias|no mes|do mes|este mes|esse mes|ultimo mes|mensal)\b/;
const INTERVAL_PATTERN = /\bde (\d{1,2})\/(\d{1,2}) (?:a|ate) (\d{1,2})\/(\d{1,2})\b/;

const SUB_15_PATTERN = /\bsub[\s-]?15\b/;
const SUB_17_PATTERN = /\bsub[\s-]?17\b/;
const WHOLE_SQUAD_PATTERN =
  /\b(elenco todo|todo o elenco|elenco inteiro|time todo|time inteiro|todo mundo)\b/;
const COMPARE_PATTERN = /\b(compar\w*|vs|versus|contra)\b/;
const ALL_ATHLETES_PATTERN = /\btodos os atletas\b/;

const CLINICAL_PATTERN =
  /\b(diagnostic\w*|depressao|depressivo|transtorno|medicacao|remedio|patologia|tdah|burnout clinico|laudo)\b/;
const OUT_OF_SCOPE_PATTERN =
  /\b(whatsapp|whats|zap|e-?mail|sms|telegram|compartilh\w*|imprim\w*|export\w*|pdf|planilha|excel)\b/;
const SAVE_PATTERN =
  /\b(salva|salvar|salve|guarda|guardar)\b|\b(manda|coloca|adiciona|joga|leva)\w* (pro|para o|no|ao) dashboard\b/;
const DISCARD_PATTERN =
  /\b(descarta|descartar|descarte|nao era isso|joga fora|apaga (o|esse|este) (rascunho|grafico))\b/;
const OPEN_BUILDER_PATTERN = /\b(abr[ea]|abrir) (nos|no|em) (graficos|builder)\b/;
const CONFIRM_YES_PATTERN =
  /^(sim|pode|pode sim|isso|confirmo|confirma|claro|beleza|ok|salva|manda|era isso|perfeito)\b/;
const CONFIRM_NO_PATTERN = /^(nao|agora nao|cancela|deixa|quase|quero ajustar|ajustar)\b/;
const AMBIGUOUS_REFERENCE_PATTERN =
  /\b(aquele|aquela|esse|essa|este|esta) (atleta|menino|jogador|garoto|moleque)\b|\b(ele|dele)\b/;
const GRAPH_REQUEST_PATTERN =
  /\b(grafico|monta|montar|cria|criar|crie|mostra|mostrar|faz um|faca um|gera)\b/;
const NEW_GRAPH_PATTERN =
  /\b(novo grafico|outro grafico|cria um|crie um|monta um|faz um|faca um)\b/;
const CHANGES_PATTERN = /\bmudou desde ontem\b|\bmudou de ontem\b/;
const OVERVIEW_PATTERN =
  /\bcomo (o time|o elenco|a galera|os atletas|o grupo) (esta|estao|anda|andam|ta)\b/;

function firstMatch<Value>(text: string, rules: PatternRule<Value>[]): Value | undefined {
  return rules.find((rule) => rule.pattern.test(text))?.value;
}

function parsePeriod(text: string, referenceDate: Date): GraphPeriod | undefined {
  const interval = text.match(INTERVAL_PATTERN);
  if (interval) {
    const year = referenceDate.getFullYear();
    const [, startDay, startMonth, endDay, endMonth] = interval;
    const pad = (value: string) => value.padStart(2, '0');
    return {
      tipo: 'intervalo',
      inicio: `${year}-${pad(startMonth)}-${pad(startDay)}`,
      fim: `${year}-${pad(endMonth)}-${pad(endDay)}`,
    };
  }
  if (MONTH_PATTERN.test(text)) return { tipo: 'ultimos_dias', dias: 30 };
  if (WEEK_PATTERN.test(text)) return { tipo: 'ultimos_dias', dias: 7 };
  return undefined;
}

function parseCategories(
  text: string,
  focus: SessionContext['grafico_em_foco'],
): BudCategory[] | undefined {
  const mentioned: BudCategory[] = [];
  if (SUB_15_PATTERN.test(text)) mentioned.push('sub_15');
  if (SUB_17_PATTERN.test(text)) mentioned.push('sub_17');

  if (mentioned.length === 2) return mentioned;

  if (mentioned.length === 1 && COMPARE_PATTERN.test(text) && focus) {
    const [focusCategory] = focus.categoria;
    if (
      focus.categoria.length === 1 &&
      focusCategory !== 'elenco_todo' &&
      focusCategory !== mentioned[0]
    ) {
      return (['sub_15', 'sub_17'] as const).filter(
        (category) => category === focusCategory || category === mentioned[0],
      );
    }
  }

  if (mentioned.length === 1) return mentioned;
  if (WHOLE_SQUAD_PATTERN.test(text)) return ['elenco_todo'];
  return undefined;
}

interface AthleteMatch {
  athletes: Athlete[];
  ambiguous: { name: string; matches: Athlete[] } | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseAthletes(text: string, roster: Athlete[]): AthleteMatch {
  let remaining = text;
  const found = new Map<string, Athlete>();

  roster.forEach((athlete) => {
    const fullName = normalizeSearchText(athlete.nome);
    const pattern = new RegExp(`\\b${escapeRegExp(fullName)}\\b`);
    if (!pattern.test(remaining)) return;
    found.set(athlete.id, athlete);
    remaining = remaining.replace(pattern, ' ');
  });

  const byFirstName = new Map<string, Athlete[]>();
  roster.forEach((athlete) => {
    const firstName = normalizeSearchText(athlete.nome.split(' ')[0]);
    byFirstName.set(firstName, [...(byFirstName.get(firstName) ?? []), athlete]);
  });

  for (const [firstName, athletes] of byFirstName) {
    if (!new RegExp(`\\b${escapeRegExp(firstName)}\\b`).test(remaining)) continue;
    if (athletes.length > 1) {
      return {
        athletes: [...found.values()],
        ambiguous: { name: athletes[0].nome.split(' ')[0], matches: athletes },
      };
    }
    found.set(athletes[0].id, athletes[0]);
  }

  return { athletes: [...found.values()], ambiguous: null };
}

export interface ParsedPatch {
  patch: GraphSpecPatch;
  ambiguousAthlete: AthleteMatch['ambiguous'];
}

export function parseGraphPatch(
  message: string,
  context: SessionContext,
  roster: Athlete[],
  referenceDate: Date = new Date(),
): ParsedPatch {
  const text = normalizeSearchText(message);
  const patch: GraphSpecPatch = {};

  const tipo = firstMatch(text, TYPE_RULES);
  if (tipo) patch.tipo = tipo;

  const agrupamento = firstMatch(text, GROUPING_RULES);
  if (agrupamento) patch.agrupamento = agrupamento;

  const metrica = firstMatch(text, METRIC_RULES);
  if (metrica) patch.metrica = metrica;

  const periodo = parsePeriod(text, referenceDate);
  if (periodo) patch.periodo = periodo;

  const categoria = parseCategories(text, context.grafico_em_foco);
  if (categoria) patch.categoria = categoria;

  const athleteMatch = parseAthletes(text, roster);
  if (athleteMatch.athletes.length > 0) {
    patch.atletas = { modo: 'selecao', ids: athleteMatch.athletes.map((athlete) => athlete.id) };
  } else if (ALL_ATHLETES_PATTERN.test(text)) {
    patch.atletas = { modo: 'todos' };
  }

  return { patch, ambiguousAthlete: athleteMatch.ambiguous };
}

function resolveDefaultCategories(context: SessionContext): BudCategory[] {
  const allowed = context.usuario.categorias_permitidas;
  const selected = context.selecao_atual.categoria.filter((category) => allowed.includes(category));
  if (selected.length > 0) return selected;
  if (allowed.includes('elenco_todo')) return ['elenco_todo'];
  return allowed.slice(0, 1);
}

export function buildSpecFromPatch(
  patch: GraphSpecPatch,
  context: SessionContext,
  style: 'chart' | 'analysis',
): GraphSpecInput {
  return {
    origem: 'chat',
    tipo: patch.tipo ?? (style === 'chart' ? 'barras' : 'linha'),
    metrica: patch.metrica ?? 'check_ins',
    periodo: patch.periodo ?? { tipo: 'ultimos_dias', dias: 7 },
    categoria: patch.categoria ?? resolveDefaultCategories(context),
    atletas: patch.atletas ?? { modo: 'todos' },
    agrupamento: patch.agrupamento ?? 'dia_semana',
    titulo: patch.titulo,
  };
}

export function describeAllowedCategories(context: SessionContext): string {
  return context.usuario.categorias_permitidas
    .map((category) => CATEGORY_LABELS[category])
    .join(', ');
}

export function parseBudIntent(
  message: string,
  context: SessionContext,
  roster: Athlete[],
  referenceDate: Date = new Date(),
): BudIntent {
  const text = normalizeSearchText(message);
  const focus = context.grafico_em_foco;

  if (context.confirmacao_pendente) {
    if (CONFIRM_NO_PATTERN.test(text)) return { kind: 'confirm_no' };
    if (CONFIRM_YES_PATTERN.test(text)) return { kind: 'confirm_yes' };
  }

  if (CLINICAL_PATTERN.test(text)) return { kind: 'clinical' };
  if (OUT_OF_SCOPE_PATTERN.test(text)) return { kind: 'out_of_scope_action' };
  if (SAVE_PATTERN.test(text)) return { kind: 'save' };
  if (DISCARD_PATTERN.test(text)) return { kind: 'discard' };
  if (OPEN_BUILDER_PATTERN.test(text)) return { kind: 'open_builder' };

  const { patch, ambiguousAthlete } = parseGraphPatch(message, context, roster, referenceDate);

  const unknownMatch = text.match(UNKNOWN_METRIC_PATTERN)?.[0];
  if (unknownMatch && !patch.metrica) {
    return { kind: 'unknown_metric', term: UNKNOWN_METRIC_LABELS[unknownMatch] ?? unknownMatch };
  }

  const forbidden = patch.categoria?.find(
    (category) => !context.usuario.categorias_permitidas.includes(category),
  );
  if (forbidden) return { kind: 'forbidden_category', category: forbidden };

  if (ambiguousAthlete) return { kind: 'ambiguous_athlete', ...ambiguousAthlete };
  if (!patch.atletas && AMBIGUOUS_REFERENCE_PATTERN.test(text))
    return { kind: 'ambiguous_reference' };

  if (CHANGES_PATTERN.test(text)) return { kind: 'changes_since_yesterday' };
  if (OVERVIEW_PATTERN.test(text) && !patch.metrica) return { kind: 'team_overview' };

  const hasPatch = Object.keys(patch).length > 0;
  const wantsGraph = GRAPH_REQUEST_PATTERN.test(text);
  const wantsNewGraph = NEW_GRAPH_PATTERN.test(text);
  if (hasPatch && focus && !wantsNewGraph) return { kind: 'adjust', patch };

  const describesGraph =
    Boolean(patch.metrica || patch.tipo || patch.agrupamento) ||
    (patch.categoria?.length ?? 0) > 1 ||
    (wantsGraph && hasPatch);

  if (describesGraph) {
    const style = wantsGraph || !patch.metrica ? 'chart' : 'analysis';
    return { kind: 'create', spec: buildSpecFromPatch(patch, context, style), style };
  }

  if (wantsGraph) return { kind: 'missing_metric' };
  return { kind: 'help' };
}
