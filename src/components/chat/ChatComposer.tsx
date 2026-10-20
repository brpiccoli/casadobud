import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, AudioLines, Mic } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MediaQuery } from '@/constants/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { ChatAttachmentChip } from './ChatAttachmentChip';
import { ChatAttachmentMenu } from './ChatAttachmentMenu';
import { chatComposerStyles as styles } from './ChatComposer.styles';
import type { ChatComposerProps } from './ChatComposer.types';

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  attachments = [],
  onAddAttachments,
  onRemoveAttachment,
  onDictate,
  onStartVoice,
  placeholder = 'Envie uma mensagem',
  compactPlaceholder = 'Mensagem',
  disabled = false,
  submitBlocked = false,
  textareaRef,
  layout = 'page',
}: ChatComposerProps) {
  const [focused, setFocused] = useState(false);
  const isCompact = useMediaQuery(MediaQuery.compact);
  const isRail = layout === 'rail';
  const canSubmit = value.trim().length > 0 && !disabled && !submitBlocked;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(value.trim());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      {attachments.length > 0 ? (
        <ul className={styles.attachments} aria-label="Anexos">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <ChatAttachmentChip
                attachment={attachment}
                onRemove={onRemoveAttachment ? () => onRemoveAttachment(attachment.id) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.row}>
        <div className={isRail ? styles.pillRail : styles.pill} data-focused={focused}>
          <ChatAttachmentMenu onAdd={(added) => onAddAttachments?.(added)} disabled={disabled} />
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isRail ? placeholder : isCompact ? compactPlaceholder : placeholder}
            aria-label="Mensagem para o Bud"
            className={styles.textarea}
            disabled={disabled}
          />
          {isRail ? null : (
            <Button
              type="button"
              variant="quiet"
              size="icon-sm"
              className={styles.iconButton}
              onClick={onDictate}
              disabled={disabled}
              aria-label="Ditar mensagem"
            >
              <Mic />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            className={cn(styles.sendButton, isRail && 'size-9')}
            disabled={!canSubmit}
            aria-label="Enviar mensagem"
          >
            <ArrowUp />
          </Button>
        </div>
        {isRail ? null : (
          <Button
            type="button"
            size="icon"
            className={styles.voiceButton}
            onClick={onStartVoice}
            aria-label="Conversar por voz com o Bud"
          >
            <AudioLines className="size-5" />
          </Button>
        )}
      </div>
    </form>
  );
}
