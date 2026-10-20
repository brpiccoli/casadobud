export const chatDictationBarStyles = {
  root: 'flex w-full items-center gap-2.5 rounded-full bg-pill py-2.5 pr-2.5 pl-3 @xl/main:gap-3.5',
  roundButton:
    'size-11.5 border border-border-strong text-foreground hover:bg-accent [&_svg]:size-4.5',
  stopSquare: 'size-3.25 rounded-[3px] bg-foreground',
  sendButton: 'size-11.5 bg-foreground text-background hover:bg-foreground/90 [&_svg]:size-4.5',
  timer: 'shrink-0 text-meta text-muted-foreground tabular-nums',
  waveform: 'flex h-10 min-w-0 flex-1 items-center justify-between overflow-hidden px-1',
  dot: 'size-0.75 shrink-0 rounded-full bg-foreground-subtle/60',
  bar: 'w-0.75 shrink-0 rounded-full bg-foreground transition-[height] duration-100',
} as const;

export const DICTATION_BAR_HEIGHTS = [
  'h-1',
  'h-1.5',
  'h-2',
  'h-3',
  'h-4',
  'h-5',
  'h-6',
  'h-7',
  'h-8',
  'h-9',
  'h-10',
] as const;
