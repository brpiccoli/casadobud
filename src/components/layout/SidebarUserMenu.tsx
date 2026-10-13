import { ChevronDown, CircleUser, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';

import { sidebarUserMenuStyles as styles } from './Sidebar.styles';
import type { SidebarUserMenuProps } from './Sidebar.types';

export function SidebarUserMenu({ onNavigate }: SidebarUserMenuProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isDarkMode, setPreference } = useTheme();
  const { displayName, roleLabel, initials, avatarUrl, email } = useCurrentStaff();

  const handleOpenProfile = () => {
    navigate(ROUTES.profile);
    onNavigate?.();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={styles.trigger}
        aria-label={`Menu da conta de ${displayName}`}
      >
        <Avatar className={styles.avatar}>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className={styles.avatarFallback}>{initials}</AvatarFallback>
        </Avatar>
        <span className={styles.identity}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.role}>{roleLabel || email}</span>
        </span>
        <ChevronDown className={styles.chevron} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className={styles.content}>
        <DropdownMenuItem onSelect={handleOpenProfile}>
          <CircleUser />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void setPreference(isDarkMode ? 'light' : 'dark')}>
          {isDarkMode ? <Sun /> : <Moon />}
          {isDarkMode ? 'Tema claro' : 'Tema escuro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void handleSignOut()}>
          <LogOut />
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
