export const authPageStyles = {
  form: 'flex flex-col gap-5',
  fields: 'flex flex-col gap-4',
  errorBanner:
    'flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-foreground',
  errorIcon: 'mt-0.5 size-4 shrink-0 text-destructive',
  forgotLinkRow: '-mt-1 flex justify-end',
  link: 'text-xs text-mint transition-opacity hover:opacity-80 focus-visible:underline focus-visible:outline-none',
  footerLink: 'text-mint transition-opacity hover:opacity-80',
  submit: 'w-full',
  secondaryAction: 'w-full text-muted-foreground',
  sentIconWrap:
    'mx-auto flex size-12 items-center justify-center rounded-full bg-mint/15 text-mint',
  sentText: 'text-center text-sm text-muted-foreground',
  sentEmail: 'text-body',
  resendRow: 'text-center text-xs text-label-muted',
  resendButton: 'text-mint transition-opacity hover:opacity-80 disabled:opacity-50',
} as const;
