import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { DASHBOARD_PERIOD_OPTIONS } from '@/features/charts/charts.constants';
import {
  addDashboardChart,
  fetchDashboardCharts,
  persistDashboardCharts,
  readDashboardCharts,
} from '@/features/charts/charts.service';
import type { DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';
import { applyPeriodToCharts } from '@/features/charts/charts.utils';
import { queryKeys } from '@/lib/queryKeys';

export function syncPeriodCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  charts: DashboardChart[],
) {
  DASHBOARD_PERIOD_OPTIONS.forEach((option) => {
    queryClient.setQueryData(
      queryKeys.dashboardCharts(userId, option.value),
      applyPeriodToCharts(charts, option.value),
    );
  });
}

export function useDashboardChartsQuery(period: DashboardPeriod) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.dashboardCharts(userId ?? '', period),
    queryFn: () => fetchDashboardCharts(userId!, period),
    enabled: !!userId,
    placeholderData: (previous) => previous,
  });
}

export function useAddDashboardChart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useCallback(
    async (chart: DashboardChart) => {
      if (!userId) return;
      const next = await addDashboardChart(userId, chart);
      syncPeriodCaches(queryClient, userId, next);
    },
    [queryClient, userId],
  );
}

export function useUpdateDashboardCharts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useCallback(
    (updater: (current: DashboardChart[]) => DashboardChart[]) => {
      if (!userId) return;
      const next = persistDashboardCharts(userId, updater(readDashboardCharts(userId)));
      syncPeriodCaches(queryClient, userId, next);
    },
    [queryClient, userId],
  );
}
