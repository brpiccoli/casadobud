import { ArrowDown, ArrowUp } from 'lucide-react';

import { CHART_ORIGIN_LABELS } from '@/features/charts/charts.constants';
import { cn } from '@/lib/utils';

import { ChartCardMenu } from './ChartCardMenu';
import {
  chartCardStyles as styles,
  chartOriginTagVariants,
  kpiTrendVariants,
} from './ChartCard.styles';
import type { ChartCardFrameProps, ChartCardProps } from './ChartCard.types';
import { ChartVisual } from './ChartVisual';

function ChartCardFrame({ header, footer, children, className }: ChartCardFrameProps) {
  return (
    <article className={cn(styles.root, className)}>
      <header className={styles.header}>{header}</header>
      {children}
      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </article>
  );
}

export function ChartCard({ chart, onAction, className }: ChartCardProps) {
  const menu = (
    <ChartCardMenu chartTitle={chart.title} onAction={(action) => onAction(action, chart)} />
  );

  if (chart.kind === 'kpi') {
    const TrendIcon = chart.trend === 'down' ? ArrowDown : ArrowUp;

    return (
      <ChartCardFrame
        className={className}
        header={
          <>
            <h3 className={styles.title}>{chart.title}</h3>
            {menu}
          </>
        }
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
      footer={chart.footer}
      header={
        <>
          <span className={chartOriginTagVariants({ origin: chart.origin })}>
            {CHART_ORIGIN_LABELS[chart.origin]}
          </span>
          <h3 className={styles.title}>{chart.title}</h3>
          {menu}
        </>
      }
    >
      <div className={styles.body}>
        <ChartVisual chart={chart} />
      </div>
    </ChartCardFrame>
  );
}
