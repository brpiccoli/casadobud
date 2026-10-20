export const chartBuilderRailStyles = {
  root: 'flex h-full min-h-0 w-full flex-col border-r border-border bg-sidebar @3xl/main:w-[380px] @3xl/main:shrink-0',
  header: 'flex flex-col gap-3 border-b border-border px-5 pt-5.5 pb-3.5',
  chip: 'w-fit gap-1.5',
  chipIcon: 'size-3',
  title: 'font-heading text-subhead text-foreground',
  thread: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5',
  user: 'ml-auto max-w-[280px] rounded-[18px] rounded-br-md bg-pill px-4.5 py-3 text-ui text-foreground',
  bud: 'text-copy text-muted-foreground',
  versions: 'flex flex-col gap-2 px-5 pb-2',
  versionsLabel: 'text-overline text-foreground-subtle uppercase',
  versionRow: 'flex flex-wrap gap-2',
  composer: 'px-4 pt-3.5 pb-4.5',
} as const;
