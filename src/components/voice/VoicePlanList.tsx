import { Circle, CircleCheck, LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { voicePlanListStyles as styles } from './VoicePlanList.styles';
import type { VoicePlanListProps, VoicePlanRowProps } from './VoicePlanList.types';

function PlanIcon({ step }: VoicePlanRowProps) {
  if (step.status === 'done') {
    return <CircleCheck className={cn(styles.icon, styles.done)} aria-hidden />;
  }
  if (step.status === 'active') {
    return <LoaderCircle className={cn(styles.icon, styles.active)} aria-hidden />;
  }
  return <Circle className={cn(styles.icon, styles.pending)} aria-hidden />;
}

function PlanRow({ step }: VoicePlanRowProps) {
  return (
    <li className={styles.row}>
      <PlanIcon step={step} />
      <span className={step.status === 'pending' ? styles.labelPending : styles.label}>
        {step.label}
      </span>
    </li>
  );
}

export function VoicePlanList({ steps }: VoicePlanListProps) {
  if (steps.length === 0) return null;

  return (
    <ol className={styles.root} aria-label="Plano do Bud">
      {steps.map((step) => (
        <PlanRow key={step.id} step={step} />
      ))}
    </ol>
  );
}
