export const chartAthletesStyles = {
  content: 'w-[280px] gap-0 p-0',
  search: 'border-b border-border p-2.5',
  searchWrap: 'relative',
  searchIcon:
    'pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-subtle',
  input:
    'h-9 rounded-lg border-border bg-field px-3 pl-8 text-ui-sm placeholder:text-foreground-subtle',
  body: 'flex max-h-[320px] flex-col gap-0 overflow-y-auto px-1.5 py-1.5',
  row: 'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-ui-sm text-foreground hover:bg-accent',
  groupMeta: 'ml-auto text-meta text-foreground-subtle',
  section: 'px-2.5 pt-2 pb-1 text-overline text-foreground-subtle uppercase',
  footer: 'flex items-center justify-between gap-2 border-t border-border px-2.5 py-2',
} as const;
