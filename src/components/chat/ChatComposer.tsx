import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, AudioLines, Mic, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MediaQuery } from '@/constants/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { chatComposerStyles as styles } from './ChatComposer.styles';
import type { ChatComposerProps } from './ChatComposer.types';

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onAttach,
  onDictate,
  onStartVoice,
  placeholder = 'Envie uma mensagem',
  compactPlaceholder = 'Mensagem',
  disabled = false,
}: ChatComposerProps) {
  const [focused, setFocused] = useState(false);
  const isCompact = useMediaQuery(MediaQuery.compact);
  const canSubmit = value.trim().length > 0 && !disabled;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <div className={styles.pill} data-focused={focused}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={styles.iconButton}
          onClick={onAttach}
          aria-label="Adicionar anexo"
        >
          <Plus />
        </Button>
        <textarea
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isCompact ? compactPlaceholder : placeholder}
          aria-label="Mensagem para o Bud"
          className={styles.textarea}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={styles.iconButton}
          onClick={onDictate}
          aria-label="Ditar mensagem"
        >
          <Mic />
        </Button>
        <Button
          type="submit"
          size="icon"
          className={styles.sendButton}
          disabled={!canSubmit}
          aria-label="Enviar mensagem"
        >
          <ArrowUp />
        </Button>
      </div>
      <Button
        type="button"
        size="icon"
        className={styles.voiceButton}
        onClick={onStartVoice}
        aria-label="Conversar por voz com o Bud"
      >
        <AudioLines className="size-5" />
      </Button>
    </form>
  );
}
