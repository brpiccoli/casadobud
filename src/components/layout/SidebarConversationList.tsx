import { useMemo } from 'react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import {
  filterConversations,
  groupConversationsByRecency,
} from '@/features/conversations/conversations.utils';

import {
  sidebarConversationItemVariants,
  sidebarConversationStyles as styles,
} from './Sidebar.styles';
import type { SidebarConversationListProps } from './Sidebar.types';

function formatResultsCount(count: number): string {
  if (count === 1) return '1 conversa encontrada';
  return `${count} conversas encontradas`;
}

export function SidebarConversationList({
  conversations,
  searchQuery,
  activeConversationId,
  onNavigate,
}: SidebarConversationListProps) {
  const isSearching = searchQuery.trim().length > 0;

  const results = useMemo(
    () => filterConversations(conversations, searchQuery),
    [conversations, searchQuery],
  );

  const groups = useMemo(() => groupConversationsByRecency(conversations), [conversations]);

  if (isSearching) {
    return (
      <div className={styles.list}>
        <div className={styles.group}>
          <p className={styles.groupLabel}>Resultados</p>
          {results.map((conversation) => (
            <Link
              key={conversation.id}
              to={`${ROUTES.chat}/${conversation.id}`}
              onClick={onNavigate}
              className={sidebarConversationItemVariants({
                active: conversation.id === activeConversationId,
              })}
            >
              <span className="truncate">{conversation.title}</span>
              <span className={styles.preview}>{conversation.preview}</span>
            </Link>
          ))}
          <p className={styles.resultsCount} aria-live="polite">
            {formatResultsCount(results.length)}
          </p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={styles.list}>
        <p className={styles.empty}>Suas conversas com o Bud aparecem aqui.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <section key={group.key} className={styles.group} aria-label={group.label}>
          <p className={styles.groupLabel}>{group.label}</p>
          {group.conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`${ROUTES.chat}/${conversation.id}`}
              aria-current={conversation.id === activeConversationId ? 'page' : undefined}
              onClick={onNavigate}
              className={sidebarConversationItemVariants({
                active: conversation.id === activeConversationId,
              })}
            >
              <span className="truncate">{conversation.title}</span>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
