import type { Athlete, GraphSpec, GraphSpecPatch } from '@/features/bud/bud.types';

export interface ChartBuilderFiltersProps {
  spec: GraphSpec;
  roster: Athlete[];
  onPatch: (patch: GraphSpecPatch) => void;
}
