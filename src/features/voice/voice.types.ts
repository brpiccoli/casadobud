import type { GraphSpec } from '@/features/bud/bud.types';

export type VoiceStage = 'live' | 'planning' | 'building' | 'confirming' | 'adjusting';

export type VoiceSpeaker = 'idle' | 'user' | 'bud';

export type VoiceMicStatus = 'off' | 'listening' | 'unsupported' | 'denied';

export type VoicePlanStepStatus = 'pending' | 'active' | 'done';

export interface VoicePlanStep {
  id: string;
  label: string;
  status: VoicePlanStepStatus;
}

export interface VoicePlainLanguage {
  lead: string;
  highlight: string;
  rest: string;
}

export interface VoiceBuild {
  spec: GraphSpec;
  revealed: number;
}

export interface VoiceSessionState {
  stage: VoiceStage;
  speaker: VoiceSpeaker;
  thinking: boolean;
  muted: boolean;
  micStatus: VoiceMicStatus;
  userText: string;
  budText: string;
  budRevealed: number;
  steps: VoicePlanStep[];
  plainLanguage: VoicePlainLanguage | null;
  build: VoiceBuild | null;
  savedGraphId: string | null;
  ended: boolean;
}

export type VoiceRecognitionError = 'not-allowed' | 'unsupported' | 'network' | 'unknown';

export interface VoiceListenHandlers {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: VoiceRecognitionError) => void;
}

export interface VoiceSpeakOptions {
  signal: AbortSignal;
  onProgress: (charIndex: number) => void;
}

export interface VoiceIO {
  recognitionSupported: boolean;
  listen: (handlers: VoiceListenHandlers) => () => void;
  speak: (text: string, options: VoiceSpeakOptions) => Promise<void>;
  cancelSpeech: () => void;
}

export interface VoiceTiming {
  stepDwellMs: number;
  revealTotalMs: number;
  revealStepMinMs: number;
  revealStepMaxMs: number;
  fallbackMsPerChar: number;
}
