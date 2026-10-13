import { useState } from 'react';
import { ChartColumn, MessageCircle, PanelLeft, Plus, Search } from 'lucide-react';
import { NavLink, useNavigate, useParams } from 'react-router';

import { BudWordmark } from '@/components/brand/BudWordmark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTES } from '@/constants/routes';
import { useStaffConversationsQuery } from '@/hooks/useStaffConversationsQuery';
import { cn } from '@/lib/utils';

import { SidebarConversationList } from './SidebarConversationList';
import { SidebarUserMenu } from './SidebarUserMenu';
import { sidebarNavItemVariants, sidebarStyles as styles } from './Sidebar.styles';
import type { SidebarNavItem, SidebarProps } from './Sidebar.types';

const NAV_ITEMS: SidebarNavItem[] = [
  { to: ROUTES.chat, label: 'Chat', icon: MessageCircle },
  { to: ROUTES.charts, label: 'Gráficos', icon: ChartColumn },
];

export function Sidebar({
  onCollapse,
  collapseLabel = 'Recolher barra lateral',
  onNavigate,
  className,
}: SidebarProps) {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: conversations = [] } = useStaffConversationsQuery();

  const handleNewConversation = () => {
    setSearchQuery('');
    navigate(ROUTES.chat);
    onNavigate?.();
  };

  return (
    <aside className={cn(styles.root, className)} aria-label="Navegação principal">
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={styles.collapseButton}
          onClick={onCollapse}
          aria-label={collapseLabel}
        >
          <PanelLeft />
        </Button>
        <BudWordmark size="md" />
      </div>

      <div className={styles.searchWrap}>
        <Search className={styles.searchIcon} aria-hidden />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar"
          aria-label="Buscar conversas"
          className={styles.searchInput}
        />
      </div>

      <Button variant="ghost" className={styles.newConversation} onClick={handleNewConversation}>
        <Plus />
        Nova conversa
      </Button>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to !== ROUTES.chat}
            onClick={onNavigate}
            className={({ isActive }) => sidebarNavItemVariants({ active: isActive })}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <ScrollArea className={styles.scrollArea}>
        <SidebarConversationList
          conversations={conversations}
          searchQuery={searchQuery}
          activeConversationId={conversationId}
          onNavigate={onNavigate}
        />
      </ScrollArea>

      <div className={styles.footer}>
        <SidebarUserMenu onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
