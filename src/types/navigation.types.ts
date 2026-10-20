import type { GraphType } from '@/features/bud/bud.types';

export interface LoginLocationState {
  from?: string;
}

export interface ChartBuilderLocationState {
  conversationId?: string;
  template?: GraphType;
}

export interface ChartsLocationState {
  savedChartId?: string;
}
