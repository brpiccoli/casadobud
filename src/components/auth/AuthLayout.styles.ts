export const authLayoutStyles = {
  root: 'relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6 sm:py-12',
  glowTop:
    'pointer-events-none absolute -top-[22vh] -right-[12vw] size-[47vw] max-h-[680px] max-w-[680px] rounded-full bg-glow/30 blur-[120px]',
  glowBottom:
    'pointer-events-none absolute -bottom-[26vh] -left-[12vw] size-[47vw] max-h-[680px] max-w-[680px] rounded-full bg-glow/25 blur-[120px]',
  container: 'relative flex w-full max-w-[400px] flex-col items-center',
  header: 'mt-8 mb-6 flex flex-col items-center gap-2 text-center sm:mt-10 sm:mb-8',
  title: 'font-heading text-title text-foreground sm:text-[40px]',
  subtitle: 'text-ui text-muted-foreground',
  card: 'w-full rounded-2xl border border-border bg-card p-5 sm:p-7',
  footer: 'mt-6 text-center text-ui text-foreground-subtle',
} as const;
