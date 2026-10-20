import { useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { buildSessionContext } from '@/features/bud/bud.context';
import type { BudState } from '@/features/bud/bud.engine.types';
import type { BudStore } from '@/features/bud/bud.store';
import type { BudScreen, SessionContext } from '@/features/bud/bud.types';
import { toDashboardChart } from '@/features/bud/graphSpec.utils';
import { NEW_CHART_FOOTER } from '@/features/charts/charts.constants';
import { addDashboardChart } from '@/features/charts/charts.service';
import { getChatSession, type ChatSession } from '@/features/chat/chat.session';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import { syncPeriodCaches } from '@/hooks/useDashboardChartsQuery';

export function useChatSession(): ChatSession {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? 'anonimo';

  return useMemo(
    () =>
      getChatSession(userId, {
        saveToDashboard: async (spec) => {
          const id = crypto.randomUUID();
          const chart = toDashboardChart(spec, { id, footer: NEW_CHART_FOOTER, isNew: true });
          const next = await addDashboardChart(userId, chart);
          syncPeriodCaches(queryClient, userId, next);
          return id;
        },
      }),
    [queryClient, userId],
  );
}

export function useBudState(store: BudStore): BudState {
  return useSyncExternalStore(store.subscribe, store.getState);
}

export function useBudSessionContext(screen: BudScreen): SessionContext {
  const { displayName } = useCurrentStaff();
  return useMemo(
    () => buildSessionContext({ userName: displayName, screen }),
    [displayName, screen],
  );
}
