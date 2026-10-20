import { type FormEvent, type KeyboardEvent } from 'react';
import { Mic, MicOff, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { voiceDockStyles as styles } from './VoiceDock.styles';
import type { VoiceDockProps } from './VoiceDock.types';

export function VoiceDock({
  value,
  muted,
  muteDisabled = false,
  disabled = false,
  placeholder,
  onChange,
  onSubmit,
  onToggleMute,
  onEnd,
}: VoiceDockProps) {
  const submit = () => {
    const next = value.trim();
    if (!next || disabled) return;
    onSubmit(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <Plus className={styles.plus} aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className={styles.input}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="quiet"
        size="icon-sm"
        className={styles.mute}
        data-muted={muted}
        onClick={onToggleMute}
        disabled={muteDisabled}
        aria-pressed={muted}
        aria-label={muted ? 'Ligar microfone' : 'Silenciar microfone'}
      >
        {muted ? <Mic /> : <MicOff />}
      </Button>
      <Button
        type="button"
        size="icon"
        className={styles.end}
        onClick={onEnd}
        aria-label="Encerrar conversa por voz"
      >
        <X />
      </Button>
    </form>
  );
}
