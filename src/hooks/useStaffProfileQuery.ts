import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchStaffProfile,
  updateStaffProfile,
  type StaffProfile,
  type StaffProfileUpdate,
} from '@/services/profileQuery';

export function useStaffProfileQuery() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: () => fetchStaffProfile(userId!),
    enabled: !!userId,
  });
}

export function useUpdateStaffProfileMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (update: StaffProfileUpdate) => {
      if (!user?.id) {
        throw new Error('Sessão inválida. Entre novamente.');
      }
      return updateStaffProfile(user.id, update);
    },
    onSuccess: (_, update) => {
      if (!user?.id) return;
      queryClient.setQueryData<StaffProfile | null>(queryKeys.profile(user.id), (current) =>
        current ? { ...current, ...update } : current,
      );
    },
  });
}
