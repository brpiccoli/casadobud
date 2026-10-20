import indexHtml from '../../../index.html?raw';

import { THEME_STORAGE_KEY } from './theme.constants';
import { applyThemeMode, getThemeMode, subscribeToThemeMode } from './theme.store';

describe('theme store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('reads the theme applied by the boot script', () => {
    document.documentElement.dataset.theme = 'light';
    expect(getThemeMode()).toBe('light');
  });

  it('falls back to the cached theme and then to dark', () => {
    expect(getThemeMode()).toBe('dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(getThemeMode()).toBe('light');
  });

  it('applies the theme to the root, caches it and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToThemeMode(listener);

    applyThemeMode('light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(listener).toHaveBeenCalledTimes(1);

    applyThemeMode('light');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('follows theme changes made in another tab', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToThemeMode(listener);

    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' }),
    );

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('shares the storage key with the boot script in index.html', () => {
    expect(indexHtml).toContain(`'${THEME_STORAGE_KEY}'`);
  });
});
