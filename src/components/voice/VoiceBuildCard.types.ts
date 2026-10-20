import type { GraphSpec } from '@/features/bud/bud.types';

export interface VoiceBuildCardProps {
  spec: GraphSpec;
  revealed: number;
  building: boolean;
}
