import { addDays, differenceInCalendarDays, format, getISODay, parseISO, subDays } from 'date-fns';

import {
  CATEGORY_LABELS,
  METRIC_HISTORY_DAYS,
  SQUAD_CATEGORIES,
  WEEKDAY_LABELS,
} from './bud.constants';
import { buildAthleteRosterMock, buildDailyMetricMock } from './bud.mocks';
import type {
  Athlete,
  BudCategory,
  GraphPeriod,
  MetricQuery,
  Serie,
  SeriePoint,
} from './bud.types';

interface MetricRow {
  atleta: Athlete;
  data: string;
  diaSemana: number;
  valor: number;
}

interface PeriodBounds {
  start: Date;
  end: Date;
}

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function resolvePeriodBounds(periodo: GraphPeriod, referenceDate: Date): PeriodBounds | null {
  const historyStart = subDays(referenceDate, METRIC_HISTORY_DAYS - 1);
  const requested =
    periodo.tipo === 'ultimos_dias'
      ? { start: subDays(referenceDate, periodo.dias - 1), end: referenceDate }
      : { start: parseISO(periodo.inicio), end: parseISO(periodo.fim) };

  const start = requested.start < historyStart ? historyStart : requested.start;
  const end = requested.end > referenceDate ? referenceDate : requested.end;
  if (differenceInCalendarDays(end, start) < 0) return null;
  return { start, end };
}

function listDates({ start, end }: PeriodBounds): Date[] {
  const total = differenceInCalendarDays(end, start) + 1;
  return Array.from({ length: total }, (_, index) => addDays(start, index));
}

function resolveAthletes(
  roster: Athlete[],
  categoria: BudCategory,
  atletas: MetricQuery['atletas'],
): Athlete[] {
  const inCategory = roster.filter(
    (athlete) => categoria === 'elenco_todo' || athlete.categoria === categoria,
  );
  if (atletas.modo === 'todos') return inCategory;
  return inCategory.filter((athlete) => atletas.ids.includes(athlete.id));
}

function buildRows(query: MetricQuery, athletes: Athlete[], dates: Date[]): MetricRow[] {
  return athletes.flatMap((atleta) =>
    dates.map((date) => {
      const data = toDateKey(date);
      const diaSemana = getISODay(date) - 1;
      return {
        atleta,
        data,
        diaSemana,
        valor: buildDailyMetricMock(query.metrica, atleta, data, diaSemana),
      };
    }),
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function aggregate(metrica: MetricQuery['metrica'], rows: MetricRow[]): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + row.valor, 0);
  if (metrica === 'check_ins') return total;
  return round(total / rows.length);
}

function summarize(metrica: MetricQuery['metrica'], rows: MetricRow[]): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + row.valor, 0);
  const average = total / rows.length;
  return round(metrica === 'check_ins' ? average * 100 : average);
}

function groupRows(rows: MetricRow[], key: (row: MetricRow) => string): Map<string, MetricRow[]> {
  const groups = new Map<string, MetricRow[]>();
  rows.forEach((row) => {
    const bucketKey = key(row);
    groups.set(bucketKey, [...(groups.get(bucketKey) ?? []), row]);
  });
  return groups;
}

function buildPoints(query: MetricQuery, rows: MetricRow[], dates: Date[]): SeriePoint[] {
  if (rows.length === 0) return [];

  switch (query.agrupamento) {
    case 'dia_semana': {
      const groups = groupRows(rows, (row) => String(row.diaSemana));
      return WEEKDAY_LABELS.flatMap((rotulo, index) => {
        const weekdayRows = groups.get(String(index));
        if (!weekdayRows) return [];
        return [{ rotulo, valor: aggregate(query.metrica, weekdayRows) }];
      });
    }
    case 'data': {
      const groups = groupRows(rows, (row) => row.data);
      return dates.map((date) => ({
        rotulo: format(date, 'dd/MM'),
        valor: aggregate(query.metrica, groups.get(toDateKey(date)) ?? []),
      }));
    }
    case 'atleta': {
      const groups = groupRows(rows, (row) => row.atleta.id);
      return [...groups.values()]
        .map((athleteRows) => ({
          rotulo: athleteRows[0].atleta.nome,
          valor: aggregate(query.metrica, athleteRows),
        }))
        .sort((a, b) => b.valor - a.valor);
    }
    case 'grupo': {
      const groups = groupRows(rows, (row) => row.atleta.categoria);
      return SQUAD_CATEGORIES.filter((category) => groups.has(category)).map((category) => ({
        rotulo: CATEGORY_LABELS[category],
        valor: aggregate(query.metrica, groups.get(category) ?? []),
      }));
    }
  }
}

function buildSerie(
  query: MetricQuery,
  categoria: BudCategory,
  roster: Athlete[],
  bounds: PeriodBounds | null,
): Serie {
  const emptySerie: Serie = {
    id: categoria,
    rotulo: CATEGORY_LABELS[categoria],
    categoria,
    pontos: [],
    resumo: { valor: 0, variacao: 0 },
  };
  if (!bounds) return emptySerie;

  const dates = listDates(bounds);
  const athletes = resolveAthletes(roster, categoria, query.atletas);
  const rows = buildRows(query, athletes, dates);
  if (rows.length === 0) return emptySerie;

  const midpoint = toDateKey(dates[Math.floor(dates.length / 2)]);
  const firstHalf = rows.filter((row) => row.data < midpoint);
  const secondHalf = rows.filter((row) => row.data >= midpoint);

  return {
    ...emptySerie,
    pontos: buildPoints(query, rows, dates),
    resumo: {
      valor: summarize(query.metrica, rows),
      variacao:
        firstHalf.length === 0
          ? 0
          : round(summarize(query.metrica, secondHalf) - summarize(query.metrica, firstHalf)),
    },
  };
}

// Mock até existir a agregação de metrica_diaria no Supabase (dados do companion).
export async function fetchAthleteRoster(): Promise<Athlete[]> {
  return buildAthleteRosterMock();
}

// Mock até existir a agregação de metrica_diaria no Supabase (dados do companion).
export async function fetchMetricSeries(
  query: MetricQuery,
  referenceDate: Date = new Date(),
): Promise<Serie[]> {
  const roster = await fetchAthleteRoster();
  const bounds = resolvePeriodBounds(query.periodo, referenceDate);
  return query.categoria.map((categoria) => buildSerie(query, categoria, roster, bounds));
}
