export const chartEditToolbarStyles = {
  root: 'pointer-events-none sticky bottom-6 z-30 mt-8 flex justify-center',
  bar: 'pointer-events-auto flex items-center gap-1.5 rounded-full border border-border-strong bg-popover px-2.5 py-2 shadow-overlay',
  icon: 'text-muted-foreground hover:text-foreground',
  danger: 'text-destructive hover:bg-destructive/12 hover:text-destructive',
  divider: 'mx-1 h-[22px] w-px bg-border-strong',
} as const;
