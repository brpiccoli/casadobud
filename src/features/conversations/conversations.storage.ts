import type { StaffConversation } from './conversations.types';

const CONVERSATIONS_STORAGE_PREFIX = 'casadobud:conversations:';
const CONVERSATIONS_STORAGE_VERSION = 1;

export interface StoredConversations {
  version: typeof CONVERSATIONS_STORAGE_VERSION;
  items: StaffConversation[];
  deletedIds: string[];
}

function storageKey(userId: string): string {
  return `${CONVERSATIONS_STORAGE_PREFIX}${userId}`;
}

function emptyStoredConversations(): StoredConversations {
  return { version: CONVERSATIONS_STORAGE_VERSION, items: [], deletedIds: [] };
}

function isStoredConversations(value: unknown): value is StoredConversations {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<StoredConversations>;
  return (
    candidate.version === CONVERSATIONS_STORAGE_VERSION &&
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.deletedIds)
  );
}

export function readStoredConversations(
  userId: string,
  storage: Storage = window.localStorage,
): StoredConversations {
  try {
    const raw = storage.getItem(storageKey(userId));
    if (!raw) return emptyStoredConversations();
    const parsed: unknown = JSON.parse(raw);
    return isStoredConversations(parsed) ? parsed : emptyStoredConversations();
  } catch {
    return emptyStoredConversations();
  }
}

export function writeStoredConversations(
  userId: string,
  data: StoredConversations,
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    return;
  }
}
