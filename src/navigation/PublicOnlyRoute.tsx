import { Navigate, Outlet } from 'react-router';

import { SplashScreen } from '@/components/SplashScreen';
import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export function PublicOnlyRoute() {
  const { session, loading, passwordRecoveryPending } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (session && passwordRecoveryPending) {
    return <Navigate to={ROUTES.resetPassword} replace />;
  }

  if (session) {
    return <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />;
  }

  return <Outlet />;
}
