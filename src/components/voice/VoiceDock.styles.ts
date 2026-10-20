export const voiceDockStyles = {
  root: 'flex w-full max-w-[880px] items-center gap-3.5 rounded-full bg-pill py-2.25 pr-2.25 pl-5.5',
  plus: 'size-5 shrink-0 text-foreground-subtle',
  input:
    'min-w-0 flex-1 bg-transparent text-prompt text-foreground outline-none placeholder:text-foreground-subtle',
  mute: 'text-foreground-subtle hover:text-foreground data-[muted=true]:text-mint-ink',
  end: 'size-11.5 bg-cta text-cta-foreground hover:bg-cta/90',
} as const;
