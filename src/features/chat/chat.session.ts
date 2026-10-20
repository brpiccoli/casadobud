import { buildAthleteRosterMock } from '@/features/bud/bud.mocks';
import { createBudStore, type BudStore } from '@/features/bud/bud.store';
import { createBudToolExecutor, type BudGraphActions } from '@/features/bud/bud.tools';
import type { BudBrain, GraphDraftSource } from '@/features/bud/bud.engine.types';
import type { Athlete, GraphSpec } from '@/features/bud/bud.types';
import { createLocalBudBrain } from '@/features/bud/localBrain';
import { fetchMetricSeries } from '@/features/bud/metrics.service';

import { readChatState, writeChatState } from './chat.storage';

const PERSIST_DEBOUNCE_MS = 250;

export interface ChatSessionDeps {
  saveToDashboard: (spec: GraphSpec) => Promise<string>;
  createId?: () => string;
  storage?: Storage;
}

export interface ChatSession {
  userId: string;
  store: BudStore;
  brain: BudBrain;
  roster: Athlete[];
  createId: () => string;
  executorFor: (threadKey: string, source?: GraphDraftSource) => BudGraphActions;
  flush: () => void;
}

export function createChatSession(userId: string, deps: ChatSessionDeps): ChatSession {
  const storage = deps.storage ?? window.localStorage;
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const roster = buildAthleteRosterMock();
  const store = createBudStore(readChatState(userId, storage));
  const brain = createLocalBudBrain({ roster });
  const executors = new Map<string, BudGraphActions>();
  let persistTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = null;
    writeChatState(userId, store.getState(), storage);
  };

  store.subscribe(() => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(flush, PERSIST_DEBOUNCE_MS);
  });

  const executorFor = (threadKey: string, source: GraphDraftSource = 'chat') => {
    const existing = executors.get(threadKey);
    if (existing) return existing;
    const executor = createBudToolExecutor({
      store,
      threadKey,
      source,
      fetchSeries: (query) => fetchMetricSeries(query),
      saveToDashboard: deps.saveToDashboard,
      createId,
    });
    executors.set(threadKey, executor);
    return executor;
  };

  return { userId, store, brain, roster, createId, executorFor, flush };
}

const sessions = new Map<string, ChatSession>();

export function getChatSession(userId: string, deps: ChatSessionDeps): ChatSession {
  const existing = sessions.get(userId);
  if (existing) return existing;
  const session = createChatSession(userId, deps);
  sessions.set(userId, session);
  window.addEventListener('pagehide', session.flush);
  return session;
}
