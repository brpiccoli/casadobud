export const chatComposerStyles = {
  root: 'flex w-full flex-col gap-2.5',
  row: 'flex w-full items-center gap-2 @xl/main:gap-3.5',
  attachments: 'flex flex-wrap gap-2 px-2',
  pill: 'flex min-h-14 min-w-0 flex-1 items-center gap-1 rounded-full bg-pill py-2 pr-2 pl-2 transition-shadow data-[focused=true]:ring-2 data-[focused=true]:ring-mint/20 @xl/main:min-h-16 @xl/main:py-2.5 @xl/main:pr-2 @xl/main:pl-3',
  pillRail:
    'flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-pill py-3 pr-1.5 pl-4 transition-shadow data-[focused=true]:ring-2 data-[focused=true]:ring-mint/20',
  iconButton: 'text-foreground-subtle',
  textarea:
    'max-h-40 min-h-6 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1 text-prompt text-foreground outline-none placeholder:truncate placeholder:text-foreground-subtle field-sizing-content @xl/main:px-2',
  sendButton: 'bg-control text-foreground hover:bg-border-strong disabled:opacity-40',
  voiceButton: 'size-12 bg-cta text-cta-foreground hover:bg-cta/90 @xl/main:size-13',
} as const;

export const chatAttachmentMenuStyles = {
  trigger:
    'text-foreground-subtle aria-expanded:bg-transparent aria-expanded:text-mint-ink hover:text-foreground',
  content: 'w-[230px]',
  item: 'gap-2.75 px-3 py-2.25 text-ui-sm',
  subContent: 'w-48',
  hiddenInput: 'hidden',
} as const;

export const chatAttachmentChipStyles = {
  root: 'max-w-60 cursor-default gap-1.5 hover:border-border hover:text-muted-foreground',
  removable: 'pr-1.5',
  name: 'truncate',
  remove: 'size-5 rounded-full text-foreground-subtle hover:text-foreground [&_svg]:size-3',
} as const;
