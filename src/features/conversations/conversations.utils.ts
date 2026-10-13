import { differenceInCalendarDays, isSameDay } from 'date-fns';

import type {
  ConversationGroup,
  ConversationGroupKey,
  StaffConversation,
} from './conversations.types';

const GROUP_LABELS: Record<ConversationGroupKey, string> = {
  today: 'Hoje',
  last7Days: 'Últimos 7 dias',
  last30Days: 'Últimos 30 dias',
  older: 'Anteriores',
};

const GROUP_ORDER: ConversationGroupKey[] = ['today', 'last7Days', 'last30Days', 'older'];

function resolveGroupKey(date: Date, now: Date): ConversationGroupKey {
  if (isSameDay(date, now)) return 'today';

  const daysAgo = differenceInCalendarDays(now, date);
  if (daysAgo <= 7) return 'last7Days';
  if (daysAgo <= 30) return 'last30Days';
  return 'older';
}

export function groupConversationsByRecency(
  conversations: StaffConversation[],
  now: Date = new Date(),
): ConversationGroup[] {
  const buckets = new Map<ConversationGroupKey, StaffConversation[]>();

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  sorted.forEach((conversation) => {
    const key = resolveGroupKey(new Date(conversation.updatedAt), now);
    const bucket = buckets.get(key) ?? [];
    bucket.push(conversation);
    buckets.set(key, bucket);
  });

  return GROUP_ORDER.filter((key) => buckets.has(key)).map((key) => ({
    key,
    label: GROUP_LABELS[key],
    conversations: buckets.get(key) ?? [],
  }));
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterConversations(
  conversations: StaffConversation[],
  query: string,
): StaffConversation[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return conversations;

  return conversations.filter((conversation) =>
    normalizeSearchText(`${conversation.title} ${conversation.preview}`).includes(normalizedQuery),
  );
}
