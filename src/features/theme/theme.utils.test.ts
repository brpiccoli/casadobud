import { darkModeFromThemeMode, parseThemeMode, themeModeFromDarkMode } from './theme.utils';

describe('parseThemeMode', () => {
  it('reads light only when explicitly stored', () => {
    expect(parseThemeMode('light')).toBe('light');
    expect(parseThemeMode('dark')).toBe('dark');
  });

  it('falls back to dark for missing or legacy values', () => {
    expect(parseThemeMode(null)).toBe('dark');
    expect(parseThemeMode(undefined)).toBe('dark');
    expect(parseThemeMode('system')).toBe('dark');
  });
});

describe('themeModeFromDarkMode', () => {
  it('maps the account preference to a theme', () => {
    expect(themeModeFromDarkMode(false)).toBe('light');
    expect(themeModeFromDarkMode(true)).toBe('dark');
  });

  it('uses the default theme when the account never chose one', () => {
    expect(themeModeFromDarkMode(null)).toBe('dark');
  });
});

describe('darkModeFromThemeMode', () => {
  it('maps the theme back to the profile column', () => {
    expect(darkModeFromThemeMode('light')).toBe(false);
    expect(darkModeFromThemeMode('dark')).toBe(true);
  });
});
