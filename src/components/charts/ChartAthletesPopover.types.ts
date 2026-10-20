import type { ReactNode } from 'react';

import type { Athlete, GraphAthletes } from '@/features/bud/bud.types';

export interface ChartAthletesPopoverProps {
  atletas: GraphAthletes;
  roster: Athlete[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (atletas: GraphAthletes) => void;
  trigger: ReactNode;
}
