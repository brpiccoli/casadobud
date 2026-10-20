import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { applyThemeMode, getThemeMode, subscribeToThemeMode } from '@/features/theme/theme.store';
import type { ThemeMode } from '@/features/theme/theme.types';
import { darkModeFromThemeMode, themeModeFromDarkMode } from '@/features/theme/theme.utils';
import { useStaffProfileQuery, useUpdateStaffProfileMutation } from '@/hooks/useStaffProfileQuery';

export type { ThemeMode } from '@/features/theme/theme.types';

interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useStaffProfileQuery();
  const { mutateAsync: updateProfile } = useUpdateStaffProfileMutation();
  const mode = useSyncExternalStore(subscribeToThemeMode, getThemeMode);
  const accountMode = profile ? themeModeFromDarkMode(profile.dark_mode) : null;

  useLayoutEffect(() => {
    if (!accountMode) return;
    applyThemeMode(accountMode);
  }, [accountMode]);

  const setMode = useCallback(
    async (nextMode: ThemeMode) => {
      const previousMode = getThemeMode();
      if (nextMode === previousMode) return;

      applyThemeMode(nextMode);
      if (!user) return;

      try {
        await updateProfile({ dark_mode: darkModeFromThemeMode(nextMode) });
      } catch {
        applyThemeMode(previousMode);
        toast.error('Não foi possível salvar sua preferência de tema.');
      }
    },
    [updateProfile, user],
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      mode,
      isDarkMode: mode === 'dark',
      setMode,
    }),
    [mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
