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
const lazyChartBuilder = async () => ({
  Component: (await import('@/pages/charts/ChartBuilder')).ChartBuilder,
});
const lazyVoice = async () => ({ Component: (await import('@/pages/voice/Voice')).Voice });
const lazyVoicePreview = async () => ({
  Component: (await import('@/pages/voice/VoicePreview')).VoicePreview,
});
const lazyProfile = async () => ({ Component: (await import('@/pages/profile/Profile')).Profile });
const lazyFoundations = async () => ({
  Component: (await import('@/pages/foundations/Foundations')).Foundations,
});

const devOnlyRoutes = import.meta.env.DEV
  ? [
      { path: ROUTES.foundations, lazy: lazyFoundations },
      { path: `${ROUTES.foundations}/voz`, lazy: lazyVoicePreview },
    ]
  : [];

const router = createBrowserRouter([
  ...devOnlyRoutes,
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
      { path: ROUTES.voice, lazy: lazyVoice },
      { path: `${ROUTES.voice}/:conversationId`, lazy: lazyVoice },
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.chat, lazy: lazyChat },
          { path: `${ROUTES.chat}/:conversationId`, lazy: lazyChat },
          { path: ROUTES.charts, lazy: lazyCharts },
          { path: ROUTES.chartBuilder, lazy: lazyChartBuilder },
          { path: `${ROUTES.chartBuilder}/:graphId`, lazy: lazyChartBuilder },
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
