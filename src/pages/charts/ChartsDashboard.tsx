import { useState } from 'react';
import { Calendar, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { ChartCard } from '@/components/charts/ChartCard';
import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import { DeleteChartDialog } from '@/components/charts/DeleteChartDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { COMING_SOON_MESSAGE } from '@/constants/feedback';
import {
  DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_DASHBOARD_PERIOD,
} from '@/features/charts/charts.constants';
import type { DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';
import {
  duplicateChart,
  insertAfter,
  removeChart,
  restoreChart,
} from '@/features/charts/charts.utils';
import {
  useDashboardChartsQuery,
  useSetDashboardChartsCache,
} from '@/hooks/useDashboardChartsQuery';
import { cn } from '@/lib/utils';

import { chartGridItemVariants, chartsDashboardStyles as styles } from './ChartsDashboard.styles';

const SKELETON_KINDS: DashboardChart['kind'][] = ['line', 'kpi', 'kpi', 'bar', 'donut', 'area'];

export function ChartsDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>(DEFAULT_DASHBOARD_PERIOD);
  const [chartPendingDelete, setChartPendingDelete] = useState<DashboardChart | null>(null);
  const { data: charts = [], isPending } = useDashboardChartsQuery(period);
  const setCharts = useSetDashboardChartsCache(period);

  const showComingSoon = () => {
    toast.info(COMING_SOON_MESSAGE);
  };

  const handleDuplicate = (chart: DashboardChart) => {
    const copy = duplicateChart(chart, crypto.randomUUID());
    setCharts((current) => insertAfter(current, chart.id, copy));
    toast.success('Gráfico duplicado');
  };

  const handleConfirmDelete = () => {
    if (!chartPendingDelete) return;

    let removedIndex = -1;
    setCharts((current) => {
      const result = removeChart(current, chartPendingDelete.id);
      removedIndex = result.index;
      return result.charts;
    });

    const removed = chartPendingDelete;
    setChartPendingDelete(null);

    toast('Gráfico excluído', {
      action: {
        label: 'Desfazer',
        onClick: () => setCharts((current) => restoreChart(current, removed, removedIndex)),
      },
    });
  };

  const handleAction = (action: ChartCardAction, chart: DashboardChart) => {
    if (action === 'duplicate') {
      handleDuplicate(chart);
      return;
    }
    if (action === 'delete') {
      setChartPendingDelete(chart);
      return;
    }
    showComingSoon();
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Gráficos</h1>
          <p className={styles.subtitle}>O retrato vivo do seu time, montado por você.</p>
        </div>

        <div className={styles.actions}>
          <Select value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
            <SelectTrigger className={styles.periodTrigger} aria-label="Período">
              <Calendar className={styles.periodIcon} aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {DASHBOARD_PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="pill" className={styles.actionButton} onClick={showComingSoon}>
            <Pencil />
            Editar layout
          </Button>
          <Button variant="cta" className={styles.actionButton} onClick={showComingSoon}>
            <Plus />
            Novo gráfico
          </Button>
        </div>
      </header>

      {isPending ? (
        <div className={styles.grid} aria-busy="true">
          {SKELETON_KINDS.map((kind, index) => (
            <Skeleton
              key={`${kind}-${index}`}
              className={cn(chartGridItemVariants({ kind }), 'rounded-2xl')}
            />
          ))}
        </div>
      ) : null}

      {!isPending && charts.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Seu dashboard está vazio</p>
          <p className={styles.emptyText}>Crie um gráfico ou peça para o Bud montar um no chat.</p>
        </div>
      ) : null}

      {!isPending && charts.length > 0 ? (
        <div className={styles.grid}>
          {charts.map((chart) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              onAction={handleAction}
              className={chartGridItemVariants({ kind: chart.kind })}
            />
          ))}
        </div>
      ) : null}

      <DeleteChartDialog
        chartTitle={chartPendingDelete?.title ?? null}
        onCancel={() => setChartPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
