export const voicePageStyles = {
  root: 'relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground',
  glowTop:
    'pointer-events-none absolute -top-[22vh] -right-[12vw] size-[min(680px,47vw)] rounded-full bg-sage/40 blur-[100px]',
  glowBottom:
    'pointer-events-none absolute -bottom-[26vh] -left-[12vw] size-[min(680px,47vw)] rounded-full bg-slate/40 blur-[100px]',
  header: 'relative z-10 flex items-center justify-between px-8 pt-7.5 pb-4 sm:px-9.5',
  badge:
    'inline-flex items-center gap-2 rounded-full border border-mint/35 bg-mint/10 px-3.5 py-1.75',
  badgeDot: 'size-1.75 rounded-full bg-mint',
  badgeLabel: 'text-micro uppercase text-mint-ink',
  main: 'relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-28 sm:px-6',
  footer: 'relative z-10 flex flex-col items-center gap-2 px-4 pb-5 sm:px-6',
  hint: 'text-center text-meta text-foreground-subtle',
  previewSwitch: 'absolute top-20 left-1/2 z-20 flex -translate-x-1/2 gap-2',
} as const;
