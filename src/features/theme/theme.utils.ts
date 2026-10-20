import { DEFAULT_THEME_MODE } from './theme.constants';
import type { ThemeMode } from './theme.types';

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === 'light' ? 'light' : DEFAULT_THEME_MODE;
}

export function themeModeFromDarkMode(darkMode: boolean | null): ThemeMode {
  return darkMode === false ? 'light' : DEFAULT_THEME_MODE;
}

export function darkModeFromThemeMode(mode: ThemeMode): boolean {
  return mode === 'dark';
}
