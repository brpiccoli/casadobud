import { cva } from 'class-variance-authority';

export const chartsDashboardStyles = {
  root: 'mx-auto flex w-full max-w-[1180px] flex-col px-4 pt-8 pb-10 @xl/main:px-6 @3xl/main:px-8 @3xl/main:pt-10 @3xl/main:pb-12',
  header: 'flex flex-wrap items-start justify-between gap-4 @3xl/main:gap-6',
  titleBlock: 'flex flex-col gap-1.5',
  title: 'font-heading text-[32px] leading-none text-body @3xl/main:text-[40px]',
  subtitle: 'text-sm text-muted-foreground',
  actions: 'flex flex-wrap items-center gap-2 @xl/main:gap-2.5',
  periodTrigger:
    'h-9 gap-2 rounded-full border-chip-border bg-chip px-3.5 text-[13px] text-foreground dark:bg-chip dark:hover:bg-accent',
  periodIcon: 'size-4 text-muted-foreground',
  actionButton: 'h-9 gap-2 px-4 text-[13px] font-normal',
  grid: 'mt-6 grid grid-flow-dense auto-rows-[152px] grid-cols-1 gap-3 @xl/main:gap-4 @2xl/main:grid-cols-2 @3xl/main:mt-8 @4xl/main:grid-cols-3',
  empty:
    'mt-8 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center @3xl/main:py-20',
  emptyTitle: 'font-heading text-xl text-body',
  emptyText: 'text-sm text-muted-foreground',
} as const;

export const chartGridItemVariants = cva('', {
  variants: {
    kind: {
      line: 'row-span-2 @2xl/main:col-span-2',
      bar: 'row-span-2',
      area: 'row-span-2',
      donut: 'row-span-2',
      kpi: 'row-span-1',
    },
  },
});
