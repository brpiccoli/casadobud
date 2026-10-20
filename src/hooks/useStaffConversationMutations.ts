import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import {
  deleteStaffConversation,
  saveStaffConversation,
} from '@/features/conversations/conversations.service';
import type { StaffConversation } from '@/features/conversations/conversations.types';
import {
  removeConversation,
  upsertConversation,
} from '@/features/conversations/conversations.utils';
import { queryKeys } from '@/lib/queryKeys';

export function useSaveStaffConversationMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useMutation({
    mutationFn: (conversation: StaffConversation) => saveStaffConversation(userId, conversation),
    onSuccess: (saved) => {
      queryClient.setQueryData<StaffConversation[]>(
        queryKeys.staffConversations(userId),
        (current = []) => upsertConversation(current, saved),
      );
    },
  });
}

export function useDeleteStaffConversationMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useMutation({
    mutationFn: (conversationId: string) => deleteStaffConversation(userId, conversationId),
    onSuccess: (deletedId) => {
      queryClient.setQueryData<StaffConversation[]>(
        queryKeys.staffConversations(userId),
        (current = []) => removeConversation(current, deletedId),
      );
    },
  });
}
