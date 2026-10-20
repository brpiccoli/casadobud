import { EMPTY_THREAD } from '@/features/bud/bud.store';

import { VOICE_COPY, VOICE_INITIAL_STATE } from './voice.constants';
import type { VoiceSessionState } from './voice.types';
import {
  buildVoiceStaffConversation,
  isUserTurn,
  orbSizeForStage,
  quoteUtterance,
  resolveVoiceHint,
  resolveVoiceOrbState,
  resolveVoiceSpeakerLabel,
  revealedBudText,
  shouldShowDockHint,
  shouldShowListeningTitle,
} from './voice.utils';

function state(patch: Partial<VoiceSessionState> = {}): VoiceSessionState {
  return { ...VOICE_INITIAL_STATE, ...patch };
}

describe('resolveVoiceOrbState', () => {
  it('maps muted and denied to muted', () => {
    expect(resolveVoiceOrbState(state({ muted: true }))).toBe('muted');
    expect(resolveVoiceOrbState(state({ micStatus: 'denied' }))).toBe('muted');
  });

  it('maps thinking and speakers', () => {
    expect(resolveVoiceOrbState(state({ thinking: true }))).toBe('thinking');
    expect(resolveVoiceOrbState(state({ speaker: 'bud' }))).toBe('speaking');
    expect(resolveVoiceOrbState(state({ speaker: 'user' }))).toBe('user');
    expect(resolveVoiceOrbState(state({ micStatus: 'listening' }))).toBe('listening');
  });
});

describe('voice stage copy', () => {
  it('shows the listening title only on an idle live stage', () => {
    expect(shouldShowListeningTitle(state({ micStatus: 'listening' }))).toBe(true);
    expect(shouldShowListeningTitle(state({ userText: 'oi', speaker: 'user' }))).toBe(false);
    expect(resolveVoiceSpeakerLabel(state())).toBeNull();
    expect(resolveVoiceSpeakerLabel(state({ speaker: 'user', userText: 'oi' }))).toBe(
      VOICE_COPY.userLabel,
    );
    expect(resolveVoiceSpeakerLabel(state({ stage: 'planning', speaker: 'bud' }))).toBe(
      VOICE_COPY.budSpeaking,
    );
  });

  it('keeps the user bubble on live while the turn is thinking', () => {
    expect(
      isUserTurn(state({ userText: 'cria um gráfico', thinking: true, speaker: 'idle' })),
    ).toBe(true);
    expect(isUserTurn(state({ stage: 'planning', userText: 'cria um gráfico' }))).toBe(false);
  });

  it('quotes speech and slices the Bud line as it is spoken', () => {
    expect(quoteUtterance('  Entendi.  ')).toBe('“Entendi.”');
    expect(revealedBudText({ budText: 'Pronto.', budRevealed: 4 })).toBe('Pron');
  });

  it('picks orb size, dock hint and footer copy from the stage', () => {
    expect(orbSizeForStage('live')).toBe('lg');
    expect(orbSizeForStage('building')).toBe('sm');
    expect(shouldShowDockHint('live')).toBe(true);
    expect(shouldShowDockHint('confirming')).toBe(false);
    expect(resolveVoiceHint(state({ micStatus: 'denied' }))).toBe(VOICE_COPY.deniedHint);
    expect(resolveVoiceHint(state({ muted: true, micStatus: 'off' }))).toBe(VOICE_COPY.mutedHint);
    expect(resolveVoiceHint(state({ stage: 'confirming' }))).toBe(VOICE_COPY.confirmHint);
  });
});

describe('buildVoiceStaffConversation', () => {
  it('falls back to the voice title when the thread is empty', () => {
    const conversation = buildVoiceStaffConversation('voz-1', EMPTY_THREAD, new Date('2026-10-19'));
    expect(conversation).toMatchObject({
      id: 'voz-1',
      title: VOICE_COPY.conversationTitle,
      preview: '',
      updatedAt: '2026-10-19T00:00:00.000Z',
    });
  });

  it('uses the first user line as title and the last message as preview', () => {
    const conversation = buildVoiceStaffConversation('voz-2', {
      ...EMPTY_THREAD,
      messages: [
        {
          id: '1',
          role: 'user',
          text: 'Bud, cria um gráfico de check-ins por dia do Sub-17 na última semana',
          status: 'done',
          graphIds: [],
          redirectGraphId: null,
          confirmationGraphId: null,
        },
        {
          id: '2',
          role: 'bud',
          text: 'Pronto. Era isso que você tinha em mente?',
          status: 'done',
          graphIds: ['g1'],
          redirectGraphId: null,
          confirmationGraphId: null,
        },
      ],
    });

    expect(conversation.title).toBe('Bud, cria um gráfico de check-ins por dia do…');
    expect(conversation.preview).toBe('Pronto. Era isso que você tinha em mente?');
  });
});
