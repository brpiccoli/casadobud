export const splashScreenStyles = {
  root: 'relative flex min-h-svh items-center justify-center overflow-hidden bg-background',
  glowTop:
    'pointer-events-none absolute -top-[22vh] -right-[12vw] size-[47vw] max-h-[680px] max-w-[680px] rounded-full bg-glow/40 blur-[120px]',
  glowBottom:
    'pointer-events-none absolute -bottom-[26vh] -left-[12vw] size-[47vw] max-h-[680px] max-w-[680px] rounded-full bg-taupe/15 blur-[120px]',
  content: 'relative flex flex-col items-center gap-3 text-center animate-in fade-in duration-700',
  title: 'font-heading text-xl text-foreground',
  subtitle: 'text-base text-foreground-subtle',
} as const;
