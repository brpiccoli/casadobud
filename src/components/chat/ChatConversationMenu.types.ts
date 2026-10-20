import type { ConversationGraphItem } from '@/features/chat/chat.types';

export interface ChatConversationMenuProps {
  title: string;
  graphs: ConversationGraphItem[];
  onRename: (title: string) => void;
  onOpenGraph: (graphId: string) => void;
  onDelete: () => void;
}
