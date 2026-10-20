import type { PointerEvent, ReactNode } from 'react';

import type { DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';

export type ChartCardAction = 'rename' | 'duplicate' | 'expand' | 'delete';

export interface ChartCardProps {
  chart: DashboardChart;
  onAction: (action: ChartCardAction, chart: DashboardChart) => void;
  className?: string;
  editing?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  dragging?: boolean;
  onSelect?: () => void;
  onMovePointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onResizePointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  showAxis?: boolean;
}

export interface ChartCardMenuProps {
  chartTitle: string;
  onAction: (action: ChartCardAction) => void;
}

export interface ChartCardFrameProps {
  title: string;
  tag?: ReactNode;
  menu?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  editing?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  dragging?: boolean;
  dragHandle?: ReactNode;
  resizeHandle?: ReactNode;
  onSelect?: () => void;
}

export interface DeleteChartDialogProps {
  chartTitle: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface RenameChartDialogProps {
  chartTitle: string | null;
  onCancel: () => void;
  onConfirm: (title: string) => void;
}

export interface ExpandChartDialogProps {
  chart: DashboardChart | null;
  onClose: () => void;
  onAction: (action: ChartCardAction, chart: DashboardChart) => void;
}

export interface DashboardPeriodSelectProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  disabled?: boolean;
}

export interface ChartGridProps {
  charts: DashboardChart[];
  editing: boolean;
  stacked: boolean;
  selectedId: string | null;
  onSelect: (chartId: string) => void;
  onAction: (action: ChartCardAction, chart: DashboardChart) => void;
  onLayoutsChange: (charts: DashboardChart[]) => void;
}

export interface ChartEditToolbarProps {
  disabled?: boolean;
  onExpand: () => void;
  onShrink: () => void;
  onDelete: () => void;
  onFinish: () => void;
}
