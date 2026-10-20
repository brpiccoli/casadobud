import type { BudChatMessage } from '@/features/bud/bud.engine.types';
import {
  CATEGORY_LABELS,
  GRAPH_TYPE_LABELS,
  SQUAD_CATEGORIES,
} from '@/features/bud/bud.constants';
import type {
  Athlete,
  BudCategory,
  GraphAthletes,
  GraphPeriod,
  GraphSpec,
  GraphSpecPatch,
  GraphType,
  PeriodDays,
} from '@/features/bud/bud.types';
import { formatPeriod, isComparison, selectedAthletesCount } from '@/features/bud/graphSpec.utils';
import { normalizeSearchText } from '@/features/conversations/conversations.utils';

export const BUILDER_PERIOD_OPTIONS: { dias: PeriodDays; label: string }[] = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
];

export const COMPARE_CATEGORIES: BudCategory[] = ['sub_15', 'sub_17'];

export const COMPARABLE_GRAPH_TYPES: GraphType[] = ['linha', 'barras', 'area'];

export function canCompareType(tipo: GraphType): boolean {
  return COMPARABLE_GRAPH_TYPES.includes(tipo);
}

export function periodChipLabel(periodo: GraphPeriod): string {
  if (periodo.tipo === 'ultimos_dias') return `${periodo.dias} dias`;
  return formatPeriod(periodo);
}

export function categoryChipLabel(categoria: BudCategory[]): string {
  if (categoria.length > 1) return categoria.map((item) => CATEGORY_LABELS[item]).join(' + ');
  return CATEGORY_LABELS[categoria[0] ?? 'elenco_todo'];
}

export function athletesChipLabel(atletas: GraphAthletes): string {
  if (atletas.modo === 'todos') return 'Todos';
  return String(selectedAthletesCount(atletas));
}

export function typeChipLabel(tipo: GraphType): string {
  return GRAPH_TYPE_LABELS[tipo];
}

export function versionChipLabel(index: number, label: string): string {
  return `v${index + 1} · ${label}`;
}

export function draftCanvasTitle(title: string): string {
  return `${title} (rascunho)`;
}

export function builderRailTitle(spec: GraphSpec | null, fromChat: boolean): string {
  if (fromChat || !spec) return 'Novo gráfico';
  return `${GRAPH_TYPE_LABELS[spec.tipo]} · rascunho`;
}

export function comparePatch(enabled: boolean, current: GraphSpec): GraphSpecPatch {
  if (enabled) {
    const patch: GraphSpecPatch = { categoria: [...COMPARE_CATEGORIES] };
    if (!canCompareType(current.tipo)) patch.tipo = 'barras';
    return patch;
  }

  return { categoria: ['sub_17'] };
}

export function categoryPatch(
  category: BudCategory | 'compare',
  current: GraphSpec,
): GraphSpecPatch {
  if (category === 'compare') return comparePatch(true, current);
  return { categoria: [category] };
}

export function periodPatch(dias: PeriodDays): GraphSpecPatch {
  return { periodo: { tipo: 'ultimos_dias', dias } };
}

export function typePatch(tipo: GraphType, current: GraphSpec): GraphSpecPatch {
  const patch: GraphSpecPatch = { tipo };
  if (!canCompareType(tipo) && isComparison(current)) {
    patch.categoria = [current.categoria[0] === 'sub_15' ? 'sub_15' : 'sub_17'];
  }
  if (tipo === 'donut' || tipo === 'kpi') patch.agrupamento = 'grupo';
  if (tipo === 'linha' || tipo === 'barras' || tipo === 'area') {
    patch.agrupamento = current.agrupamento === 'grupo' ? 'dia_semana' : current.agrupamento;
  }
  return patch;
}

export function athletesPatch(ids: string[]): GraphAthletes {
  if (ids.length === 0) return { modo: 'todos' };
  return { modo: 'selecao', ids };
}

export function visibleRoster(
  roster: Athlete[],
  categoria: BudCategory[],
  query: string,
): Athlete[] {
  const comparing = categoria.length > 1 || categoria.includes('elenco_todo');
  const inCategory = roster.filter(
    (athlete) => comparing || categoria.includes(athlete.categoria),
  );
  const needle = normalizeSearchText(query);
  if (!needle) return inCategory;
  return inCategory.filter((athlete) => normalizeSearchText(athlete.nome).includes(needle));
}

export function groupCounts(roster: Athlete[]): Record<(typeof SQUAD_CATEGORIES)[number], number> {
  return {
    sub_15: roster.filter((athlete) => athlete.categoria === 'sub_15').length,
    sub_17: roster.filter((athlete) => athlete.categoria === 'sub_17').length,
  };
}

export function toggleAthleteId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function toggleGroupIds(ids: string[], groupIds: string[], selected: boolean): string[] {
  if (selected) return [...new Set([...ids, ...groupIds])];
  const drop = new Set(groupIds);
  return ids.filter((id) => !drop.has(id));
}

export function builderThreadKey(graphId: string): string {
  return `builder:${graphId}`;
}

export function lastExchangeForGraph(
  messages: BudChatMessage[],
  graphId: string,
): BudChatMessage[] {
  const lastIndex = messages.findLastIndex(
    (message) => message.graphIds.includes(graphId) || message.redirectGraphId === graphId,
  );
  if (lastIndex === -1) return [];
  const start = lastIndex > 0 && messages[lastIndex].role === 'bud' ? lastIndex - 1 : lastIndex;
  return messages.slice(start, lastIndex + 1);
}
