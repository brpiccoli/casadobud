import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { fetchStaffConversations } from '@/features/conversations/conversations.service';
import { queryKeys } from '@/lib/queryKeys';

export function useStaffConversationsQuery() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.staffConversations(userId ?? ''),
    queryFn: () => fetchStaffConversations(userId!),
    enabled: !!userId,
  });
}
