import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { GRID_COLUMNS, GRID_ROW_HEIGHT } from '@/features/charts/charts.constants';
import {
  applyLayoutChange,
  chartGridStyle,
  clampLayout,
  sortedByLayout,
} from '@/features/charts/charts.layout';
import type { ChartLayout, DashboardChart } from '@/features/charts/charts.types';
import { cn } from '@/lib/utils';

import { ChartCard } from './ChartCard';
import { chartGridStyles as styles } from './ChartGrid.styles';
import type { ChartGridProps } from './ChartCard.types';

const GRID_GAP = 16;

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  origin: ChartLayout;
  proposed: ChartLayout;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  width: number;
  height: number;
  pointerX: number;
  pointerY: number;
}

function gridMetrics(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const colWidth = (rect.width - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  return {
    colStride: colWidth + GRID_GAP,
    rowStride: GRID_ROW_HEIGHT + GRID_GAP,
  };
}

export function ChartGrid({
  charts,
  editing,
  stacked,
  selectedId,
  onSelect,
  onAction,
  onLayoutsChange,
}: ChartGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const originChartsRef = useRef(charts);
  const onLayoutsChangeRef = useRef(onLayoutsChange);
  const [drag, setDrag] = useState<DragState | null>(null);
  const ordered = stacked ? sortedByLayout(charts) : charts;
  const dragging = drag !== null;

  useEffect(() => {
    onLayoutsChangeRef.current = onLayoutsChange;
  }, [onLayoutsChange]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => {
      const current = dragRef.current;
      const grid = gridRef.current;
      if (!current || !grid) return;

      const originCharts = originChartsRef.current;
      const chart = originCharts.find((item) => item.id === current.id);
      if (!chart) return;

      const { colStride, rowStride } = gridMetrics(grid);
      const deltaX = Math.round((event.clientX - current.startX) / colStride);
      const deltaY = Math.round((event.clientY - current.startY) / rowStride);
      const proposed =
        current.mode === 'resize'
          ? clampLayout(
              { ...current.origin, w: current.origin.w + deltaX, h: current.origin.h + deltaY },
              chart.kind,
            )
          : clampLayout(
              { ...current.origin, x: current.origin.x + deltaX, y: current.origin.y + deltaY },
              chart.kind,
            );

      const next = {
        ...current,
        proposed,
        pointerX: event.clientX,
        pointerY: event.clientY,
      };
      dragRef.current = next;
      setDrag(next);

      if (current.mode === 'resize') {
        onLayoutsChangeRef.current(applyLayoutChange(originCharts, current.id, proposed));
      }
    };

    const handleUp = () => {
      const current = dragRef.current;
      if (current) {
        onLayoutsChangeRef.current(
          applyLayoutChange(originChartsRef.current, current.id, current.proposed),
        );
      }
      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging]);

  const beginDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    chart: DashboardChart,
    mode: DragState['mode'],
  ) => {
    if (!editing || stacked || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget.closest('article');
    const rect = card?.getBoundingClientRect();
    const next: DragState = {
      id: chart.id,
      mode,
      origin: chart.layout,
      proposed: chart.layout,
      startX: event.clientX,
      startY: event.clientY,
      grabX: rect ? event.clientX - rect.left : 0,
      grabY: rect ? event.clientY - rect.top : 0,
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    originChartsRef.current = charts;
    dragRef.current = next;
    setDrag(next);
    onSelect(chart.id);
  };

  const draggingChart = drag ? charts.find((chart) => chart.id === drag.id) : null;

  return (
    <div ref={gridRef} className={cn(styles.root, editing && 'select-none')}>
      {ordered.map((chart) => {
        const isMoving = drag?.mode === 'move' && drag.id === chart.id;
        if (isMoving) return null;

        return (
          <div key={chart.id} className={styles.item} style={chartGridStyle(chart.layout, stacked)}>
            <ChartCard
              chart={chart}
              className={styles.card}
              editing={editing}
              highlighted={Boolean(chart.isNew)}
              selected={selectedId === chart.id}
              onSelect={() => onSelect(chart.id)}
              onAction={onAction}
              onMovePointerDown={(event) => beginDrag(event, chart, 'move')}
              onResizePointerDown={(event) => beginDrag(event, chart, 'resize')}
            />
          </div>
        );
      })}

      {drag?.mode === 'move' ? (
        <div className={styles.placeholder} style={chartGridStyle(drag.proposed, stacked)}>
          Solte aqui
        </div>
      ) : null}

      {drag?.mode === 'move' && draggingChart ? (
        <div
          className={styles.ghost}
          style={{
            left: drag.pointerX - drag.grabX,
            top: drag.pointerY - drag.grabY,
            width: drag.width,
            height: drag.height,
            transform: 'rotate(-2.2deg)',
          }}
        >
          <ChartCard
            chart={draggingChart}
            className={styles.card}
            editing
            dragging
            selected
            onAction={onAction}
          />
        </div>
      ) : null}
    </div>
  );
}
