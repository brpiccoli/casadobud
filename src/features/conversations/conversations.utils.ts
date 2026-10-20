import { differenceInCalendarDays, isSameDay } from 'date-fns';

import type { StoredConversations } from './conversations.storage';
import type {
  ConversationGroup,
  ConversationGroupKey,
  SearchExcerpt,
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

interface NormalizedText {
  value: string;
  sourceIndexes: number[];
}

function normalizeWithIndexMap(text: string): NormalizedText {
  let value = '';
  const sourceIndexes: number[] = [];

  Array.from(text).reduce((sourceIndex, char) => {
    const normalized = char
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    Array.from(normalized).forEach((normalizedChar) => {
      value += normalizedChar;
      sourceIndexes.push(sourceIndex);
    });
    return sourceIndex + char.length;
  }, 0);

  return { value, sourceIndexes };
}

const EXCERPT_ELLIPSIS = '...';

function findExcerptStart(text: string, matchStart: number, leadChars: number): number {
  if (matchStart <= leadChars) return 0;

  const wordBreak = text.lastIndexOf(' ', matchStart - leadChars);
  if (wordBreak === -1) return 0;
  return wordBreak + 1;
}

export function buildSearchExcerpt(
  text: string,
  query: string,
  leadChars = 24,
): SearchExcerpt | null {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  const { value, sourceIndexes } = normalizeWithIndexMap(text);
  const normalizedStart = value.indexOf(normalizedQuery);
  if (normalizedStart === -1) return null;

  const matchStart = sourceIndexes[normalizedStart];
  const lastMatchedIndex = sourceIndexes[normalizedStart + normalizedQuery.length - 1];
  const matchEnd = lastMatchedIndex + Array.from(text.slice(lastMatchedIndex))[0].length;

  const excerptStart = findExcerptStart(text, matchStart, leadChars);
  const leadingEllipsis = excerptStart > 0 ? EXCERPT_ELLIPSIS : '';

  return {
    before: `${leadingEllipsis}${text.slice(excerptStart, matchStart)}`,
    match: text.slice(matchStart, matchEnd),
    after: text.slice(matchEnd),
  };
}

export function mergeStoredConversations(
  base: StaffConversation[],
  stored: StoredConversations,
): StaffConversation[] {
  const deleted = new Set(stored.deletedIds);
  const storedIds = new Set(stored.items.map((conversation) => conversation.id));
  return [
    ...stored.items.filter((conversation) => !deleted.has(conversation.id)),
    ...base.filter((conversation) => !deleted.has(conversation.id) && !storedIds.has(conversation.id)),
  ];
}

export function upsertConversation(
  conversations: StaffConversation[],
  conversation: StaffConversation,
): StaffConversation[] {
  return [conversation, ...conversations.filter((item) => item.id !== conversation.id)];
}

export function removeConversation(
  conversations: StaffConversation[],
  conversationId: string,
): StaffConversation[] {
  return conversations.filter((conversation) => conversation.id !== conversationId);
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
