import type { DonutChart, SeriesChart } from '@/features/charts/charts.types';

export interface ChartVisualProps {
  chart: SeriesChart | DonutChart;
}

export interface HighlightDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  highlightIndex?: number;
}
