import { Navigate, RouterProvider, createBrowserRouter } from 'react-router';

import { AppLayout } from '@/components/layout/AppLayout';
import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from '@/constants/routes';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Login } from '@/pages/auth/Login';
import { ResetPassword } from '@/pages/auth/ResetPassword';

import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RequireAuth } from './RequireAuth';

const lazyChat = async () => ({ Component: (await import('@/pages/chat/Chat')).Chat });
const lazyCharts = async () => ({
  Component: (await import('@/pages/charts/ChartsDashboard')).ChartsDashboard,
});
const lazyProfile = async () => ({ Component: (await import('@/pages/profile/Profile')).Profile });

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.login, element: <Login /> },
      { path: ROUTES.forgotPassword, element: <ForgotPassword /> },
    ],
  },
  { path: ROUTES.resetPassword, element: <ResetPassword /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.chat, lazy: lazyChat },
          { path: `${ROUTES.chat}/:conversationId`, lazy: lazyChat },
          { path: ROUTES.charts, lazy: lazyCharts },
          { path: ROUTES.profile, lazy: lazyProfile },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
