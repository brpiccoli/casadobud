import { buildStaffConversationsMock } from './conversations.mocks';
import type { StaffConversation } from './conversations.types';

// Mock até existir a tabela de conversas do staff no Supabase.
export async function fetchStaffConversations(_userId: string): Promise<StaffConversation[]> {
  return buildStaffConversationsMock();
}
