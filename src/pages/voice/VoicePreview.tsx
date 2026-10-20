import { useMemo, useState } from 'react';

import { BudWordmark } from '@/components/brand/BudWordmark';
import { Chip } from '@/components/ui/chip';
import { VoiceDock } from '@/components/voice/VoiceDock';
import { VoiceStage } from '@/components/voice/VoiceStage';
import type { GraphSpec } from '@/features/bud/bud.types';
import { VOICE_COPY, VOICE_INITIAL_STATE } from '@/features/voice/voice.constants';
import { buildPlainLanguage, buildVoicePlan, completeStepsThrough } from '@/features/voice/voice.narration';
import type { VoiceSessionState, VoiceStage as VoiceStageName } from '@/features/voice/voice.types';
import { resolveVoiceHint, shouldShowDockHint } from '@/features/voice/voice.utils';

import { voicePageStyles as styles } from './Voice.styles';

const PREVIEW_SPEC: GraphSpec = {
  id: 'preview-grafico',
  titulo: 'Check-ins por dia · Sub-17',
  versao: 1,
  origem: 'chat',
  tipo: 'barras',
  metrica: 'check_ins',
  periodo: { tipo: 'ultimos_dias', dias: 7 },
  categoria: ['sub_17'],
  atletas: { modo: 'todos' },
  agrupamento: 'dia_semana',
  series: [
    {
      id: 'check-ins',
      rotulo: 'Check-ins',
      categoria: 'sub_17',
      pontos: [
        { rotulo: 'Seg', valor: 48 },
        { rotulo: 'Ter', valor: 62 },
        { rotulo: 'Qua', valor: 36 },
        { rotulo: 'Qui', valor: 74 },
        { rotulo: 'Sex', valor: 57 },
        { rotulo: 'Sáb', valor: 66 },
        { rotulo: 'Dom', valor: 50 },
      ],
      resumo: { valor: 56, variacao: 4 },
    },
  ],
};

const PREVIEW_STAGES: { id: VoiceStageName; label: string }[] = [
  { id: 'live', label: 'Ao vivo' },
  { id: 'planning', label: 'Planejando' },
  { id: 'building', label: 'Construindo' },
  { id: 'confirming', label: 'Confirmação' },
];

function previewState(stage: VoiceStageName): VoiceSessionState {
  const steps = completeStepsThrough(buildVoicePlan(PREVIEW_SPEC), stage === 'planning' ? 1 : 2);
  const planningLine = 'Entendi. Vou montar um gráfico de barras com os check-ins do Sub-17, dia a dia.';
  const insightLine = 'Já dá pra ver: quinta foi o dia mais forte do time.';

  if (stage === 'live') {
    return {
      ...VOICE_INITIAL_STATE,
      micStatus: 'listening',
      speaker: 'user',
      userText: 'Bud, cria um gráfico de check-ins por dia do Sub-17 na última semana',
    };
  }

  if (stage === 'planning') {
    return {
      ...VOICE_INITIAL_STATE,
      stage: 'planning',
      speaker: 'bud',
      micStatus: 'off',
      budText: planningLine,
      budRevealed: planningLine.length,
      steps,
      plainLanguage: buildPlainLanguage(PREVIEW_SPEC),
    };
  }

  if (stage === 'building') {
    return {
      ...VOICE_INITIAL_STATE,
      stage: 'building',
      speaker: 'bud',
      micStatus: 'off',
      budText: insightLine,
      budRevealed: insightLine.length,
      steps,
      build: { spec: PREVIEW_SPEC, revealed: 4 },
    };
  }

  return {
    ...VOICE_INITIAL_STATE,
    stage: 'confirming',
    speaker: 'bud',
    micStatus: 'off',
    budText: VOICE_COPY.confirmQuestion,
    budRevealed: VOICE_COPY.confirmQuestion.length,
    steps,
    build: { spec: PREVIEW_SPEC, revealed: 7 },
  };
}

export function VoicePreview() {
  const [stage, setStage] = useState<VoiceStageName>('live');
  const [draft, setDraft] = useState('');
  const state = useMemo(() => previewState(stage), [stage]);

  return (
    <div className={styles.root} data-theme="dark">
      <div className={styles.glowTop} aria-hidden />
      <div className={styles.glowBottom} aria-hidden />

      <div className={styles.previewSwitch}>
        {PREVIEW_STAGES.map((item) => (
          <Chip
            key={item.id}
            size="sm"
            selected={stage === item.id}
            aria-pressed={stage === item.id}
            onClick={() => setStage(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <header className={styles.header}>
        <BudWordmark size="sm" />
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          <span className={styles.badgeLabel}>{VOICE_COPY.liveBadge}</span>
        </div>
      </header>

      <main className={styles.main}>
        <VoiceStage state={state} onConfirmYes={() => setStage('live')} onConfirmAdjust={() => undefined} />
      </main>

      <footer className={styles.footer}>
        <VoiceDock
          value={draft}
          muted={false}
          placeholder={VOICE_COPY.inputPlaceholder}
          onChange={setDraft}
          onSubmit={() => setDraft('')}
          onToggleMute={() => undefined}
          onEnd={() => undefined}
        />
        {shouldShowDockHint(state.stage) ? (
          <p className={styles.hint}>{resolveVoiceHint(state)}</p>
        ) : null}
      </footer>
    </div>
  );
}
