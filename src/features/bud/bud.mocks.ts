import type { Athlete, BudMetric } from './bud.types';

const SUB_17_FEATURED = [
  'Pedro Martins',
  'Lucas Ferreira',
  'Rafael Souza',
  'João Vitor',
  'Enzo Cardoso',
];

const FIRST_NAMES = [
  'Gabriel',
  'Matheus',
  'Gustavo',
  'Felipe',
  'Arthur',
  'Davi',
  'Bernardo',
  'Heitor',
  'Thiago',
  'Caio',
  'Vinícius',
  'Samuel',
  'Murilo',
  'Henrique',
  'Igor',
  'Leonardo',
  'Bruno',
  'Diego',
  'Otávio',
  'Nicolas',
  'Daniel',
  'Eduardo',
  'Kauã',
  'Miguel',
  'Ryan',
  'André',
  'Yuri',
  'Breno',
  'Vitor',
  'Renan',
];

const LAST_NAMES = [
  'Almeida',
  'Barbosa',
  'Campos',
  'Duarte',
  'Esteves',
  'Freitas',
  'Gomes',
  'Lima',
  'Moraes',
  'Nogueira',
  'Oliveira',
  'Pereira',
  'Queiroz',
  'Ribeiro',
  'Santos',
  'Teixeira',
  'Vieira',
];

export const SQUAD_SIZES = { sub_15: 26, sub_17: 32 } as const;

function buildNames(count: number, offset: number, featured: string[] = []): string[] {
  const generated = Array.from({ length: count - featured.length }, (_, index) => {
    const position = index + offset;
    const firstName = FIRST_NAMES[position % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(position * 7) % LAST_NAMES.length];
    return `${firstName} ${lastName}`;
  });
  return [...featured, ...generated];
}

export function buildAthleteRosterMock(): Athlete[] {
  const sub17 = buildNames(SQUAD_SIZES.sub_17, 0, SUB_17_FEATURED).map((nome, index) => ({
    id: `atl-s17-${String(index + 1).padStart(2, '0')}`,
    nome,
    categoria: 'sub_17' as const,
  }));
  const sub15 = buildNames(SQUAD_SIZES.sub_15, SQUAD_SIZES.sub_17).map((nome, index) => ({
    id: `atl-s15-${String(index + 1).padStart(2, '0')}`,
    nome,
    categoria: 'sub_15' as const,
  }));
  return [...sub17, ...sub15];
}

const WEEKDAY_CHECKIN_RATE = [0.66, 0.78, 0.58, 0.92, 0.72, 0.82, 0.6];
const WEEKDAY_RHYTHM_WAVE = [-0.4, 0, 0.6, 1, 0.5, -0.2, -0.8];

function hashToUnit(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function buildDailyMetricMock(
  metrica: BudMetric,
  athlete: Athlete,
  dateKey: string,
  weekdayIndex: number,
): number {
  const random = hashToUnit(`${athlete.id}:${dateKey}:${metrica}`);
  const squadFactor = athlete.categoria === 'sub_15' ? 0.9 : 1;
  const isWeekend = weekdayIndex >= 5;

  switch (metrica) {
    case 'check_ins':
      return random < WEEKDAY_CHECKIN_RATE[weekdayIndex] * squadFactor ? 1 : 0;
    case 'sono':
      return 6.2 + random * 2.4 - (isWeekend ? 0.6 : 0);
    case 'humor':
      return Math.min(5, 2.6 + random * 2.2 + WEEKDAY_RHYTHM_WAVE[weekdayIndex] * 0.3);
    case 'engajamento':
      return 30 + random * 60 * WEEKDAY_CHECKIN_RATE[weekdayIndex] * squadFactor;
    case 'ritmo':
      return 52 + random * 26 + WEEKDAY_RHYTHM_WAVE[weekdayIndex] * 9;
  }
}
