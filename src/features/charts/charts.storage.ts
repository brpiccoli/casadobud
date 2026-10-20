import type { ChartLayout, DashboardChart, StoredDashboard } from './charts.types';

const DASHBOARD_STORAGE_PREFIX = 'casadobud:dashboard:';
const DASHBOARD_STORAGE_VERSION = 1;

function storageKey(userId: string): string {
  return `${DASHBOARD_STORAGE_PREFIX}${userId}`;
}

function emptyStoredDashboard(): StoredDashboard {
  return { version: DASHBOARD_STORAGE_VERSION, initialized: false, items: [] };
}

function isChartLayout(value: unknown): value is ChartLayout {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ChartLayout>;
  return (
    typeof candidate.x === 'number' &&
    typeof candidate.y === 'number' &&
    typeof candidate.w === 'number' &&
    typeof candidate.h === 'number'
  );
}

function isDashboardChart(value: unknown): value is DashboardChart {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<DashboardChart>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.kind === 'string' &&
    isChartLayout(candidate.layout)
  );
}

function isStoredDashboard(value: unknown): value is StoredDashboard {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<StoredDashboard>;
  return (
    candidate.version === DASHBOARD_STORAGE_VERSION &&
    typeof candidate.initialized === 'boolean' &&
    Array.isArray(candidate.items) &&
    candidate.items.every(isDashboardChart)
  );
}

export function readStoredDashboard(
  userId: string,
  storage: Storage = window.localStorage,
): StoredDashboard {
  try {
    const raw = storage.getItem(storageKey(userId));
    if (!raw) return emptyStoredDashboard();
    const parsed: unknown = JSON.parse(raw);
    return isStoredDashboard(parsed) ? parsed : emptyStoredDashboard();
  } catch {
    return emptyStoredDashboard();
  }
}

export function writeStoredDashboard(
  userId: string,
  data: StoredDashboard,
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    return;
  }
}
