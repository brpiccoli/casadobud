import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/features/charts/charts.constants';
import type { DonutChart, SeriesChart } from '@/features/charts/charts.types';

import { chartCardStyles as styles } from './ChartCard.styles';
import type { ChartVisualProps, HighlightDotProps } from './ChartVisual.types';

const GRID_PROPS = {
  stroke: CHART_COLORS.grid,
  vertical: false,
} as const;

function HighlightDot({ cx, cy, index, highlightIndex }: HighlightDotProps) {
  if (index !== highlightIndex || cx === undefined || cy === undefined) {
    return <g key={`dot-${index}`} />;
  }
  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={CHART_COLORS.primary} />;
}

function LineVisual({ chart }: { chart: SeriesChart }) {
  const hasComparison = chart.points.some((point) => point.comparison !== undefined);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart.points} margin={{ top: 12, right: 8, bottom: 4, left: 8 }}>
        <CartesianGrid {...GRID_PROPS} />
        <YAxis hide domain={['dataMin - 12', 'dataMax + 12']} />
        {hasComparison ? (
          <Line
            type="monotone"
            dataKey="comparison"
            stroke={CHART_COLORS.muted}
            strokeWidth={1.5}
            strokeDasharray="4 5"
            dot={false}
            isAnimationActive={false}
          />
        ) : null}
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={(props) => (
            <HighlightDot
              {...props}
              highlightIndex={chart.highlightIndex}
              key={`dot-${props.index}`}
            />
          )}
          activeDot={{ r: 4, fill: CHART_COLORS.primary }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarVisual({ chart }: { chart: SeriesChart }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chart.points}
        margin={{ top: 12, right: 8, bottom: 4, left: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid {...GRID_PROPS} />
        <YAxis hide />
        <Bar dataKey="value" radius={[4, 4, 4, 4]} isAnimationActive={false}>
          {chart.points.map((point, index) => (
            <Cell
              key={point.label}
              fill={
                index === chart.highlightIndex ? CHART_COLORS.primary : CHART_COLORS.inactiveBar
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AreaVisual({ chart }: { chart: SeriesChart }) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chart.points} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, 'dataMax + 10']} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DonutVisual({ chart }: { chart: DonutChart }) {
  const data = [
    { name: 'value', value: chart.percentage, fill: CHART_COLORS.primary },
    { name: 'rest', value: 100 - chart.percentage, fill: CHART_COLORS.tertiary },
  ];

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="62%"
            outerRadius="82%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={3}
            cornerRadius={8}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((segment) => (
              <Cell key={segment.name} fill={segment.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className={styles.donutCenter}>{chart.percentage}%</span>
    </>
  );
}

export function ChartVisual({ chart }: ChartVisualProps) {
  if (chart.kind === 'donut') return <DonutVisual chart={chart} />;

  switch (chart.kind) {
    case 'line':
      return <LineVisual chart={chart} />;
    case 'bar':
      return <BarVisual chart={chart} />;
    case 'area':
      return <AreaVisual chart={chart} />;
  }
}
