import { Navigate, Outlet, useLocation } from 'react-router';

import { SplashScreen } from '@/components/SplashScreen';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginLocationState } from '@/types/navigation.types';

export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  if (!session) {
    const state: LoginLocationState = { from: `${location.pathname}${location.search}` };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }

  return <Outlet />;
}
