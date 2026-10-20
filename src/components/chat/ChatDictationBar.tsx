import { ArrowUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDictationTime } from '@/features/chat/dictation.utils';
import { cn } from '@/lib/utils';

import { chatDictationBarStyles as styles, DICTATION_BAR_HEIGHTS } from './ChatDictationBar.styles';
import type { ChatDictationBarProps, DictationWaveformProps } from './ChatDictationBar.types';

function barHeightClass(level: number): string {
  const index = Math.round(level * (DICTATION_BAR_HEIGHTS.length - 1));
  return DICTATION_BAR_HEIGHTS[Math.min(Math.max(index, 0), DICTATION_BAR_HEIGHTS.length - 1)];
}

function DictationWaveform({ levels }: DictationWaveformProps) {
  return (
    <div className={styles.waveform} aria-hidden>
      {levels.map((level, index) =>
        level === null ? (
          <span key={index} className={styles.dot} />
        ) : (
          <span key={index} className={cn(styles.bar, barHeightClass(level))} />
        ),
      )}
    </div>
  );
}

export function ChatDictationBar({
  levels,
  elapsedMs,
  busy = false,
  onCancel,
  onConfirm,
  onSend,
}: ChatDictationBarProps) {
  const time = formatDictationTime(elapsedMs);

  return (
    <div className={styles.root} role="group" aria-label="Ditado por voz">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={styles.roundButton}
        onClick={onCancel}
        aria-label="Cancelar ditado"
      >
        <X />
      </Button>
      <DictationWaveform levels={levels} />
      <span className={styles.timer} role="timer" aria-label={`Gravando há ${time}`}>
        {time}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={styles.roundButton}
        onClick={onConfirm}
        disabled={busy}
        aria-label="Parar e transcrever no campo de mensagem"
      >
        <span className={styles.stopSquare} />
      </Button>
      <Button
        type="button"
        size="icon"
        className={styles.sendButton}
        onClick={onSend}
        disabled={busy}
        aria-label="Transcrever e enviar"
      >
        <ArrowUp />
      </Button>
    </div>
  );
}
