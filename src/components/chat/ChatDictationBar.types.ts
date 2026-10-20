import type { DictationLevel } from '@/features/chat/chat.types';

export interface ChatDictationBarProps {
  levels: DictationLevel[];
  elapsedMs: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onSend: () => void;
}

export interface DictationWaveformProps {
  levels: DictationLevel[];
}
