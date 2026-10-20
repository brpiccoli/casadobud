export const authFieldStyles = {
  root: 'flex flex-col gap-1.75',
  control: 'relative',
  leadingIcon:
    'pointer-events-none absolute top-1/2 left-3.5 size-3.75 -translate-y-1/2 text-foreground-subtle',
  inputWithIcon: 'pl-10',
  inputWithToggle: 'pr-10',
  toggle:
    'absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-foreground-subtle transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
  error: 'text-meta text-destructive',
} as const;
