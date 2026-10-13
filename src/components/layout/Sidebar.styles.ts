import { cva } from 'class-variance-authority';

export const sidebarStyles = {
  root: 'flex h-full w-[300px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
  header: 'flex items-center gap-3 px-5 pt-5 pb-4',
  collapseButton: 'text-muted-foreground hover:text-foreground',
  searchWrap: 'relative px-3.5',
  searchIcon:
    'pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-label-muted',
  searchInput:
    'h-9 rounded-lg border-sidebar-border bg-transparent pl-9 text-sm placeholder:text-label-muted dark:bg-transparent',
  newConversation:
    'mx-3.5 mt-3 h-9 justify-start gap-2.5 rounded-lg bg-sidebar-accent px-3 text-sm font-normal text-sidebar-foreground hover:bg-accent',
  nav: 'mt-5 flex flex-col gap-1 px-3.5',
  scrollArea: 'mt-6 min-h-0 flex-1',
  footer: 'border-t border-sidebar-border p-3.5',
} as const;

export const sidebarNavItemVariants = cva(
  'flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
  {
    variants: {
      active: {
        true: 'bg-sidebar-accent text-sidebar-foreground',
        false: 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
      },
    },
    defaultVariants: { active: false },
  },
);

export const sidebarConversationStyles = {
  list: 'flex flex-col gap-5 px-3.5 pb-4',
  group: 'flex flex-col gap-0.5',
  groupLabel: 'px-3 pb-1.5 text-[11px] font-medium tracking-[0.12em] text-label-muted uppercase',
  resultsCount: 'px-3 pt-1 text-xs text-label-muted',
  empty: 'px-3 text-sm text-label-muted',
  preview: 'line-clamp-1 text-xs text-label-muted',
} as const;

export const sidebarConversationItemVariants = cva(
  'flex flex-col gap-0.5 rounded-lg px-3 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
  {
    variants: {
      active: {
        true: 'bg-sidebar-accent text-sidebar-foreground',
        false: 'text-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground',
      },
    },
    defaultVariants: { active: false },
  },
);

export const sidebarUserMenuStyles = {
  trigger:
    'flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
  avatar: 'size-9',
  avatarFallback: 'bg-gradient-end text-sm text-body',
  identity: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-sm text-sidebar-foreground',
  role: 'truncate text-xs text-label-muted',
  chevron: 'size-4 shrink-0 text-muted-foreground',
  content: 'w-[268px]',
} as const;
