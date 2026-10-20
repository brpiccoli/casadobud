import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import type { DashboardChart } from '@/features/charts/charts.types';

export interface ChatInlineChartProps {
  chart: DashboardChart;
  onOpen: () => void;
  onAction: (action: ChartCardAction) => void;
}
