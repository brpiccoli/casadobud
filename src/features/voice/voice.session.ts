import type { DashboardChart } from '@/features/charts/charts.types';
import { buildSessionContext } from '@/features/bud/bud.context';
import { runBudTurn } from '@/features/bud/bud.engine';
import type { BudBrain, BudChatMessage, BudTurnResult } from '@/features/bud/bud.engine.types';
import { buildPendingConfirmation, type BudStore } from '@/features/bud/bud.store';
import { createBudToolExecutor } from '@/features/bud/bud.tools';
import type {
  Athlete,
  BudToolCall,
  GraphSpec,
  MetricQuery,
  Serie,
  SessionContext,
} from '@/features/bud/bud.types';
import { fetchMetricSeries } from '@/features/bud/metrics.service';

import { VOICE_COPY, VOICE_INITIAL_STATE, VOICE_TIMING } from './voice.constants';
import {
  buildInsightLine,
  buildPlainLanguage,
  buildPlanningLine,
  buildVoicePlan,
  completeStepsThrough,
  computeRevealStepMs,
  countRevealSteps,
  findInsightRevealIndex,
  type VoiceSpecPreview,
} from './voice.narration';
import type { VoiceIO, VoicePlanStep, VoiceSessionState, VoiceTiming } from './voice.types';

export interface VoiceSessionDeps {
  io: VoiceIO;
  store: BudStore;
  brain: BudBrain;
  roster: Athlete[];
  threadKey: string;
  getUserName: () => string;
  saveToDashboard: (spec: GraphSpec) => Promise<string>;
  createId: () => string;
  getDashboardCharts?: () => DashboardChart[];
  fetchSeries?: (query: MetricQuery) => Promise<Serie[]>;
  timing?: VoiceTiming;
}

export interface VoiceSession {
  getState: () => VoiceSessionState;
  subscribe: (listener: () => void) => () => void;
  start: () => void;
  submitText: (text: string) => Promise<void>;
  setMuted: (muted: boolean) => void;
  end: () => Promise<void>;
}

const GRAPH_TOOLS: ReadonlySet<BudToolCall['nome']> = new Set(['criar_grafico', 'ajustar_grafico']);

function wait(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0 || signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done);
  });
}

function previewFromCall(call: BudToolCall, focus: GraphSpec | null): VoiceSpecPreview | null {
  if (call.nome === 'criar_grafico') return call.argumentos.spec;
  if (call.nome === 'ajustar_grafico' && focus) return { ...focus, ...call.argumentos.patch };
  return null;
}

export function createVoiceSession(deps: VoiceSessionDeps): VoiceSession {
  const { io, store, threadKey } = deps;
  const timing = deps.timing ?? VOICE_TIMING;
  const listeners = new Set<() => void>();
  let state: VoiceSessionState = {
    ...VOICE_INITIAL_STATE,
    micStatus: io.recognitionSupported ? 'off' : 'unsupported',
  };
  let stopListening: (() => void) | null = null;
  let presentation: AbortController | null = null;
  let turnQueue: Promise<void> = Promise.resolve();

  const executor = createBudToolExecutor({
    store,
    threadKey,
    source: 'voice',
    fetchSeries: deps.fetchSeries ?? ((query) => fetchMetricSeries(query)),
    saveToDashboard: deps.saveToDashboard,
    createId: deps.createId,
  });

  const setState = (patch: Partial<VoiceSessionState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  const canListen = () =>
    !state.ended &&
    !state.muted &&
    !state.thinking &&
    state.speaker !== 'bud' &&
    io.recognitionSupported &&
    state.micStatus !== 'denied';

  const pauseListening = () => {
    stopListening?.();
    stopListening = null;
    if (state.micStatus === 'listening') setState({ micStatus: 'off' });
  };

  const listen = () => {
    if (stopListening || !canListen()) return;
    stopListening = io.listen({
      onInterim: (text) => setState({ userText: text, speaker: 'user' }),
      onFinal: (text) => {
        void submitText(text);
      },
      onError: (error) => {
        pauseListening();
        if (error === 'not-allowed') setState({ micStatus: 'denied', muted: true });
      },
    });
    setState({ micStatus: 'listening' });
  };

  const say = async (text: string, signal: AbortSignal) => {
    if (!text || signal.aborted) return;
    pauseListening();
    setState({ speaker: 'bud', thinking: false, budText: text, budRevealed: 0 });
    try {
      await io.speak(text, {
        signal,
        onProgress: (charIndex) => {
          if (!signal.aborted) setState({ budRevealed: charIndex });
        },
      });
    } finally {
      if (!signal.aborted) setState({ speaker: 'idle', budRevealed: text.length });
    }
  };

  const buildContext = (): SessionContext => {
    const thread = store.getThread(threadKey);
    return buildSessionContext({
      userName: deps.getUserName(),
      screen: 'voz_ao_vivo',
      mode: 'voz_ao_vivo',
      focus: thread.focusGraphId ? executor.getActiveSpec(thread.focusGraphId) : null,
      dashboardCharts: deps.getDashboardCharts?.() ?? [],
      history: thread.messages.map((message) => ({
        papel: message.role === 'user' ? 'usuario' : 'bud',
        texto: message.text,
      })),
      pendingConfirmation: thread.pendingConfirmation,
    });
  };

  const recordTurn = (message: string, result: BudTurnResult, graphId: string | null) => {
    const base: Omit<BudChatMessage, 'id' | 'role' | 'text'> = {
      status: 'done',
      graphIds: [],
      redirectGraphId: null,
      confirmationGraphId: null,
    };
    store.appendMessage(threadKey, { ...base, id: deps.createId(), role: 'user', text: message });
    if (result.text) {
      store.appendMessage(threadKey, {
        ...base,
        id: deps.createId(),
        role: 'bud',
        text: result.text,
        graphIds: result.graphIds,
      });
    }
    store.updateThread(threadKey, {
      transcript: result.transcript,
      pendingConfirmation: graphId ? buildPendingConfirmation(graphId) : result.pendingConfirmation,
    });
  };

  const presentGraph = async (
    graphId: string,
    steps: VoicePlanStep[],
    context: SessionContext,
    signal: AbortSignal,
  ) => {
    const spec = executor.getActiveSpec(graphId);
    if (!spec || signal.aborted) return;

    setState({ stage: 'building', build: { spec, revealed: 0 } });
    const total = countRevealSteps(spec);
    const insightAt = findInsightRevealIndex(spec);
    const stepMs = computeRevealStepMs(total, timing);
    let insight: Promise<void> = Promise.resolve();

    for (let index = 0; index < total; index += 1) {
      if (signal.aborted) return;
      setState({ build: { spec, revealed: index + 1 } });
      if (index === insightAt) insight = say(buildInsightLine(spec, context.dados_modo), signal);
      await wait(stepMs, signal);
    }

    await insight;
    if (signal.aborted) return;
    setState({ stage: 'confirming', steps: completeStepsThrough(steps, 2) });
    await say(VOICE_COPY.confirmQuestion, signal);
  };

  const presentReply = async (result: BudTurnResult, signal: AbortSignal) => {
    if (result.voiceAnswer === 'salvo') {
      await say(result.text, signal);
      if (!signal.aborted) {
        setState({
          savedGraphId: result.savedGraphId,
          stage: 'live',
          steps: [],
          plainLanguage: null,
          build: null,
        });
      }
      return;
    }
    if (result.voiceAnswer === 'ajustando') {
      setState({ stage: 'adjusting' });
      await say(result.text, signal);
      return;
    }
    setState({ stage: 'live', steps: [], plainLanguage: null, build: null });
    await say(result.text, signal);
  };

  const runTurn = async (message: string, signal: AbortSignal) => {
    const thread = store.getThread(threadKey);
    const context = buildContext();
    let steps: VoicePlanStep[] = [];
    let planning: Promise<void> = Promise.resolve();
    let graphId: string | null = null;
    let result: BudTurnResult | null = null;

    const completeStep = async (index: number) => {
      if (steps.length === 0 || signal.aborted) return;
      await wait(timing.stepDwellMs, signal);
      if (signal.aborted) return;
      steps = completeStepsThrough(steps, index);
      setState({ steps });
    };

    for await (const event of runBudTurn({
      message,
      context,
      brain: deps.brain,
      executor,
      roster: deps.roster,
      transcript: thread.transcript,
    })) {
      if (event.type === 'tool_call' && GRAPH_TOOLS.has(event.call.nome) && !signal.aborted) {
        const preview = previewFromCall(event.call, context.grafico_em_foco);
        if (preview) {
          steps = buildVoicePlan(preview);
          setState({
            stage: 'planning',
            thinking: false,
            steps,
            plainLanguage: buildPlainLanguage(preview),
            build: null,
          });
          planning = say(
            buildPlanningLine(preview, event.call.nome === 'ajustar_grafico'),
            signal,
          );
        }
      }
      if (
        event.type === 'tool_result' &&
        event.outcome.ok &&
        (event.outcome.nome === 'criar_grafico' || event.outcome.nome === 'ajustar_grafico')
      ) {
        graphId = event.outcome.dados.id;
        await completeStep(0);
        await completeStep(1);
      }
      if (event.type === 'done') result = event.result;
    }

    if (!result) return;
    recordTurn(message, result, graphId);
    if (signal.aborted) return;

    await planning;
    if (graphId) await presentGraph(graphId, steps, context, signal);
    else await presentReply(result, signal);

    if (signal.aborted) return;
    setState({ thinking: false });
    listen();
  };

  const submitText = (raw: string): Promise<void> => {
    const message = raw.trim();
    if (!message || state.ended) return turnQueue;

    presentation?.abort();
    io.cancelSpeech();
    const controller = new AbortController();
    presentation = controller;
    pauseListening();
    setState({ userText: message, speaker: 'user', thinking: true });

    const run = turnQueue.then(() => runTurn(message, controller.signal));
    turnQueue = run.catch(() => undefined);
    return run;
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start: listen,
    submitText,
    setMuted: (muted) => {
      if (state.micStatus === 'denied' || state.micStatus === 'unsupported') return;
      setState({ muted });
      if (muted) pauseListening();
      else listen();
    },
    end: () => {
      presentation?.abort();
      io.cancelSpeech();
      pauseListening();
      setState({ ended: true, speaker: 'idle', thinking: false });
      return turnQueue;
    },
  };
}
