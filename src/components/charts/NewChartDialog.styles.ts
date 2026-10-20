export const newChartDialogStyles = {
  content: 'max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[780px] gap-0 p-7',
  header: 'gap-1 pr-8',
  title: 'font-heading text-headline text-foreground',
  description: 'text-ui text-muted-foreground',
  grid: 'mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 @2xl/main:grid-cols-3',
  card: 'flex h-[155px] flex-col items-start rounded-2xl border border-border bg-card px-[15px] py-[15px] text-left transition-colors hover:border-border-strong disabled:pointer-events-none disabled:opacity-60',
  budCard:
    'flex h-[155px] flex-col items-start rounded-2xl border border-mint/50 bg-mint/6 px-[15px] py-[15px] text-left text-mint-ink transition-colors hover:bg-mint/10 disabled:pointer-events-none disabled:opacity-60',
  preview: 'h-16 w-full',
  kpiPreview: 'flex h-16 w-full items-center justify-center font-heading text-headline text-foreground',
  budPreview: 'flex h-16 w-full items-center justify-center text-mint-ink',
  label: 'mt-2.5 text-ui text-foreground',
  presetTag: 'mt-2',
  budIcon: 'size-8.5',
  budLabel: 'mt-2.5 text-ui text-foreground',
  budCopy: 'mt-1.5 text-small text-muted-foreground',
  footer: 'mt-5',
} as const;
