import { THEME_STORAGE_KEY } from './theme.constants';
import type { ThemeMode, ThemeModeListener } from './theme.types';
import { parseThemeMode } from './theme.utils';

const listeners = new Set<ThemeModeListener>();

function readStoredThemeMode(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    return;
  }
}

export function getThemeMode(): ThemeMode {
  return parseThemeMode(document.documentElement.dataset.theme ?? readStoredThemeMode());
}

export function applyThemeMode(mode: ThemeMode) {
  writeStoredThemeMode(mode);
  if (document.documentElement.dataset.theme === mode) return;

  document.documentElement.dataset.theme = mode;
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyThemeMode(parseThemeMode(event.newValue));
}

export function subscribeToThemeMode(listener: ThemeModeListener) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', handleStorage);
  };
}
