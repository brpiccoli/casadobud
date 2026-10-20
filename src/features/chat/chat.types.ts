import type { LucideIcon } from 'lucide-react';

import type { BudChatMessage, BudMessageAttachment } from '@/features/bud/bud.engine.types';
import type { BudMetric } from '@/features/bud/bud.types';

export interface ChatSuggestion {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type ChatAttachment = BudMessageAttachment & { metric?: BudMetric };

export type ChatFileAttachmentKind = Extract<ChatAttachment['kind'], 'image' | 'file'>;

export interface ChatAttachmentOption {
  kind: ChatFileAttachmentKind;
  label: string;
  icon: LucideIcon;
  accept: string;
}

export type DictationStatus = 'idle' | 'starting' | 'recording' | 'transcribing';

export type DictationStartResult = 'started' | 'unsupported' | 'denied';

export type DictationLevel = number | null;

export interface ChatGraphRef {
  graphId: string;
  versionIndex: number | undefined;
}

export interface ConversationGraphItem {
  id: string;
  title: string;
}

export type ChatHistoryMessage = Pick<BudChatMessage, 'role' | 'text' | 'status'>;
