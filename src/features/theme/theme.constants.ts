import type { ThemeMode } from './theme.types';

/** Precisa bater com o script de boot em `index.html`, que aplica o tema antes do primeiro paint. */
export const THEME_STORAGE_KEY = 'casadobud:theme-preference';

export const DEFAULT_THEME_MODE: ThemeMode = 'dark';
