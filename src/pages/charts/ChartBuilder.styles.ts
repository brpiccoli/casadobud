export const chartBuilderStyles = {
  root: 'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden @3xl/main:flex-row',
  canvas: 'flex min-h-0 min-w-0 flex-1 flex-col',
  canvasHeader: 'flex flex-wrap items-center gap-3 px-7 pt-5.5 pb-3.5',
  titleRow: 'flex min-w-0 flex-1 items-center gap-2',
  title: 'truncate font-heading text-[20px] text-foreground',
  rename: '-ml-1 text-muted-foreground hover:text-foreground',
  actions: 'flex shrink-0 items-center gap-2',
  stage: 'flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-7 pb-6',
  card: 'h-[min(520px,100%)] w-full max-w-[704px] rounded-[20px]',
  empty:
    'flex max-w-[420px] flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center',
  emptyTitle: 'font-heading text-subhead text-foreground',
  emptyText: 'text-ui text-muted-foreground',
} as const;
