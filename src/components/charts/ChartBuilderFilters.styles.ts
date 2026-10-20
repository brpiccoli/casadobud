export const chartBuilderFiltersStyles = {
  root: 'flex flex-wrap items-center gap-2.5 px-7',
  categoryMenu: 'w-[230px] p-1.5',
  menuItem:
    'flex w-full items-center gap-2.75 rounded-lg px-3 py-2.25 text-left text-ui-sm text-foreground hover:bg-accent disabled:opacity-50',
  menuDivider: 'mx-2 my-1.5 h-px bg-border',
  radio: 'flex size-4 items-center justify-center rounded-full border-[1.5px] border-border-strong',
  radioOn: 'border-mint',
  radioDot: 'size-2 rounded-full bg-mint',
  compareIcon: 'size-4 text-muted-foreground',
} as const;
