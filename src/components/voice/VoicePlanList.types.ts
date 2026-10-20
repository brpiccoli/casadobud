import type { VoicePlanStep } from '@/features/voice/voice.types';

export interface VoicePlanListProps {
  steps: VoicePlanStep[];
}

export interface VoicePlanRowProps {
  step: VoicePlanStep;
}
