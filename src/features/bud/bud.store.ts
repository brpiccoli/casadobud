import type {
  BudChatMessage,
  BudState,
  BudThread,
  GraphDraft,
  GraphDraftSource,
  GraphDraftStatus,
} from './bud.engine.types';
import type { GraphSpec, PendingConfirmation } from './bud.types';
import { describeVersion } from './graphSpec.utils';

type Listener = () => void;

export interface BudStore {
  getState: () => BudState;
  subscribe: (listener: Listener) => () => void;
  createDraft: (spec: GraphSpec, source: GraphDraftSource) => GraphDraft;
  addDraftVersion: (graphId: string, spec: GraphSpec) => void;
  replaceActiveVersion: (graphId: string, spec: GraphSpec) => void;
  setActiveVersion: (graphId: string, index: number) => void;
  renameDraft: (graphId: string, title: string) => void;
  setDraftStatus: (
    graphId: string,
    status: GraphDraftStatus,
    dashboardChartId?: string | null,
  ) => void;
  getThread: (threadKey: string) => BudThread;
  appendMessage: (threadKey: string, message: BudChatMessage) => void;
  updateMessage: (threadKey: string, messageId: string, patch: Partial<BudChatMessage>) => void;
  updateThread: (threadKey: string, patch: Partial<Omit<BudThread, 'messages'>>) => void;
  replaceThread: (threadKey: string, thread: BudThread) => void;
  removeThread: (threadKey: string) => void;
}

export const EMPTY_THREAD: BudThread = {
  messages: [],
  transcript: [],
  focusGraphId: null,
  pendingConfirmation: null,
};

export function getActiveSpec(draft: GraphDraft | undefined): GraphSpec | null {
  if (!draft) return null;
  return draft.versions[draft.activeIndex] ?? null;
}

export function createBudStore(initialState: BudState = { drafts: {}, threads: {} }): BudStore {
  let state = initialState;
  const listeners = new Set<Listener>();

  const setState = (updater: (current: BudState) => BudState) => {
    state = updater(state);
    listeners.forEach((listener) => listener());
  };

  const updateDraft = (graphId: string, updater: (draft: GraphDraft) => GraphDraft) => {
    setState((current) => {
      const draft = current.drafts[graphId];
      if (!draft) return current;
      return { ...current, drafts: { ...current.drafts, [graphId]: updater(draft) } };
    });
  };

  const updateThreadState = (threadKey: string, updater: (thread: BudThread) => BudThread) => {
    setState((current) => ({
      ...current,
      threads: {
        ...current.threads,
        [threadKey]: updater(current.threads[threadKey] ?? EMPTY_THREAD),
      },
    }));
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    createDraft: (spec, source) => {
      const draft: GraphDraft = {
        id: spec.id,
        versions: [spec],
        versionLabels: [describeVersion(null, spec)],
        activeIndex: 0,
        titleLocked: false,
        status: 'draft',
        source,
        dashboardChartId: null,
      };
      setState((current) => ({ ...current, drafts: { ...current.drafts, [spec.id]: draft } }));
      return draft;
    },
    addDraftVersion: (graphId, spec) =>
      updateDraft(graphId, (draft) => ({
        ...draft,
        versions: [...draft.versions, spec],
        versionLabels: [
          ...draft.versionLabels,
          describeVersion(draft.versions[draft.activeIndex] ?? null, spec),
        ],
        activeIndex: draft.versions.length,
      })),
    replaceActiveVersion: (graphId, spec) =>
      updateDraft(graphId, (draft) => ({
        ...draft,
        versions: draft.versions.map((version, index) =>
          index === draft.activeIndex ? spec : version,
        ),
      })),
    setActiveVersion: (graphId, index) =>
      updateDraft(graphId, (draft) => {
        if (index < 0 || index >= draft.versions.length) return draft;
        return { ...draft, activeIndex: index };
      }),
    renameDraft: (graphId, title) =>
      updateDraft(graphId, (draft) => ({
        ...draft,
        titleLocked: true,
        versions: draft.versions.map((version) => ({ ...version, titulo: title })),
      })),
    setDraftStatus: (graphId, status, dashboardChartId) =>
      updateDraft(graphId, (draft) => ({
        ...draft,
        status,
        dashboardChartId:
          dashboardChartId === undefined ? draft.dashboardChartId : dashboardChartId,
      })),
    getThread: (threadKey) => state.threads[threadKey] ?? EMPTY_THREAD,
    appendMessage: (threadKey, message) =>
      updateThreadState(threadKey, (thread) => ({
        ...thread,
        messages: [...thread.messages, message],
      })),
    updateMessage: (threadKey, messageId, patch) =>
      updateThreadState(threadKey, (thread) => ({
        ...thread,
        messages: thread.messages.map((message) =>
          message.id === messageId ? { ...message, ...patch } : message,
        ),
      })),
    updateThread: (threadKey, patch) =>
      updateThreadState(threadKey, (thread) => ({ ...thread, ...patch })),
    replaceThread: (threadKey, thread) =>
      setState((current) => ({
        ...current,
        threads: { ...current.threads, [threadKey]: thread },
      })),
    removeThread: (threadKey) =>
      setState((current) => {
        if (!current.threads[threadKey]) return current;
        const { [threadKey]: _removed, ...threads } = current.threads;
        return { ...current, threads };
      }),
  };
}

export function buildPendingConfirmation(graphId: string): PendingConfirmation {
  return { acao: 'salvar_grafico', grafico_id: graphId };
}
