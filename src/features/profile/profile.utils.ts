import type { StaffProfile } from '@/services/profileQuery';

type ProfileIdentity = Pick<
  StaffProfile,
  'name' | 'first_name' | 'last_name' | 'occupation' | 'company_name'
>;

export function resolveDisplayName(
  profile: ProfileIdentity | null | undefined,
  fallbackEmail?: string | null,
): string {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  const name = profile?.name?.trim() || fullName;
  if (name) return name;
  if (fallbackEmail) return fallbackEmail.split('@')[0];
  return 'Você';
}

export function resolveRoleLabel(profile: ProfileIdentity | null | undefined): string {
  return [profile?.occupation, profile?.company_name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' · ');
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
