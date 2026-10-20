import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { CHAT_ATTACHMENT_ICONS } from '@/features/chat/chat.constants';
import { cn } from '@/lib/utils';

import { chatAttachmentChipStyles as styles } from './ChatComposer.styles';
import type { ChatAttachmentChipProps } from './ChatComposer.types';

export function ChatAttachmentChip({ attachment, onRemove }: ChatAttachmentChipProps) {
  const Icon = CHAT_ATTACHMENT_ICONS[attachment.kind];

  return (
    <Chip asChild size="sm" className={cn(styles.root, onRemove && styles.removable)}>
      <span>
        <Icon aria-hidden />
        <span className={styles.name}>{attachment.name}</span>
        {onRemove ? (
          <Button
            type="button"
            variant="quiet"
            size="icon-xs"
            className={styles.remove}
            onClick={onRemove}
            aria-label={`Remover anexo ${attachment.name}`}
          >
            <X />
          </Button>
        ) : null}
      </span>
    </Chip>
  );
}
