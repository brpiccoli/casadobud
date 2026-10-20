import { Check, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VOICE_COPY } from '@/features/voice/voice.constants';
import {
  isUserTurn,
  orbSizeForStage,
  quoteUtterance,
  resolveVoiceOrbState,
  resolveVoiceSpeakerLabel,
  revealedBudText,
  shouldShowListeningTitle,
} from '@/features/voice/voice.utils';
import { cn } from '@/lib/utils';

import { VoiceBuildCard } from './VoiceBuildCard';
import { VoiceOrb } from './VoiceOrb';
import { VoicePlanList } from './VoicePlanList';
import { voiceStageStyles as styles } from './VoiceStage.styles';
import type { VoiceStageProps } from './VoiceStage.types';

export function VoiceStage({ state, onConfirmYes, onConfirmAdjust }: VoiceStageProps) {
  const speakerLabel = resolveVoiceSpeakerLabel(state);
  const budLine = quoteUtterance(revealedBudText(state) || state.budText);
  const showTitle = shouldShowListeningTitle(state);
  const showUser = isUserTurn(state);
  const showBudQuote = Boolean(budLine) && !showUser && !showTitle;
  const orbState = resolveVoiceOrbState(state);
  const orbSize = orbSizeForStage(state.stage);
  const stageClass =
    state.stage === 'live'
      ? styles.stageLive
      : state.stage === 'confirming'
        ? styles.stageConfirm
        : styles.stageWork;

  return (
    <div className={cn(styles.stage, stageClass)}>
      <VoiceOrb size={orbSize} state={orbState} label={speakerLabel ?? VOICE_COPY.listeningTitle} />
      {speakerLabel && !showUser ? <p className={styles.speaker}>{speakerLabel}</p> : null}
      {showTitle ? <h1 className={styles.title}>{VOICE_COPY.listeningTitle}</h1> : null}
      {showUser ? (
        <div className={styles.userBlock}>
          <p className={styles.speaker}>{VOICE_COPY.userLabel}</p>
          <p className={styles.userBubble}>
            {quoteUtterance(state.userText)}
            {state.speaker === 'user' ? <span className={styles.caret} aria-hidden /> : null}
          </p>
        </div>
      ) : null}
      {showBudQuote ? (
        <p className={state.stage === 'building' ? styles.quoteLive : styles.quote}>{budLine}</p>
      ) : null}
      {state.stage === 'planning' ? <VoicePlanList steps={state.steps} /> : null}
      {state.plainLanguage && state.stage === 'planning' ? (
        <p className={styles.plain}>
          {state.plainLanguage.lead}
          <span className={styles.plainHighlight}>{state.plainLanguage.highlight}</span>
          {state.plainLanguage.rest}
        </p>
      ) : null}
      {state.build && (state.stage === 'building' || state.stage === 'confirming') ? (
        <VoiceBuildCard
          spec={state.build.spec}
          revealed={state.build.revealed}
          building={state.stage === 'building'}
        />
      ) : null}
      {state.stage === 'confirming' ? (
        <>
          <div className={styles.confirmActions}>
            <Button className={styles.confirmYes} onClick={onConfirmYes}>
              <Check />
              {VOICE_COPY.confirmYes}
            </Button>
            <Button variant="ghost" className={styles.confirmAdjust} onClick={onConfirmAdjust}>
              <Pencil />
              {VOICE_COPY.confirmAdjust}
            </Button>
          </div>
          <p className={styles.confirmHint}>{VOICE_COPY.confirmHint}</p>
        </>
      ) : null}
    </div>
  );
}
