import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { useStaffProfileQuery, useUpdateStaffProfileMutation } from '@/hooks/useStaffProfileQuery';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

const THEME_STORAGE_KEY = 'casadobud:theme-preference';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readSystemMode(): ThemeMode {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

function readStoredPreference(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function preferenceFromProfile(darkMode: boolean | null | undefined): ThemePreference | null {
  if (darkMode === true) return 'dark';
  if (darkMode === false) return 'light';
  return null;
}

function darkModeFromPreference(preference: ThemePreference): boolean | null {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return null;
}

interface ThemeContextType {
  mode: ThemeMode;
  preference: ThemePreference;
  isDarkMode: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface LocalThemeChoice {
  userId: string | null;
  preference: ThemePreference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { data: profile } = useStaffProfileQuery();
  const { mutateAsync: updateProfile } = useUpdateStaffProfileMutation();
  const [storedPreference] = useState<ThemePreference>(readStoredPreference);
  const [localChoice, setLocalChoice] = useState<LocalThemeChoice | null>(null);
  const [systemMode, setSystemMode] = useState<ThemeMode>(readSystemMode);

  const preference: ThemePreference =
    (localChoice?.userId === userId ? localChoice.preference : null) ??
    preferenceFromProfile(profile?.dark_mode) ??
    storedPreference;

  const mode: ThemeMode = preference === 'system' ? systemMode : preference;

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const handleChange = () => setSystemMode(readSystemMode());
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
  }, [mode]);

  const setPreference = useCallback(
    async (nextPreference: ThemePreference) => {
      const previous = preference;
      setLocalChoice({ userId, preference: nextPreference });

      if (!userId) return;

      try {
        await updateProfile({ dark_mode: darkModeFromPreference(nextPreference) });
      } catch {
        setLocalChoice({ userId, preference: previous });
        toast.error('Não foi possível salvar sua preferência de tema.');
      }
    },
    [preference, updateProfile, userId],
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      mode,
      preference,
      isDarkMode: mode === 'dark',
      setPreference,
    }),
    [mode, preference, setPreference],
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
