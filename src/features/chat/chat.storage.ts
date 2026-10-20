import type { BudState, BudThread } from '@/features/bud/bud.engine.types';

const CHAT_STORAGE_PREFIX = 'casadobud:chat:';
const CHAT_STORAGE_VERSION = 1;

interface PersistedChatState {
  version: typeof CHAT_STORAGE_VERSION;
  bud: BudState;
}

function storageKey(userId: string): string {
  return `${CHAT_STORAGE_PREFIX}${userId}`;
}

function isPersistedChatState(value: unknown): value is PersistedChatState {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<PersistedChatState>;
  return (
    candidate.version === CHAT_STORAGE_VERSION &&
    typeof candidate.bud?.drafts === 'object' &&
    typeof candidate.bud?.threads === 'object'
  );
}

function settleThread(thread: BudThread): BudThread {
  return {
    ...thread,
    messages: thread.messages.map((message) =>
      message.status === 'streaming' ? { ...message, status: 'done' } : message,
    ),
  };
}

export function settleInterruptedMessages(state: BudState): BudState {
  const threads = Object.fromEntries(
    Object.entries(state.threads).map(([key, thread]) => [key, settleThread(thread)]),
  );
  return { ...state, threads };
}

export function readChatState(userId: string, storage: Storage = window.localStorage): BudState {
  const empty: BudState = { drafts: {}, threads: {} };
  try {
    const raw = storage.getItem(storageKey(userId));
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedChatState(parsed)) return empty;
    return settleInterruptedMessages(parsed.bud);
  } catch {
    return empty;
  }
}

export function writeChatState(
  userId: string,
  state: BudState,
  storage: Storage = window.localStorage,
): void {
  const payload: PersistedChatState = { version: CHAT_STORAGE_VERSION, bud: state };
  try {
    storage.setItem(storageKey(userId), JSON.stringify(payload));
  } catch {
    return;
  }
}
