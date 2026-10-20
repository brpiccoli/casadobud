import { buildStaffConversationsMock } from './conversations.mocks';
import { readStoredConversations, writeStoredConversations } from './conversations.storage';
import type { StaffConversation } from './conversations.types';
import {
  mergeStoredConversations,
  removeConversation,
  upsertConversation,
} from './conversations.utils';

// Mock + localStorage até existir a tabela de conversas do staff no Supabase.
export async function fetchStaffConversations(userId: string): Promise<StaffConversation[]> {
  return mergeStoredConversations(buildStaffConversationsMock(), readStoredConversations(userId));
}

export async function saveStaffConversation(
  userId: string,
  conversation: StaffConversation,
): Promise<StaffConversation> {
  const stored = readStoredConversations(userId);
  writeStoredConversations(userId, {
    ...stored,
    items: upsertConversation(stored.items, conversation),
    deletedIds: stored.deletedIds.filter((id) => id !== conversation.id),
  });
  return conversation;
}

export async function deleteStaffConversation(
  userId: string,
  conversationId: string,
): Promise<string> {
  const stored = readStoredConversations(userId);
  writeStoredConversations(userId, {
    ...stored,
    items: removeConversation(stored.items, conversationId),
    deletedIds: [...new Set([...stored.deletedIds, conversationId])],
  });
  return conversationId;
}
