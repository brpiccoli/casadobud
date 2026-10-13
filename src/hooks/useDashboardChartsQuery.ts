import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { fetchDashboardCharts } from '@/features/charts/charts.service';
import type { DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';
import { queryKeys } from '@/lib/queryKeys';

export function useDashboardChartsQuery(period: DashboardPeriod) {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.dashboardCharts(userId ?? '', period),
    queryFn: () => fetchDashboardCharts(userId!, period),
    enabled: !!userId,
  });
}

export function useSetDashboardChartsCache(period: DashboardPeriod) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useCallback(
    (updater: (current: DashboardChart[]) => DashboardChart[]) => {
      if (!userId) return;
      queryClient.setQueryData<DashboardChart[]>(
        queryKeys.dashboardCharts(userId, period),
        (current) => updater(current ?? []),
      );
    },
    [period, queryClient, userId],
  );
}
