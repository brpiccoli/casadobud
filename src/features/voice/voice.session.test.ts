import { createBudHarness, REFERENCE_DATE, THREAD_KEY } from '@/features/bud/bud.testUtils';
import { fetchMetricSeries } from '@/features/bud/metrics.service';

import { VOICE_COPY } from './voice.constants';
import { createVoiceSession } from './voice.session';
import type { VoiceIO, VoiceTiming } from './voice.types';

const INSTANT_TIMING: VoiceTiming = {
  stepDwellMs: 0,
  revealTotalMs: 0,
  revealStepMinMs: 0,
  revealStepMaxMs: 0,
  fallbackMsPerChar: 0,
};

function createMockVoiceIO(): VoiceIO {
  return {
    recognitionSupported: true,
    listen: () => () => undefined,
    speak: async (text, { signal, onProgress }) => {
      if (signal.aborted) return;
      onProgress(text.length);
    },
    cancelSpeech: () => undefined,
  };
}

function createTestSession() {
  const harness = createBudHarness();
  let ids = 0;
  const saved: string[] = [];
  const session = createVoiceSession({
    io: createMockVoiceIO(),
    store: harness.store,
    brain: harness.brain,
    roster: harness.roster,
    threadKey: THREAD_KEY,
    getUserName: () => 'Bruno Perna',
    createId: () => {
      ids += 1;
      return `voz-${ids}`;
    },
    fetchSeries: (query) => fetchMetricSeries(query, REFERENCE_DATE),
    saveToDashboard: async (spec) => {
      const id = `dashboard-${saved.length + 1}`;
      saved.push(spec.id);
      return id;
    },
    timing: INSTANT_TIMING,
  });
  return { harness, saved, session };
}

describe('createVoiceSession', () => {
  it('builds the chart on screen and saves it when the user says yes', async () => {
    const { harness, saved, session } = createTestSession();

    await session.submitText('cria um gráfico de check-ins por dia do sub-17');

    expect(session.getState().stage).toBe('confirming');
    expect(session.getState().build?.spec.tipo).toBe('barras');
    expect(harness.store.getThread(THREAD_KEY).messages[0]?.text).toContain('check-ins');

    await session.submitText(VOICE_COPY.confirmYes);

    expect(saved).toHaveLength(1);
    expect(session.getState().savedGraphId).toBeTruthy();
    expect(session.getState().stage).toBe('live');
  });

  it('opens the adjust path with the same phrase as the confirm button', async () => {
    const { saved, session } = createTestSession();

    await session.submitText('cria um gráfico de check-ins por dia do sub-17');
    await session.submitText(VOICE_COPY.confirmAdjust);

    expect(saved).toHaveLength(0);
    expect(session.getState().stage).toBe('adjusting');
  });
});
