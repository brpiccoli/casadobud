import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { BudWordmark } from '@/components/brand/BudWordmark';
import { VoiceDock } from '@/components/voice/VoiceDock';
import { VoiceStage } from '@/components/voice/VoiceStage';
import { chartBuilderPath, conversationPath, voicePath } from '@/constants/routes';
import { VOICE_COPY } from '@/features/voice/voice.constants';
import {
  buildVoiceStaffConversation,
  resolveVoiceHint,
  shouldShowDockHint,
} from '@/features/voice/voice.utils';
import { useChatSession } from '@/hooks/useChatSession';
import { useSaveStaffConversationMutation } from '@/hooks/useStaffConversationMutations';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import type { ChartBuilderLocationState } from '@/types/navigation.types';

import { voicePageStyles as styles } from './Voice.styles';

export function Voice() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [threadKey] = useState(() => conversationId ?? crypto.randomUUID());
  const chat = useChatSession();
  const saveConversation = useSaveStaffConversationMutation();
  const { session, state } = useVoiceSession(threadKey);
  const [draft, setDraft] = useState('');
  const leavingRef = useRef(false);
  const savedToastRef = useRef<string | null>(null);

  const persistConversation = useCallback(() => {
    const conversation = buildVoiceStaffConversation(threadKey, chat.store.getThread(threadKey));
    saveConversation.mutate(conversation);
  }, [chat.store, saveConversation, threadKey]);

  const leaveTo = useCallback(
    async (to: string, navState?: ChartBuilderLocationState) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      persistConversation();
      await session?.end();
      navigate(to, { state: navState });
    },
    [navigate, persistConversation, session],
  );

  useEffect(() => {
    if (conversationId) return;
    navigate(voicePath(threadKey), { replace: true });
  }, [conversationId, navigate, threadKey]);

  useEffect(() => {
    const persist = saveConversation.mutate;
    return chat.store.subscribe(() => {
      const thread = chat.store.getThread(threadKey);
      if (thread.messages.length === 0) return;
      persist(buildVoiceStaffConversation(threadKey, thread));
    });
  }, [chat.store, saveConversation.mutate, threadKey]);

  useEffect(() => {
    if (!state.savedGraphId || savedToastRef.current === state.savedGraphId) return;
    savedToastRef.current = state.savedGraphId;
    toast.success('Gráfico salvo no dashboard', {
      description: 'Ele aparece em Gráficos com a tag Personalizado.',
    });
  }, [state.savedGraphId]);

  useEffect(() => {
    if (state.stage !== 'adjusting' || state.speaker === 'bud' || state.thinking) return;
    const graphId = chat.store.getThread(threadKey).focusGraphId;
    if (!graphId) return;
    void leaveTo(chartBuilderPath(graphId), { conversationId: threadKey });
  }, [chat.store, leaveTo, state.speaker, state.stage, state.thinking, threadKey]);

  const handleSubmit = (text: string) => {
    setDraft('');
    void session?.submitText(text);
  };

  const muteDisabled = state.micStatus === 'denied' || state.micStatus === 'unsupported';

  return (
    <div className={styles.root} data-theme="dark">
      <div className={styles.glowTop} aria-hidden />
      <div className={styles.glowBottom} aria-hidden />

      <header className={styles.header}>
        <BudWordmark size="sm" />
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          <span className={styles.badgeLabel}>{VOICE_COPY.liveBadge}</span>
        </div>
      </header>

      <main className={styles.main}>
        <VoiceStage
          state={state}
          onConfirmYes={() => handleSubmit(VOICE_COPY.confirmYes)}
          onConfirmAdjust={() => handleSubmit(VOICE_COPY.confirmAdjust)}
        />
      </main>

      <footer className={styles.footer}>
        <VoiceDock
          value={draft}
          muted={state.muted || muteDisabled}
          muteDisabled={muteDisabled}
          placeholder={VOICE_COPY.inputPlaceholder}
          onChange={setDraft}
          onSubmit={handleSubmit}
          onToggleMute={() => session?.setMuted(!state.muted)}
          onEnd={() => void leaveTo(conversationPath(threadKey))}
        />
        {shouldShowDockHint(state.stage) ? (
          <p className={styles.hint}>{resolveVoiceHint(state)}</p>
        ) : null}
      </footer>
    </div>
  );
}
