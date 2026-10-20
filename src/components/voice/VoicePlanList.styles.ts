export const voicePlanListStyles = {
  root: 'flex w-full max-w-[520px] flex-col gap-3 rounded-panel border border-border bg-card px-5 py-4.5',
  row: 'flex items-center gap-3',
  icon: 'size-5 shrink-0',
  done: 'text-mint-ink',
  active: 'animate-spin text-mint-ink',
  pending: 'text-foreground-subtle',
  label: 'text-copy text-foreground',
  labelPending: 'text-copy text-foreground-subtle',
} as const;
