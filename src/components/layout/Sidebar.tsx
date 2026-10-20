import { useState, type KeyboardEvent } from 'react';
import { ChartColumn, MessageCircle, PanelLeft, Plus, Search, X } from 'lucide-react';
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

  const clearSearch = () => setSearchQuery('');

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    clearSearch();
  };

  const handleNewConversation = () => {
    clearSearch();
    navigate(ROUTES.chat);
    onNavigate?.();
  };

  return (
    <aside className={cn(styles.root, className)} aria-label="Navegação principal">
      <div className={styles.header}>
        <Button
          variant="quiet"
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
          onKeyDown={handleSearchKeyDown}
          placeholder="Buscar"
          aria-label="Buscar conversas"
          className={styles.searchInput}
        />
        {searchQuery ? (
          <Button
            variant="quiet"
            size="icon-xs"
            className={styles.clearSearchButton}
            onClick={clearSearch}
            aria-label="Limpar busca"
          >
            <X className="size-3.75" />
          </Button>
        ) : null}
      </div>

      <Button variant="quiet" className={styles.newConversation} onClick={handleNewConversation}>
        <Plus />
        Nova conversa
      </Button>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to !== ROUTES.chat && to !== ROUTES.charts}
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
