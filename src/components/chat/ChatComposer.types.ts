import type { Ref } from 'react';

import type { BudMessageAttachment } from '@/features/bud/bud.engine.types';
import type { ChatAttachment } from '@/features/chat/chat.types';

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  attachments?: ChatAttachment[];
  onAddAttachments?: (attachments: ChatAttachment[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onDictate?: () => void;
  onStartVoice?: () => void;
  placeholder?: string;
  compactPlaceholder?: string;
  disabled?: boolean;
  submitBlocked?: boolean;
  textareaRef?: Ref<HTMLTextAreaElement>;
  layout?: 'page' | 'rail';
}

export interface ChatAttachmentMenuProps {
  onAdd: (attachments: ChatAttachment[]) => void;
  disabled?: boolean;
}

export interface ChatAttachmentChipProps {
  attachment: BudMessageAttachment;
  onRemove?: () => void;
}
