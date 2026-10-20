import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { toDashboardChart } from '@/features/bud/graphSpec.utils';
import { NEW_CHART_FOOTER } from '@/features/charts/charts.constants';
import { readDashboardCharts } from '@/features/charts/charts.service';
import { createBrowserVoiceIO } from '@/features/voice/browserVoice';
import { VOICE_INITIAL_STATE } from '@/features/voice/voice.constants';
import { createVoiceSession, type VoiceSession } from '@/features/voice/voice.session';
import { useChatSession } from '@/hooks/useChatSession';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import { useAddDashboardChart } from '@/hooks/useDashboardChartsQuery';

const noopSubscribe = () => () => undefined;
const getInitialState = () => VOICE_INITIAL_STATE;

export function useVoiceSession(threadKey: string) {
  const chat = useChatSession();
  const { user } = useAuth();
  const { displayName } = useCurrentStaff();
  const addDashboardChart = useAddDashboardChart();
  const userId = user?.id ?? '';
  const latest = useRef({ displayName, addDashboardChart, chat, userId });
  const [session, setSession] = useState<VoiceSession | null>(null);

  useEffect(() => {
    latest.current = { displayName, addDashboardChart, chat, userId };
  }, [addDashboardChart, chat, displayName, userId]);

  useEffect(() => {
    const created = createVoiceSession({
      io: createBrowserVoiceIO(),
      store: latest.current.chat.store,
      brain: latest.current.chat.brain,
      roster: latest.current.chat.roster,
      threadKey,
      getUserName: () => latest.current.displayName,
      createId: () => latest.current.chat.createId(),
      getDashboardCharts: () =>
        latest.current.userId ? readDashboardCharts(latest.current.userId) : [],
      saveToDashboard: async (spec) => {
        const id = crypto.randomUUID();
        await latest.current.addDashboardChart(
          toDashboardChart(spec, { id, footer: NEW_CHART_FOOTER, isNew: true }),
        );
        return id;
      },
    });
    setSession(created);
    created.start();
    return () => {
      void created.end();
    };
  }, [threadKey]);

  const state = useSyncExternalStore(
    session?.subscribe ?? noopSubscribe,
    session?.getState ?? getInitialState,
  );

  return { session, state };
}
