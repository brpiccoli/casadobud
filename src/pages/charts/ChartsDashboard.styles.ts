export const chartsDashboardStyles = {
  root: 'mx-auto flex min-h-full w-full max-w-[1180px] flex-col px-4 pt-8 pb-10 @xl/main:px-6 @3xl/main:px-8 @3xl/main:pt-10 @3xl/main:pb-12',
  header: 'flex flex-wrap items-start justify-between gap-4 @3xl/main:gap-6',
  titleBlock: 'flex flex-col gap-1.5',
  title: 'font-heading text-title text-foreground',
  subtitle: 'text-ui text-muted-foreground',
  actions: 'flex flex-wrap items-center gap-2 @xl/main:gap-2.5',
  banner:
    'mt-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-dashed border-mint/35 bg-mint/5 px-4 py-2.5',
  bannerText: 'text-ui-sm text-muted-foreground',
  grid: 'relative mt-6 grid auto-rows-[157px] grid-cols-1 gap-4 @3xl/main:mt-8 @3xl/main:grid-cols-12',
  empty:
    'mt-8 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center @3xl/main:py-20',
  emptyTitle: 'font-heading text-xl text-foreground',
  emptyText: 'text-ui text-muted-foreground',
  emptyAction: 'mt-4',
} as const;
