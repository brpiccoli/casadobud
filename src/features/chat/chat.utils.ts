import { METRIC_DEFINITIONS } from '@/features/bud/bud.constants';
import type { BudChatMessage, BudThread, GraphDraft } from '@/features/bud/bud.engine.types';
import { getActiveSpec } from '@/features/bud/bud.store';
import type { BudHistoryMessage, GraphSpec } from '@/features/bud/bud.types';
import type { StaffConversation } from '@/features/conversations/conversations.types';

import { CHAT_PREVIEW_MAX_LENGTH, CHAT_TITLE_MAX_LENGTH } from './chat.constants';
import type { ChatAttachment, ChatHistoryMessage, ConversationGraphItem } from './chat.types';

const WHITESPACE_PATTERN = /\s+/g;
const PARAGRAPH_BREAK_PATTERN = /\n{2,}/;
const TRAILING_PUNCTUATION_PATTERN = /[\s.,;:!?]+$/;

function collapseWhitespace(text: string): string {
  return text.replace(WHITESPACE_PATTERN, ' ').trim();
}

function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(TRAILING_PUNCTUATION_PATTERN, '')}…`;
}

export function buildConversationTitle(message: string): string {
  const text = collapseWhitespace(message).replace(TRAILING_PUNCTUATION_PATTERN, '');
  if (!text) return 'Nova conversa';
  const title = truncateAtWord(text, CHAT_TITLE_MAX_LENGTH);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function buildConversationPreview(reply: string): string {
  return truncateAtWord(collapseWhitespace(reply), CHAT_PREVIEW_MAX_LENGTH);
}

export function splitMessageParagraphs(text: string): string[] {
  return text
    .split(PARAGRAPH_BREAK_PATTERN)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function buildEngineMessage(text: string, attachments: ChatAttachment[]): string {
  const metrics = attachments.flatMap((attachment) =>
    attachment.metric ? [METRIC_DEFINITIONS[attachment.metric].label.toLowerCase()] : [],
  );
  if (metrics.length === 0) return text;
  return `${text}\n\n(dados do companion: ${metrics.join(', ')})`;
}

export function buildChatHistory(messages: ChatHistoryMessage[]): BudHistoryMessage[] {
  return messages
    .filter((message) => message.status === 'done' && message.text.trim().length > 0)
    .map((message) => ({
      papel: message.role === 'user' ? 'usuario' : 'bud',
      texto: message.text,
    }));
}

export function isThreadStreaming(messages: Pick<BudChatMessage, 'status'>[]): boolean {
  return messages.some((message) => message.status === 'streaming');
}

export function collectConversationGraphIds(
  messages: Pick<BudChatMessage, 'graphIds' | 'redirectGraphId'>[],
): string[] {
  const ids = messages.flatMap((message) => [
    ...message.graphIds,
    ...(message.redirectGraphId ? [message.redirectGraphId] : []),
  ]);
  return [...new Set(ids)];
}

export function resolveGraphSpec(
  drafts: Record<string, GraphDraft>,
  graphId: string,
  versionIndex?: number,
): GraphSpec | null {
  const draft = drafts[graphId];
  if (!draft || draft.status === 'discarded') return null;
  if (versionIndex === undefined) return getActiveSpec(draft);
  return draft.versions[versionIndex] ?? getActiveSpec(draft);
}

export function listConversationGraphs(
  messages: Pick<BudChatMessage, 'graphIds' | 'redirectGraphId'>[],
  drafts: Record<string, GraphDraft>,
): ConversationGraphItem[] {
  return collectConversationGraphIds(messages).flatMap((id) => {
    const spec = resolveGraphSpec(drafts, id);
    return spec ? [{ id, title: spec.titulo }] : [];
  });
}

export function buildStaffConversationFromThread(
  id: string,
  thread: BudThread,
  previous?: StaffConversation,
  now: Date = new Date(),
): StaffConversation {
  const firstUser = thread.messages.find((message) => message.role === 'user');
  const lastMessage = thread.messages.at(-1);

  return {
    id,
    title:
      previous?.title ||
      (firstUser?.text ? buildConversationTitle(firstUser.text) : 'Nova conversa'),
    preview: lastMessage?.text
      ? buildConversationPreview(lastMessage.text)
      : (previous?.preview ?? ''),
    updatedAt: now.toISOString(),
  };
}

export function appendTranscript(draft: string, transcript: string): string {
  const base = draft.trimEnd();
  const addition = transcript.trim();
  if (!addition) return draft;
  if (!base) return addition;
  return `${base} ${addition}`;
}
