import { cva } from 'class-variance-authority';

export const chartCardStyles = {
  header: 'flex items-center gap-2.5 px-4.5 pt-4 pb-1.5',
  title: 'min-w-0 flex-1 truncate text-body-lg font-medium text-foreground',
  body: 'relative min-h-0 flex-1 px-4.5 pt-2.5 pb-2',
  footer: 'truncate px-4.5 pt-2 pb-3.5 text-meta text-foreground-subtle',
  menuTrigger: '-mr-1',
  kpiValue: 'font-heading text-display leading-none text-foreground',
  kpiCaption: 'mt-3 flex items-center gap-1.5 text-meta',
  donutCenter:
    'pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-title text-foreground',
  legend: 'mb-2 flex flex-wrap items-center gap-3 text-meta text-muted-foreground',
  legendItem: 'inline-flex items-center gap-1.5',
  legendDot: 'size-1.5 rounded-full',
  dragHandle: '-ml-1 touch-none text-muted-foreground hover:text-foreground',
  resizeHandle:
    'absolute right-1.5 bottom-1.5 size-3.5 cursor-se-resize touch-none rounded-br border-r-[2.5px] border-b-[2.5px] border-foreground-subtle',
} as const;

export const chartCardFrameVariants = cva(
  'group/chart relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
  {
    variants: {
      editing: {
        true: 'border-dashed border-border-strong',
        false: 'border-solid border-border has-[[aria-expanded=true]]:border-mint/55',
      },
      highlighted: {
        true: 'border-solid border-mint/55',
        false: '',
      },
      selected: {
        true: '',
        false: '',
      },
      dragging: {
        true: 'border-dashed border-mint/60 shadow-overlay',
        false: '',
      },
    },
    compoundVariants: [
      {
        editing: true,
        selected: true,
        class: 'border-mint/60',
      },
    ],
    defaultVariants: {
      editing: false,
      highlighted: false,
      selected: false,
      dragging: false,
    },
  },
);

export const kpiTrendVariants = cva('', {
  variants: {
    trend: {
      up: 'text-mint-ink',
      down: 'text-destructive',
      flat: 'text-foreground-subtle',
    },
  },
});
