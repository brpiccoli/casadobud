import type { VoiceSessionState } from '@/features/voice/voice.types';

export interface VoiceStageProps {
  state: VoiceSessionState;
  onConfirmYes: () => void;
  onConfirmAdjust: () => void;
}
