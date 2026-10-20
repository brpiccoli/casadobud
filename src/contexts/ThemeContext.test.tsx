import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

import { THEME_STORAGE_KEY } from '@/features/theme/theme.constants';
import type { StaffProfile } from '@/services/profileQuery';

import { ThemeProvider, useTheme } from './ThemeContext';

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  profile: undefined as Pick<StaffProfile, 'dark_mode'> | undefined,
  updateProfile: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mocks.user }),
}));

vi.mock('@/hooks/useStaffProfileQuery', () => ({
  useStaffProfileQuery: () => ({ data: mocks.profile }),
  useUpdateStaffProfileMutation: () => ({ mutateAsync: mocks.updateProfile }),
}));

vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    mocks.user = null;
    mocks.profile = undefined;
    mocks.updateProfile.mockReset().mockResolvedValue(undefined);
    mocks.toastError.mockReset();
  });

  it('starts dark when nothing was saved', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('dark');
  });

  it('applies the theme saved on the account as soon as the profile loads', () => {
    mocks.user = { id: 'user-1' };
    mocks.profile = { dark_mode: false };

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('switches immediately and saves the choice on the account', async () => {
    mocks.user = { id: 'user-1' };
    mocks.profile = { dark_mode: true };
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(() => result.current.setMode('light'));

    expect(result.current.mode).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(mocks.updateProfile).toHaveBeenCalledWith({ dark_mode: false });
  });

  it('reverts and warns when the server rejects the change', async () => {
    mocks.user = { id: 'user-1' };
    mocks.profile = { dark_mode: true };
    mocks.updateProfile.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(() => result.current.setMode('light'));

    expect(result.current.mode).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it('keeps the last theme after sign out', () => {
    mocks.user = { id: 'user-1' };
    mocks.profile = { dark_mode: false };
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });

    mocks.user = null;
    mocks.profile = undefined;
    rerender();

    expect(result.current.mode).toBe('light');
  });
});
