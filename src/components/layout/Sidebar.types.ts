import type { LucideIcon } from 'lucide-react';

import type { StaffConversation } from '@/features/conversations/conversations.types';

export interface SidebarProps {
  onCollapse: () => void;
  collapseLabel?: string;
  onNavigate?: () => void;
  className?: string;
}

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarConversationListProps {
  conversations: StaffConversation[];
  searchQuery: string;
  activeConversationId?: string;
  onNavigate?: () => void;
}

export interface SidebarUserMenuProps {
  onNavigate?: () => void;
}
