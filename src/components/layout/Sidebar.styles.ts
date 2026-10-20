import { cva } from 'class-variance-authority';

export const sidebarStyles = {
  root: 'flex h-full w-[300px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
  header: 'flex items-center gap-3 px-5 pt-5 pb-4',
  collapseButton: 'text-muted-foreground hover:text-foreground',
  searchWrap: 'relative px-3.5',
  searchIcon:
    'pointer-events-none absolute top-1/2 left-6.5 size-3.75 -translate-y-1/2 text-foreground-subtle',
  searchInput:
    'h-9.5 rounded-lg pr-9 pl-9.5 text-ui [&::-webkit-search-cancel-button]:appearance-none',
  clearSearchButton:
    'absolute top-1/2 right-5 -translate-y-1/2 text-foreground-subtle hover:text-foreground',
  newConversation:
    'mx-3.5 mt-2.5 h-9.5 justify-start gap-2.5 rounded-lg bg-pill px-3 text-ui text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
  nav: 'mt-3.5 flex flex-col gap-0.5 px-3.5',
  scrollArea: 'mt-4.5 min-h-0 flex-1',
  footer: 'border-t border-sidebar-border p-3.5',
} as const;

export const sidebarNavItemVariants = cva(
  'flex h-9 items-center gap-2.75 rounded-lg px-3 text-body-lg transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none [&_svg]:size-4.5',
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
  group: 'flex flex-col gap-px',
  groupLabel: 'px-3 pt-2.5 pb-1.5 text-overline text-foreground-subtle uppercase',
  resultsLabel: 'px-3 pt-1 pb-2 text-overline text-foreground-subtle uppercase',
  resultsCount: 'px-3 py-2.5 text-meta text-foreground-subtle',
  empty: 'px-3 text-ui text-foreground-subtle',
  resultTitle: 'truncate text-ui-sm font-medium text-sidebar-foreground',
  resultExcerpt: 'line-clamp-2 text-caption leading-normal text-foreground-subtle',
  resultHighlight: 'bg-transparent font-medium text-mint-ink',
} as const;

export const sidebarSearchResultVariants = cva(
  'flex flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
  {
    variants: {
      active: {
        true: 'bg-sidebar-accent',
        false: 'hover:bg-sidebar-accent',
      },
    },
    defaultVariants: { active: false },
  },
);

export const sidebarConversationItemVariants = cva(
  'flex flex-col gap-0.5 rounded-lg px-3 py-1.75 text-left text-ui-sm transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
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

export const sidebarUserMenuStyles = {
  trigger:
    'flex w-full items-center gap-2.75 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
  identity: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-ui-sm font-medium text-sidebar-foreground',
  role: 'truncate text-meta text-foreground-subtle',
  chevron: 'size-3.75 shrink-0 text-muted-foreground',
} as const;
