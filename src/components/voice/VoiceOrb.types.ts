export type VoiceOrbSize = 'lg' | 'sm';

export type VoiceOrbState = 'listening' | 'user' | 'speaking' | 'thinking' | 'muted';

export interface VoiceOrbProps {
  size: VoiceOrbSize;
  state: VoiceOrbState;
  label: string;
  className?: string;
}
