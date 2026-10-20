import type { CSSProperties } from 'react';

import {
  CHART_MIN_SIZE,
  CHART_SIZE_BY_KIND,
  GRID_COLUMNS,
  GRID_MAX_HEIGHT,
} from './charts.constants';
import type { ChartKind, ChartLayout, DashboardChart } from './charts.types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sizeForKind(kind: ChartKind): Pick<ChartLayout, 'w' | 'h'> {
  return CHART_SIZE_BY_KIND[kind];
}

export function defaultLayoutForKind(kind: ChartKind): ChartLayout {
  const size = sizeForKind(kind);
  return { x: 0, y: 0, ...size };
}

export function clampLayout(layout: ChartLayout, kind: ChartKind): ChartLayout {
  const min = CHART_MIN_SIZE[kind];
  const w = clamp(Math.round(layout.w), min.w, GRID_COLUMNS);
  const h = clamp(Math.round(layout.h), min.h, GRID_MAX_HEIGHT);
  return {
    x: clamp(Math.round(layout.x), 0, GRID_COLUMNS - w),
    y: Math.max(0, Math.round(layout.y)),
    w,
    h,
  };
}

export function layoutsOverlap(a: ChartLayout, b: ChartLayout): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function findPlacement(
  occupied: ChartLayout[],
  size: Pick<ChartLayout, 'w' | 'h'>,
  maxY = 48,
): ChartLayout {
  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= GRID_COLUMNS - size.w; x += 1) {
      const candidate = { x, y, w: size.w, h: size.h };
      if (!occupied.some((item) => layoutsOverlap(item, candidate))) return candidate;
    }
  }
  return { x: 0, y: maxY, w: size.w, h: size.h };
}

export function expandLayout(layout: ChartLayout, kind: ChartKind): ChartLayout {
  if (layout.w < GRID_COLUMNS) {
    return clampLayout({ ...layout, w: Math.min(GRID_COLUMNS, layout.w + 4) }, kind);
  }
  return clampLayout({ ...layout, h: layout.h + 1 }, kind);
}

export function shrinkLayout(layout: ChartLayout, kind: ChartKind): ChartLayout {
  return clampLayout({ ...layout, ...sizeForKind(kind) }, kind);
}

function pushOverlaps(
  layouts: Map<string, ChartLayout>,
  items: Array<{ id: string; layout: ChartLayout }>,
  movingId: string,
): boolean {
  let changed = false;

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const first = { id: items[i].id, layout: layouts.get(items[i].id)! };
      const second = { id: items[j].id, layout: layouts.get(items[j].id)! };
      if (!layoutsOverlap(first.layout, second.layout)) continue;

      const keep =
        first.id === movingId
          ? first
          : second.id === movingId
            ? second
            : first.layout.y <= second.layout.y
              ? first
              : second;
      const moving = keep === first ? second : first;
      if (moving.id === movingId) continue;

      const nextY = keep.layout.y + keep.layout.h;
      if (moving.layout.y === nextY) continue;

      layouts.set(moving.id, { ...moving.layout, y: nextY });
      changed = true;
    }
  }

  return changed;
}

export function applyLayoutChange(
  charts: DashboardChart[],
  chartId: string,
  nextLayout: ChartLayout,
): DashboardChart[] {
  const target = charts.find((chart) => chart.id === chartId);
  if (!target) return charts;

  const layouts = new Map(
    charts.map((chart) => [
      chart.id,
      chart.id === chartId ? clampLayout(nextLayout, chart.kind) : { ...chart.layout },
    ]),
  );

  const snapshot = charts.map((chart) => ({ id: chart.id, layout: layouts.get(chart.id)! }));
  let guard = 0;
  while (pushOverlaps(layouts, snapshot, chartId) && guard < 40) {
    guard += 1;
  }

  return charts.map((chart) => ({ ...chart, layout: layouts.get(chart.id)! }));
}

export function sortedByLayout(charts: DashboardChart[]): DashboardChart[] {
  return [...charts].sort(
    (left, right) => left.layout.y - right.layout.y || left.layout.x - right.layout.x,
  );
}

export function chartGridStyle(layout: ChartLayout, stacked: boolean): CSSProperties {
  if (stacked) {
    return { gridColumn: '1 / -1' };
  }
  return {
    gridColumn: `${layout.x + 1} / span ${layout.w}`,
    gridRow: `${layout.y + 1} / span ${layout.h}`,
  };
}
