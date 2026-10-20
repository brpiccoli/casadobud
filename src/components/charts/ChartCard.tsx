import { ArrowDown, ArrowUp, GripVertical, Maximize2 } from 'lucide-react';

import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import {
  CHART_ORIGIN_LABELS,
  CHART_ORIGIN_TAG_TONES,
  NEW_CHART_FOOTER,
  NEW_CHART_TAG,
} from '@/features/charts/charts.constants';
import { cn } from '@/lib/utils';

import { ChartCardFrame } from './ChartCardFrame';
import { ChartCardMenu } from './ChartCardMenu';
import { chartCardStyles as styles, kpiTrendVariants } from './ChartCard.styles';
import type { ChartCardProps } from './ChartCard.types';
import { ChartVisual } from './ChartVisual';

export function ChartCard({
  chart,
  onAction,
  className,
  editing = false,
  highlighted = false,
  selected = false,
  dragging = false,
  onSelect,
  onMovePointerDown,
  onResizePointerDown,
  showAxis = false,
}: ChartCardProps) {
  const showNew = Boolean(chart.isNew);
  const tagLabel = showNew ? NEW_CHART_TAG : CHART_ORIGIN_LABELS[chart.origin];
  const tagTone =
    showNew || chart.origin === 'custom' ? 'accent' : CHART_ORIGIN_TAG_TONES[chart.origin];
  const footer = showNew ? NEW_CHART_FOOTER : chart.footer;
  const showTag = showNew || chart.kind !== 'kpi';

  const menu = editing ? (
    <Button
      variant="quiet"
      size="icon-xs"
      className={styles.menuTrigger}
      aria-label={`Expandir ${chart.title}`}
      onClick={(event) => {
        event.stopPropagation();
        onAction('expand', chart);
      }}
    >
      <Maximize2 />
    </Button>
  ) : (
    <ChartCardMenu chartTitle={chart.title} onAction={(action) => onAction(action, chart)} />
  );

  const dragHandle = editing ? (
    <Button
      variant="quiet"
      size="icon-xs"
      className={styles.dragHandle}
      aria-label={`Mover ${chart.title}`}
      onPointerDown={onMovePointerDown}
      onClick={(event) => event.stopPropagation()}
    >
      <GripVertical />
    </Button>
  ) : null;

  const resizeHandle = editing ? (
    <button
      type="button"
      className={styles.resizeHandle}
      aria-label={`Redimensionar ${chart.title}`}
      onPointerDown={onResizePointerDown}
      onClick={(event) => event.stopPropagation()}
    />
  ) : null;

  if (chart.kind === 'kpi') {
    const TrendIcon = chart.trend === 'down' ? ArrowDown : ArrowUp;

    return (
      <ChartCardFrame
        className={className}
        title={chart.title}
        tag={showTag ? <Tag tone={tagTone}>{tagLabel}</Tag> : null}
        menu={menu}
        editing={editing}
        highlighted={highlighted}
        selected={selected}
        dragging={dragging}
        dragHandle={dragHandle}
        resizeHandle={resizeHandle}
        onSelect={onSelect}
      >
        <p className={styles.kpiValue}>{chart.value}</p>
        <p className={cn(styles.kpiCaption, kpiTrendVariants({ trend: chart.trend }))}>
          {chart.trend === 'flat' ? null : <TrendIcon className="size-3.5" aria-hidden />}
          {chart.caption}
        </p>
      </ChartCardFrame>
    );
  }

  return (
    <ChartCardFrame
      className={className}
      title={chart.title}
      menu={menu}
      footer={footer}
      editing={editing}
      highlighted={highlighted}
      selected={selected}
      dragging={dragging}
      dragHandle={dragHandle}
      resizeHandle={resizeHandle}
      onSelect={onSelect}
      tag={<Tag tone={tagTone}>{tagLabel}</Tag>}
    >
      {chart.kind !== 'donut' && chart.legend ? (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={cn(styles.legendDot, 'bg-chart-1')} aria-hidden />
            {chart.legend.value}
          </span>
          {chart.legend.comparison ? (
            <span className={styles.legendItem}>
              <span className={cn(styles.legendDot, 'bg-chart-2')} aria-hidden />
              {chart.legend.comparison}
            </span>
          ) : null}
        </div>
      ) : null}
      <ChartVisual chart={chart} showAxis={showAxis} />
    </ChartCardFrame>
  );
}
