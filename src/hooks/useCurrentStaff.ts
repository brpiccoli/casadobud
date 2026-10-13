import { useMemo } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  getInitials,
  resolveDisplayName,
  resolveRoleLabel,
} from '@/features/profile/profile.utils';
import { useStaffProfileQuery } from '@/hooks/useStaffProfileQuery';

export function useCurrentStaff() {
  const { user } = useAuth();
  const profileQuery = useStaffProfileQuery();
  const profile = profileQuery.data;

  return useMemo(() => {
    const displayName = resolveDisplayName(profile, user?.email);
    return {
      profile,
      email: profile?.email ?? user?.email ?? '',
      displayName,
      roleLabel: resolveRoleLabel(profile),
      initials: getInitials(displayName),
      avatarUrl: profile?.avatar_url ?? null,
      isLoading: profileQuery.isPending,
    };
  }, [profile, profileQuery.isPending, user?.email]);
}
