import type { ReactNode } from 'react';

import type { DashboardChart } from '@/features/charts/charts.types';

export type ChartCardAction = 'rename' | 'duplicate' | 'expand' | 'delete';

export interface ChartCardProps {
  chart: DashboardChart;
  onAction: (action: ChartCardAction, chart: DashboardChart) => void;
  className?: string;
}

export interface ChartCardMenuProps {
  chartTitle: string;
  onAction: (action: ChartCardAction) => void;
}

export interface ChartCardFrameProps {
  header: ReactNode;
  footer?: string;
  children: ReactNode;
  className?: string;
}

export interface DeleteChartDialogProps {
  chartTitle: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}
