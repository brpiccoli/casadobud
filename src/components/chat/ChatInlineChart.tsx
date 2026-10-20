import { ArrowDown, ArrowUp, ChartColumn } from 'lucide-react';

import { ChartCardFrame } from '@/components/charts/ChartCardFrame';
import { ChartCardMenu } from '@/components/charts/ChartCardMenu';
import { chartCardStyles, kpiTrendVariants } from '@/components/charts/ChartCard.styles';
import { ChartVisual } from '@/components/charts/ChartVisual';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { CHAT_GRAPH_TAG, CHAT_OPEN_IN_CHARTS } from '@/features/chat/chat.constants';
import { cn } from '@/lib/utils';

import { chatInlineChartStyles as styles } from './ChatInlineChart.styles';
import type { ChatInlineChartProps } from './ChatInlineChart.types';

export function ChatInlineChart({ chart, onOpen, onAction }: ChatInlineChartProps) {
  const menu = <ChartCardMenu chartTitle={chart.title} onAction={onAction} />;
  const footer = (
    <>
      <Button variant="accent" size="sm" onClick={onOpen}>
        <ChartColumn />
        {CHAT_OPEN_IN_CHARTS}
      </Button>
      <p className={styles.notice}>{chart.footer}</p>
    </>
  );

  if (chart.kind === 'kpi') {
    const TrendIcon = chart.trend === 'down' ? ArrowDown : ArrowUp;

    return (
      <ChartCardFrame
        className={styles.kpiCard}
        title={chart.title}
        tag={<Tag>{CHAT_GRAPH_TAG}</Tag>}
        menu={menu}
        footer={footer}
        footerClassName={styles.footer}
      >
        <p className={chartCardStyles.kpiValue}>{chart.value}</p>
        <p className={cn(chartCardStyles.kpiCaption, kpiTrendVariants({ trend: chart.trend }))}>
          {chart.trend === 'flat' ? null : <TrendIcon className="size-3.5" aria-hidden />}
          {chart.caption}
        </p>
      </ChartCardFrame>
    );
  }

  return (
    <ChartCardFrame
      className={styles.card}
      bodyClassName={styles.body}
      title={chart.title}
      tag={<Tag>{CHAT_GRAPH_TAG}</Tag>}
      menu={menu}
      footer={footer}
      footerClassName={styles.footer}
    >
      <ChartVisual chart={chart} />
    </ChartCardFrame>
  );
}
