import { useMemo } from 'react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import {
  buildSearchExcerpt,
  filterConversations,
  groupConversationsByRecency,
} from '@/features/conversations/conversations.utils';
import type { StaffConversation } from '@/features/conversations/conversations.types';

import {
  sidebarConversationItemVariants,
  sidebarConversationStyles as styles,
  sidebarSearchResultVariants,
} from './Sidebar.styles';
import type { SidebarConversationListProps, SidebarSearchResultProps } from './Sidebar.types';

function formatResultsCount(count: number): string {
  if (count === 0) return 'Nenhuma conversa encontrada';
  if (count === 1) return '1 conversa encontrada';
  return `${count} conversas encontradas`;
}

function conversationPath(conversation: StaffConversation): string {
  return `${ROUTES.chat}/${conversation.id}`;
}

function SidebarSearchResult({
  conversation,
  searchQuery,
  isActive,
  onNavigate,
}: SidebarSearchResultProps) {
  const excerpt = useMemo(
    () => buildSearchExcerpt(conversation.preview, searchQuery),
    [conversation.preview, searchQuery],
  );

  return (
    <Link
      to={conversationPath(conversation)}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
      className={sidebarSearchResultVariants({ active: isActive })}
    >
      <span className={styles.resultTitle}>{conversation.title}</span>
      <span className={styles.resultExcerpt}>
        {excerpt ? (
          <>
            {excerpt.before}
            <mark className={styles.resultHighlight}>{excerpt.match}</mark>
            {excerpt.after}
          </>
        ) : (
          conversation.preview
        )}
      </span>
    </Link>
  );
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
        <section className={styles.group} aria-label="Resultados da busca">
          <p className={styles.resultsLabel}>Resultados</p>
          {results.map((conversation) => (
            <SidebarSearchResult
              key={conversation.id}
              conversation={conversation}
              searchQuery={searchQuery}
              isActive={conversation.id === activeConversationId}
              onNavigate={onNavigate}
            />
          ))}
          <p className={styles.resultsCount} aria-live="polite">
            {formatResultsCount(results.length)}
          </p>
        </section>
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
              to={conversationPath(conversation)}
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
