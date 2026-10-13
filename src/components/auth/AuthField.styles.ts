export const authFieldStyles = {
  root: 'flex flex-col gap-2',
  label: 'text-xs font-normal text-muted-foreground',
  control: 'relative',
  leadingIcon:
    'pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground',
  input:
    'h-11 rounded-lg border-border bg-muted px-3.5 text-sm text-body placeholder:text-label-muted focus-visible:border-mint/50 focus-visible:ring-mint/15 dark:bg-muted',
  inputWithIcon: 'pl-10',
  inputWithToggle: 'pr-10',
  toggle:
    'absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
  error: 'text-xs text-destructive',
} as const;
