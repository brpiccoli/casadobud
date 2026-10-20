import { useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ChartEditToolbar } from '@/components/charts/ChartEditToolbar';
import { ChartGrid } from '@/components/charts/ChartGrid';
import { DashboardPeriodSelect } from '@/components/charts/DashboardPeriodSelect';
import { DeleteChartDialog } from '@/components/charts/DeleteChartDialog';
import { ExpandChartDialog } from '@/components/charts/ExpandChartDialog';
import { NewChartDialog } from '@/components/charts/NewChartDialog';
import { RenameChartDialog } from '@/components/charts/RenameChartDialog';
import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from '@/components/ui/tag';
import { ROUTES } from '@/constants/routes';
import { MediaQuery } from '@/constants/styles';
import {
  DEFAULT_CHART_LAYOUTS,
  DEFAULT_DASHBOARD_PERIOD,
  NEW_CHART_HIGHLIGHT_MS,
  SAVED_CHART_TOAST_DURATION_MS,
} from '@/features/charts/charts.constants';
import {
  applyLayoutChange,
  chartGridStyle,
  expandLayout,
  shrinkLayout,
} from '@/features/charts/charts.layout';
import type { ChartLayout, DashboardChart, DashboardPeriod } from '@/features/charts/charts.types';
import {
  clearNewFlag,
  duplicateChart,
  insertAfter,
  removeChart,
  renameChart,
  restoreChart,
} from '@/features/charts/charts.utils';
import type { GraphType } from '@/features/bud/bud.types';
import { useDashboardChartsQuery, useUpdateDashboardCharts } from '@/hooks/useDashboardChartsQuery';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ChartsLocationState } from '@/types/navigation.types';

import { chartsDashboardStyles as styles } from './ChartsDashboard.styles';

const SKELETON_LAYOUTS = Object.values(DEFAULT_CHART_LAYOUTS);

export function ChartsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(MediaQuery.desktop);
  const [period, setPeriod] = useState<DashboardPeriod>(DEFAULT_DASHBOARD_PERIOD);
  const [editing, setEditing] = useState(false);
  const [layoutDraft, setLayoutDraft] = useState<Record<string, ChartLayout> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chartPendingDelete, setChartPendingDelete] = useState<DashboardChart | null>(null);
  const [chartPendingRename, setChartPendingRename] = useState<DashboardChart | null>(null);
  const [chartPendingExpand, setChartPendingExpand] = useState<DashboardChart | null>(null);
  const [newChartOpen, setNewChartOpen] = useState(false);
  const { data: charts = [], isPending } = useDashboardChartsQuery(period);
  const updateCharts = useUpdateDashboardCharts();
  const savedToastRef = useRef<string | null>(null);

  const displayed = useMemo(
    () =>
      charts.map((chart) =>
        layoutDraft?.[chart.id] ? { ...chart, layout: layoutDraft[chart.id] } : chart,
      ),
    [charts, layoutDraft],
  );

  const selected = displayed.find((chart) => chart.id === selectedId) ?? null;
  const stacked = !isDesktop;

  useEffect(() => {
    const savedChartId = (location.state as ChartsLocationState | null)?.savedChartId;
    if (!savedChartId || savedToastRef.current === savedChartId) return;
    savedToastRef.current = savedChartId;
    navigate('.', { replace: true, state: {} });
    toast.success('Gráfico salvo no dashboard', {
      duration: SAVED_CHART_TOAST_DURATION_MS,
      action: {
        label: 'Desfazer',
        onClick: () =>
          updateCharts((current) => {
            const { charts: next } = removeChart(current, savedChartId);
            return next;
          }),
      },
    });
  }, [location.state, navigate, updateCharts]);

  useEffect(() => {
    if (!charts.some((chart) => chart.isNew)) return;
    const timer = window.setTimeout(() => {
      updateCharts((current) => clearNewFlag(current));
    }, NEW_CHART_HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [charts, updateCharts]);

  const captureLayouts = (nextCharts: DashboardChart[]) => {
    setLayoutDraft(Object.fromEntries(nextCharts.map((chart) => [chart.id, chart.layout])));
  };

  const enterEdit = () => {
    setLayoutDraft(Object.fromEntries(displayed.map((chart) => [chart.id, chart.layout])));
    setSelectedId(displayed[0]?.id ?? null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setLayoutDraft(null);
  };

  const finishEdit = () => {
    if (layoutDraft) {
      updateCharts((current) =>
        current.map((chart) => ({ ...chart, layout: layoutDraft[chart.id] ?? chart.layout })),
      );
    }
    setEditing(false);
    setLayoutDraft(null);
  };

  const handleDuplicate = (chart: DashboardChart) => {
    updateCharts((current) => {
      const source = current.find((item) => item.id === chart.id) ?? chart;
      return insertAfter(current, chart.id, duplicateChart(source, crypto.randomUUID()));
    });
    toast.success('Gráfico duplicado');
  };

  const handleConfirmDelete = () => {
    if (!chartPendingDelete) return;

    const deletedId = chartPendingDelete.id;
    let removed: DashboardChart | null = null;
    let removedIndex = -1;

    updateCharts((current) => {
      const result = removeChart(current, deletedId);
      removed = result.removed;
      removedIndex = result.index;
      return result.charts;
    });

    const snapshot = removed;
    setChartPendingDelete(null);
    if (selectedId === deletedId) {
      setSelectedId(displayed.find((chart) => chart.id !== deletedId)?.id ?? null);
    }
    if (layoutDraft) {
      setLayoutDraft((current) => {
        if (!current) return current;
        const next = { ...current };
        delete next[deletedId];
        return next;
      });
    }

    if (!snapshot) return;

    toast('Gráfico excluído', {
      action: {
        label: 'Desfazer',
        onClick: () => updateCharts((current) => restoreChart(current, snapshot, removedIndex)),
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
    if (action === 'rename') {
      setChartPendingRename(chart);
      return;
    }
    if (action === 'expand') {
      if (editing) {
        captureLayouts(
          applyLayoutChange(displayed, chart.id, expandLayout(chart.layout, chart.kind)),
        );
        return;
      }
      setChartPendingExpand(chart);
    }
  };

  const openBuilder = (template?: GraphType) => {
    setNewChartOpen(false);
    navigate(ROUTES.chartBuilder, { state: template ? { template } : undefined });
  };

  const handleToolbarLayout = (mode: 'expand' | 'shrink') => {
    if (!selected) return;
    const nextLayout =
      mode === 'expand'
        ? expandLayout(selected.layout, selected.kind)
        : shrinkLayout(selected.layout, selected.kind);
    captureLayouts(applyLayoutChange(displayed, selected.id, nextLayout));
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Gráficos</h1>
          {editing ? null : (
            <p className={styles.subtitle}>O retrato vivo do seu time, montado por você.</p>
          )}
        </div>

        {editing ? (
          <Button variant="ghost" onClick={cancelEdit}>
            <X />
            Cancelar
          </Button>
        ) : (
          <div className={styles.actions}>
            <DashboardPeriodSelect value={period} onChange={setPeriod} />
            <Button variant="ghost" onClick={enterEdit} disabled={charts.length === 0}>
              <Pencil />
              Editar layout
            </Button>
            <Button onClick={() => setNewChartOpen(true)}>
              <Plus />
              Novo gráfico
            </Button>
          </div>
        )}
      </header>

      {editing ? (
        <div className={styles.banner}>
          <Tag tone="accent">Modo edição</Tag>
          <p className={styles.bannerText}>
            Arraste os cards para reorganizar. Redimensione pelos cantos.
          </p>
        </div>
      ) : null}

      {isPending ? (
        <div className={styles.grid} aria-busy="true">
          {SKELETON_LAYOUTS.map((layout, index) => (
            <Skeleton
              key={`skeleton-${index}`}
              className="rounded-xl"
              style={chartGridStyle(layout, stacked)}
            />
          ))}
        </div>
      ) : null}

      {!isPending && displayed.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Seu dashboard está vazio</p>
          <p className={styles.emptyText}>Crie um gráfico ou peça para o Bud montar um no chat.</p>
          <Button className={styles.emptyAction} onClick={() => setNewChartOpen(true)}>
            <Plus />
            Novo gráfico
          </Button>
        </div>
      ) : null}

      {!isPending && displayed.length > 0 ? (
        <ChartGrid
          charts={displayed}
          editing={editing}
          stacked={stacked}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAction={handleAction}
          onLayoutsChange={captureLayouts}
        />
      ) : null}

      {editing ? (
        <ChartEditToolbar
          disabled={!selected}
          onExpand={() => handleToolbarLayout('expand')}
          onShrink={() => handleToolbarLayout('shrink')}
          onDelete={() => selected && setChartPendingDelete(selected)}
          onFinish={finishEdit}
        />
      ) : null}

      <DeleteChartDialog
        chartTitle={chartPendingDelete?.title ?? null}
        onCancel={() => setChartPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
      <RenameChartDialog
        chartTitle={chartPendingRename?.title ?? null}
        onCancel={() => setChartPendingRename(null)}
        onConfirm={(title) => {
          if (!chartPendingRename) return;
          updateCharts((current) => renameChart(current, chartPendingRename.id, title));
          setChartPendingRename(null);
        }}
      />
      <ExpandChartDialog
        chart={chartPendingExpand}
        onClose={() => setChartPendingExpand(null)}
        onAction={handleAction}
      />
      <NewChartDialog
        open={newChartOpen}
        onOpenChange={setNewChartOpen}
        onSelectTemplate={openBuilder}
        onCreateWithBud={() => openBuilder()}
      />
    </div>
  );
}
