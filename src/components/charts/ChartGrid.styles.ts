export const chartGridStyles = {
  root: 'relative mt-6 grid auto-rows-[157px] grid-cols-1 gap-4 @3xl/main:mt-8 @3xl/main:grid-cols-12',
  item: 'min-h-0 min-w-0',
  card: 'h-full',
  placeholder:
    'flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-mint/45 bg-mint/4 text-ui-sm text-mint-ink',
  ghost: 'pointer-events-none fixed z-40 origin-center will-change-transform',
} as const;
