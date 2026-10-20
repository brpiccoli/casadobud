import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartVisual } from '@/components/charts/ChartVisual';
import { Tag } from '@/components/ui/tag';
import { PLACEHOLDER_DATA_NOTICE } from '@/features/bud/bud.constants';
import { toDashboardChart } from '@/features/bud/graphSpec.utils';
import { CHART_COLORS, CHART_ORIGIN_LABELS } from '@/features/charts/charts.constants';
import type { SeriesChart } from '@/features/charts/charts.types';
import { VOICE_COPY } from '@/features/voice/voice.constants';
import { countRevealSteps, formatRevealProgress } from '@/features/voice/voice.narration';
import { cn } from '@/lib/utils';

import { voiceBuildCardStyles as styles } from './VoiceBuildCard.styles';
import type { VoiceBuildCardProps } from './VoiceBuildCard.types';

const GRID_PROPS = {
  stroke: CHART_COLORS.grid,
  vertical: false,
} as const;

function VoiceBarChart({ chart, revealed }: { chart: SeriesChart; revealed: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chart.points} margin={{ top: 12, right: 8, bottom: 4, left: 8 }} barCategoryGap="28%">
        <CartesianGrid {...GRID_PROPS} />
        <YAxis hide />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          interval={0}
          tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[4, 4, 4, 4]} isAnimationActive={false}>
          {chart.points.map((point, index) => {
            const isRevealed = index < revealed;
            const isHighlight = index === chart.highlightIndex;
            return (
              <Cell
                key={point.label}
                fill={
                  isRevealed
                    ? isHighlight
                      ? CHART_COLORS.primary
                      : CHART_COLORS.inactiveBar
                    : 'transparent'
                }
                stroke={isRevealed ? 'transparent' : CHART_COLORS.muted}
                strokeDasharray={isRevealed ? undefined : '5 5'}
                strokeWidth={isRevealed ? 0 : 1.5}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VoiceBuildCard({ spec, revealed, building }: VoiceBuildCardProps) {
  const chart = toDashboardChart(spec, { id: spec.id, footer: PLACEHOLDER_DATA_NOTICE });
  const total = countRevealSteps(spec);
  const progress = total === 0 ? 0 : Math.min(revealed / total, 1);

  return (
    <article className={cn(styles.root, building ? styles.building : styles.confirming)}>
      <header className={styles.header}>
        <Tag tone="accent">{building ? VOICE_COPY.buildingTag : CHART_ORIGIN_LABELS.custom}</Tag>
        <h3 className={styles.title}>{spec.titulo}</h3>
      </header>
      <div className={building ? styles.body : styles.bodyConfirming}>
        {chart.kind === 'bar' ? (
          <VoiceBarChart chart={chart} revealed={revealed} />
        ) : chart.kind === 'kpi' ? (
          revealed > 0 ? <p className={styles.kpiValue}>{chart.value}</p> : null
        ) : (
          <ChartVisual
            chart={
              chart.kind === 'donut'
                ? chart
                : { ...chart, points: chart.points.slice(0, Math.max(revealed, 1)) }
            }
          />
        )}
      </div>
      {building ? (
        <div className={styles.progress}>
          <p className={styles.progressLabel}>{VOICE_COPY.buildingProgress}</p>
          <div className={styles.progressTrack} aria-hidden>
            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          </div>
          <p className={styles.progressLabel}>{formatRevealProgress(spec, revealed)}</p>
        </div>
      ) : null}
    </article>
  );
}
