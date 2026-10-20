export const appLayoutStyles = {
  root: 'flex h-svh overflow-hidden bg-background',
  main: '@container/main relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto',
  drawer:
    'gap-0 border-sidebar-border bg-sidebar p-0 data-[side=left]:w-[300px] data-[side=left]:max-w-[85vw] data-[side=left]:sm:max-w-[300px]',
  drawerSidebar: 'w-full border-r-0',
  srOnly: 'sr-only',
} as const;

export const topBarStyles = {
  root: 'sticky top-0 z-20 grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-md',
  button: 'text-muted-foreground hover:text-foreground',
  wordmark: 'justify-self-center',
} as const;
