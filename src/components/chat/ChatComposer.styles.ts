export const chatComposerStyles = {
  root: 'flex w-full items-center gap-2 @xl/main:gap-3',
  pill: 'flex min-h-14 min-w-0 flex-1 items-center gap-1 rounded-full bg-pill py-2 pr-2 pl-2 transition-shadow data-[focused=true]:ring-2 data-[focused=true]:ring-mint/20 @xl/main:min-h-16 @xl/main:py-2.5 @xl/main:pr-2.5 @xl/main:pl-3',
  iconButton: 'shrink-0 rounded-full text-muted-foreground hover:text-foreground',
  textarea:
    'max-h-40 min-h-6 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1 text-base text-body outline-none placeholder:truncate placeholder:text-label-muted field-sizing-content @xl/main:px-2',
  sendButton:
    'size-9 shrink-0 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/15 disabled:opacity-40',
  voiceButton:
    'size-12 shrink-0 rounded-full bg-cta text-cta-foreground shadow-sm hover:bg-cta/90 @xl/main:size-14',
} as const;
