import { useRef, type ChangeEvent } from 'react';
import { ChartColumn, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BUD_METRICS, METRIC_DEFINITIONS } from '@/features/bud/bud.constants';
import type { BudMetric } from '@/features/bud/bud.types';
import {
  CHAT_COMPANION_ATTACHMENT_LABEL,
  CHAT_FILE_ATTACHMENT_OPTIONS,
} from '@/features/chat/chat.constants';
import type { ChatFileAttachmentKind } from '@/features/chat/chat.types';

import { chatAttachmentMenuStyles as styles } from './ChatComposer.styles';
import type { ChatAttachmentMenuProps } from './ChatComposer.types';

export function ChatAttachmentMenu({ onAdd, disabled = false }: ChatAttachmentMenuProps) {
  const inputRefs = useRef<Partial<Record<ChatFileAttachmentKind, HTMLInputElement | null>>>({});

  const handleFiles = (kind: ChatFileAttachmentKind) => (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    onAdd(files.map((file) => ({ id: crypto.randomUUID(), kind, name: file.name })));
  };

  const handleCompanionData = (metric: BudMetric) => {
    onAdd([
      {
        id: crypto.randomUUID(),
        kind: 'companion',
        name: METRIC_DEFINITIONS[metric].label,
        metric,
      },
    ]);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="quiet"
            size="icon-sm"
            className={styles.trigger}
            aria-label="Adicionar anexo"
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          alignOffset={-12}
          sideOffset={18}
          className={styles.content}
        >
          {CHAT_FILE_ATTACHMENT_OPTIONS.map(({ kind, label, icon: Icon }) => (
            <DropdownMenuItem
              key={kind}
              className={styles.item}
              onSelect={() => inputRefs.current[kind]?.click()}
            >
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={styles.item}>
              <ChartColumn />
              {CHAT_COMPANION_ATTACHMENT_LABEL}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={styles.subContent}>
              {BUD_METRICS.map((metric) => (
                <DropdownMenuItem
                  key={metric}
                  className={styles.item}
                  onSelect={() => handleCompanionData(metric)}
                >
                  {METRIC_DEFINITIONS[metric].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {CHAT_FILE_ATTACHMENT_OPTIONS.map(({ kind, label, accept }) => (
        <input
          key={kind}
          ref={(element) => {
            inputRefs.current[kind] = element;
          }}
          type="file"
          multiple
          accept={accept || undefined}
          className={styles.hiddenInput}
          tabIndex={-1}
          aria-label={label}
          onChange={handleFiles(kind)}
        />
      ))}
    </>
  );
}
