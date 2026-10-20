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
  XAxis,
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

const AXIS_TICK = {
  fill: CHART_COLORS.axis,
  fontSize: 12,
} as const;

function HighlightDot({ cx, cy, index, highlightIndex }: HighlightDotProps) {
  if (index !== highlightIndex || cx === undefined || cy === undefined) {
    return <g key={`dot-${index}`} />;
  }
  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={CHART_COLORS.primary} />;
}

function Axis({ show }: { show?: boolean }) {
  if (!show) return null;
  return <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} interval={0} />;
}

function LineVisual({ chart, showAxis }: { chart: SeriesChart; showAxis?: boolean }) {
  const hasComparison = chart.points.some((point) => point.comparison !== undefined);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart.points} margin={{ top: 12, right: 8, bottom: showAxis ? 8 : 4, left: 8 }}>
        <CartesianGrid {...GRID_PROPS} />
        <Axis show={showAxis} />
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

function BarVisual({ chart, showAxis }: { chart: SeriesChart; showAxis?: boolean }) {
  const hasComparison = chart.points.some((point) => point.comparison !== undefined);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chart.points}
        margin={{ top: 12, right: 8, bottom: showAxis ? 8 : 4, left: 8 }}
        barCategoryGap={hasComparison ? '18%' : '28%'}
        barGap={4}
      >
        <CartesianGrid {...GRID_PROPS} />
        <Axis show={showAxis} />
        <YAxis hide />
        {hasComparison ? (
          <>
            <Bar
              dataKey="value"
              fill={CHART_COLORS.primary}
              radius={[4, 4, 4, 4]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="comparison"
              fill={CHART_COLORS.secondary}
              radius={[4, 4, 4, 4]}
              isAnimationActive={false}
            />
          </>
        ) : (
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
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

function AreaVisual({ chart, showAxis }: { chart: SeriesChart; showAxis?: boolean }) {
  const gradientId = useId();
  const hasComparison = chart.points.some((point) => point.comparison !== undefined);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chart.points} margin={{ top: 12, right: 8, bottom: showAxis ? 8 : 0, left: 8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Axis show={showAxis} />
        <YAxis hide domain={[0, 'dataMax + 10']} />
        {hasComparison ? (
          <Area
            type="monotone"
            dataKey="comparison"
            stroke={CHART_COLORS.secondary}
            strokeWidth={1.5}
            fill="transparent"
            isAnimationActive={false}
          />
        ) : null}
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

export function ChartVisual({ chart, showAxis = false }: ChartVisualProps) {
  if (chart.kind === 'donut') return <DonutVisual chart={chart} />;

  switch (chart.kind) {
    case 'line':
      return <LineVisual chart={chart} showAxis={showAxis} />;
    case 'bar':
      return <BarVisual chart={chart} showAxis={showAxis} />;
    case 'area':
      return <AreaVisual chart={chart} showAxis={showAxis} />;
  }
}
