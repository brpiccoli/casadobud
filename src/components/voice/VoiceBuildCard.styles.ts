export const voiceBuildCardStyles = {
  root: 'flex w-full max-w-[660px] flex-col overflow-hidden rounded-2xl border bg-card',
  building: 'border-mint/35',
  confirming: 'border-border',
  header: 'flex items-center gap-2.5 px-4.5 pt-4 pb-1.5',
  title: 'min-w-0 flex-1 truncate text-body-lg font-medium text-foreground',
  body: 'relative h-[232px] w-full min-w-0 px-4.5 pt-2.5 pb-2',
  bodyConfirming: 'relative h-[210px] w-full min-w-0 px-4.5 pt-2.5 pb-2',
  kpiValue: 'font-heading text-display leading-none text-foreground',
  progress: 'flex items-center gap-3 px-4.5 pt-1.5 pb-4',
  progressLabel: 'shrink-0 text-meta text-muted-foreground',
  progressTrack: 'h-1.25 min-w-0 flex-1 overflow-hidden rounded-full bg-white/8',
  progressFill: 'h-full rounded-full bg-mint transition-[width] duration-300 ease-out',
} as const;
