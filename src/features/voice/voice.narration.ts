import {
  CATEGORY_LABELS,
  GRAPH_TYPE_SHORT_LABELS,
  GROUPING_PHRASES,
  GROUPING_PLAIN_LANGUAGE,
  METRIC_SUBJECTS,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_LABELS,
} from '@/features/bud/bud.constants';
import type { BudCategory, BudDataMode, GraphPeriod, GraphSpec } from '@/features/bud/bud.types';
import {
  findPeakIndex,
  formatMetricSummary,
  formatPeriod,
  isComparison,
} from '@/features/bud/graphSpec.utils';

import {
  VOICE_COPY,
  VOICE_GROUPING_STEPS,
  VOICE_PLAIN_LANGUAGE,
  VOICE_PROGRESS_UNITS,
} from './voice.constants';
import type { VoicePlainLanguage, VoicePlanStep, VoiceTiming } from './voice.types';

export type VoiceSpecPreview = Pick<
  GraphSpec,
  'tipo' | 'metrica' | 'periodo' | 'categoria' | 'agrupamento'
>;

const PLACEHOLDER_VOICE_NOTICE = ' Os valores são ilustrativos.';

function isSummaryChart(preview: Pick<GraphSpec, 'tipo'>): boolean {
  return preview.tipo === 'kpi' || preview.tipo === 'donut';
}

function categoryTarget(categories: BudCategory[]): string {
  if (categories.includes('elenco_todo')) return 'do elenco todo';
  return categories.map((category) => `do ${CATEGORY_LABELS[category]}`).join(' e ');
}

function periodPhrase(periodo: GraphPeriod): string {
  if (periodo.tipo === 'ultimos_dias') return `nos últimos ${periodo.dias} dias`;
  return `de ${formatPeriod(periodo)}`;
}

function chartNoun(preview: VoiceSpecPreview): string {
  if (preview.tipo === 'kpi') return 'um indicador';
  return `um gráfico de ${GRAPH_TYPE_SHORT_LABELS[preview.tipo]}`;
}

export function buildPlanningLine(preview: VoiceSpecPreview, isAdjustment: boolean): string {
  const subject = METRIC_SUBJECTS[preview.metrica].text;
  const target = categoryTarget(preview.categoria);
  const grouping = isSummaryChart(preview) ? '' : `, ${GROUPING_PHRASES[preview.agrupamento]}`;
  const opening = isAdjustment ? 'Beleza, vou ajustar. Agora fica' : 'Entendi. Vou montar';
  return `${opening} ${chartNoun(preview)} com ${subject} ${target}${grouping}.`;
}

export function buildVoicePlan(preview: VoiceSpecPreview): VoicePlanStep[] {
  const subject = METRIC_SUBJECTS[preview.metrica].text;
  const groupingStep = isSummaryChart(preview)
    ? 'Calculando o resumo do período'
    : VOICE_GROUPING_STEPS[preview.agrupamento];
  const buildStep =
    preview.tipo === 'kpi'
      ? 'Montando o indicador'
      : `Montando o gráfico de ${GRAPH_TYPE_SHORT_LABELS[preview.tipo]}`;

  return [
    { id: 'fetch', label: `Buscando ${subject} no companion`, status: 'active' },
    { id: 'group', label: groupingStep, status: 'pending' },
    { id: 'build', label: buildStep, status: 'pending' },
    { id: 'check', label: VOICE_COPY.checkStep, status: 'pending' },
  ];
}

export function completeStepsThrough(steps: VoicePlanStep[], index: number): VoicePlanStep[] {
  return steps.map((step, position) => {
    if (position <= index) return { ...step, status: 'done' };
    if (position === index + 1) return { ...step, status: 'active' };
    return { ...step, status: 'pending' };
  });
}

export function buildPlainLanguage(preview: VoiceSpecPreview): VoicePlainLanguage {
  const { highlight, rest } = VOICE_PLAIN_LANGUAGE[preview.metrica];
  const isLastWeekByDay =
    preview.agrupamento === 'dia_semana' &&
    preview.periodo.tipo === 'ultimos_dias' &&
    preview.periodo.dias === 7;

  let scope = `${GROUPING_PLAIN_LANGUAGE[preview.agrupamento]} ${periodPhrase(preview.periodo)}`;
  if (isSummaryChart(preview)) scope = periodPhrase(preview.periodo);
  else if (isLastWeekByDay) scope = 'em cada dia da semana passada';

  return { lead: VOICE_COPY.plainLanguageLead, highlight, rest: ` ${rest} ${scope}.` };
}

export function countRevealSteps(spec: GraphSpec): number {
  if (isSummaryChart(spec)) return 1;
  return spec.series[0]?.pontos.length ?? 0;
}

export function findInsightRevealIndex(spec: GraphSpec): number {
  const total = countRevealSteps(spec);
  if (isSummaryChart(spec) || isComparison(spec)) return Math.max(total - 1, 0);
  return findPeakIndex(spec.series[0]) ?? Math.max(total - 1, 0);
}

export function computeRevealStepMs(total: number, timing: VoiceTiming): number {
  if (total <= 0) return 0;
  const perStep = timing.revealTotalMs / total;
  return Math.min(Math.max(perStep, timing.revealStepMinMs), timing.revealStepMaxMs);
}

function weekdayName(label: string): string {
  const index = WEEKDAY_LABELS.indexOf(label as (typeof WEEKDAY_LABELS)[number]);
  return index === -1 ? label : WEEKDAY_FULL_LABELS[index];
}

export function buildInsightLine(spec: GraphSpec, dataMode: BudDataMode): string {
  const [primary, secondary] = spec.series;
  if (!primary || primary.pontos.length === 0) return '';

  if (isSummaryChart(spec)) {
    const notice = dataMode === 'placeholder' ? PLACEHOLDER_VOICE_NOTICE : '';
    return `Já dá pra ver: ${periodPhrase(spec.periodo)}, ficou em ${formatMetricSummary(spec.metrica, primary.resumo.valor)}.${notice}`;
  }

  if (secondary && isComparison(spec)) {
    const ahead = primary.pontos.filter(
      (point, index) => point.valor > (secondary.pontos[index]?.valor ?? 0),
    ).length;
    return `Já dá pra ver: o ${primary.rotulo} ficou acima do ${secondary.rotulo} em ${ahead} de ${primary.pontos.length} pontos.`;
  }

  const peak = primary.pontos[findPeakIndex(primary) ?? 0];
  switch (spec.agrupamento) {
    case 'dia_semana':
      return `Já dá pra ver: ${weekdayName(peak.rotulo)} foi o dia mais forte do time.`;
    case 'data':
      return `Já dá pra ver: o pico foi em ${peak.rotulo}.`;
    case 'atleta':
      return `Já dá pra ver: ${peak.rotulo} aparece no topo.`;
    case 'grupo':
      return `Já dá pra ver: o ${peak.rotulo} ficou na frente.`;
  }
}

export function formatRevealProgress(spec: GraphSpec, revealed: number): string {
  const total = countRevealSteps(spec);
  if (isSummaryChart(spec)) return `${revealed} de ${total}`;
  return `${revealed} de ${total} ${VOICE_PROGRESS_UNITS[spec.agrupamento]}`;
}
