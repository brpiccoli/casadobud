import { ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/constants/routes';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';

import { sidebarUserMenuStyles as styles } from './Sidebar.styles';
import type { SidebarUserMenuProps } from './Sidebar.types';

export function SidebarUserMenu({ onNavigate }: SidebarUserMenuProps) {
  const { displayName, roleLabel, initials, avatarUrl, email } = useCurrentStaff();

  return (
    <NavLink
      to={ROUTES.profile}
      onClick={onNavigate}
      className={styles.trigger}
      aria-label={`Abrir perfil de ${displayName}`}
    >
      <Avatar>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className={styles.identity}>
        <span className={styles.name}>{displayName}</span>
        <span className={styles.role}>{roleLabel || email}</span>
      </span>
      <ChevronDown className={styles.chevron} aria-hidden />
    </NavLink>
  );
}
