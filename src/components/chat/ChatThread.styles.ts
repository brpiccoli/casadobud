export const chatThreadStyles = {
  root: 'flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 @xl/main:px-6',
  list: 'mx-auto flex w-full max-w-[800px] flex-col gap-6',
  userBlock: 'flex flex-col items-end gap-2',
  userAttachments: 'flex max-w-[min(85%,32.5rem)] flex-wrap justify-end gap-1.5',
  user: 'max-w-[min(85%,32.5rem)] rounded-panel rounded-br-[6px] bg-pill px-4.5 py-3 text-message text-foreground',
  bud: 'flex max-w-[640px] flex-col items-start',
  budLead: 'font-heading text-subhead text-foreground',
  budBody: 'mt-2.5 text-message text-muted-foreground',
  charts: 'mt-3.5 flex w-full flex-col gap-3.5',
  redirect:
    'mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint/12 px-3 py-1.25 text-micro uppercase text-mint-ink hover:bg-mint/16',
  caret: 'ml-0.5 inline-block h-[1em] w-px translate-y-px bg-foreground align-middle animate-caret',
} as const;
