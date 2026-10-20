import type { VoiceOrbState } from '@/components/voice/VoiceOrb.types';
import type { BudThread } from '@/features/bud/bud.engine.types';
import { buildConversationPreview, buildConversationTitle } from '@/features/chat/chat.utils';
import type { StaffConversation } from '@/features/conversations/conversations.types';

import { VOICE_COPY } from './voice.constants';
import type { VoiceSessionState, VoiceSpeaker } from './voice.types';

export function resolveVoiceOrbState(state: VoiceSessionState): VoiceOrbState {
  if (state.muted || state.micStatus === 'denied') return 'muted';
  if (state.thinking) return 'thinking';
  if (state.speaker === 'bud') return 'speaking';
  if (state.speaker === 'user') return 'user';
  return 'listening';
}

export function resolveVoiceSpeakerLabel(state: VoiceSessionState): string | null {
  if (state.stage === 'live' && shouldShowListeningTitle(state)) return null;
  if (isUserTurn(state)) return VOICE_COPY.userLabel;
  if (state.thinking) return VOICE_COPY.budThinking;
  if (state.muted) return VOICE_COPY.micOff;
  if (state.speaker === 'bud' || state.stage !== 'live') return VOICE_COPY.budSpeaking;
  return VOICE_COPY.budListening;
}

export function shouldShowListeningTitle(state: VoiceSessionState): boolean {
  return state.stage === 'live' && !state.thinking && state.speaker !== 'bud' && !state.userText.trim();
}

export function isUserTurn(state: VoiceSessionState): boolean {
  if (state.stage !== 'live') return false;
  if (state.speaker === 'bud') return false;
  return state.speaker === 'user' || Boolean(state.userText.trim());
}

export function revealedBudText(state: Pick<VoiceSessionState, 'budText' | 'budRevealed'>): string {
  return state.budText.slice(0, state.budRevealed);
}

export function quoteUtterance(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return `“${trimmed}”`;
}

export function resolveVoiceHint(state: VoiceSessionState): string {
  if (state.micStatus === 'denied') return VOICE_COPY.deniedHint;
  if (state.micStatus === 'unsupported') return VOICE_COPY.unsupportedHint;
  if (state.muted) return VOICE_COPY.mutedHint;
  if (state.stage === 'confirming') return VOICE_COPY.confirmHint;
  if (state.stage === 'adjusting') return VOICE_COPY.adjustHint;
  return VOICE_COPY.liveHint;
}

export function shouldShowDockHint(stage: VoiceSessionState['stage']): boolean {
  return stage === 'live';
}

export function orbSizeForStage(stage: VoiceSessionState['stage']): 'lg' | 'sm' {
  return stage === 'live' ? 'lg' : 'sm';
}

export function buildVoiceStaffConversation(
  id: string,
  thread: BudThread,
  now: Date = new Date(),
): StaffConversation {
  const firstUser = thread.messages.find((message) => message.role === 'user');
  const lastMessage = thread.messages.at(-1);

  return {
    id,
    title: firstUser?.text
      ? buildConversationTitle(firstUser.text)
      : VOICE_COPY.conversationTitle,
    preview: lastMessage?.text ? buildConversationPreview(lastMessage.text) : '',
    updatedAt: now.toISOString(),
  };
}

export function isVoiceIdleSpeaker(speaker: VoiceSpeaker): boolean {
  return speaker === 'idle';
}
