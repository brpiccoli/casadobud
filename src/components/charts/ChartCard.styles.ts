import { cva } from 'class-variance-authority';

export const chartCardStyles = {
  root: 'group/chart flex min-h-0 flex-col rounded-2xl border border-border bg-card/60 p-5',
  header: 'flex items-center gap-3',
  title: 'min-w-0 flex-1 truncate text-sm text-body',
  body: 'relative mt-4 min-h-0 flex-1',
  footer: 'mt-3 text-xs text-label-muted',
  menuTrigger: 'shrink-0 text-muted-foreground hover:text-foreground',
  kpiValue: 'mt-4 font-heading text-[40px] leading-none text-body',
  kpiCaption: 'mt-3 flex items-center gap-1.5 text-xs',
  donutCenter:
    'pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-3xl text-body',
} as const;

export const chartOriginTagVariants = cva(
  'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase',
  {
    variants: {
      origin: {
        preset: 'bg-chip text-muted-foreground',
        custom: 'bg-mint/15 text-mint',
      },
    },
  },
);

export const kpiTrendVariants = cva('', {
  variants: {
    trend: {
      up: 'text-mint',
      down: 'text-destructive',
      flat: 'text-label-muted',
    },
  },
});
