import { cn } from '@/lib/utils';

import { voiceOrbBlobVariants, voiceOrbStyles as styles, voiceOrbVariants } from './VoiceOrb.styles';
import type { VoiceOrbProps } from './VoiceOrb.types';

export function VoiceOrb({ size, state, label, className }: VoiceOrbProps) {
  const blob = voiceOrbBlobVariants({ size });

  return (
    <div
      role="img"
      aria-label={label}
      data-state={state}
      className={cn(voiceOrbVariants({ size, state }), className)}
    >
      <div className={styles.surface}>
        <span className={cn(blob, styles.deep)} />
        <span className={cn(blob, styles.light)} />
        <span className={cn(blob, styles.sky)} />
      </div>
    </div>
  );
}
