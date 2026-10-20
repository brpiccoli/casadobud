export const foundationsStyles = {
  root: '@container/main min-h-svh bg-background px-6 py-8 text-foreground @3xl/main:px-12 @3xl/main:py-11',
  header: 'flex flex-wrap items-center justify-between gap-4',
  heading: 'flex flex-wrap items-baseline gap-x-4 gap-y-1',
  title: 'font-heading text-title text-foreground',
  subtitle: 'text-ui-sm text-muted-foreground',
  themeSwitch: 'flex items-center gap-2',
  grid: 'mt-5.5 grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3',
  panel: 'flex min-w-0 flex-col gap-3.5 rounded-panel border border-border bg-card p-5',
  panelTitle: 'text-overline text-foreground-subtle uppercase',

  swatches: 'grid grid-cols-3 gap-2.5',
  swatch: 'flex min-w-0 flex-col gap-1.5',
  swatchColor: 'h-11 rounded-lg border border-border',
  swatchLabel: 'text-meta text-muted-foreground',
  swatchValue: 'truncate text-meta text-foreground-subtle',

  typeHero: 'font-heading text-headline text-foreground',
  typeCaption: 'pt-1 text-meta text-foreground-subtle',
  typeBody: 'pt-3.5 text-copy text-muted-foreground',
  typeTag: 'pt-3.5 text-micro text-muted-foreground uppercase',
  typeScale: 'mt-2 flex flex-col gap-2 border-t border-border pt-4',
  typeRow: 'flex items-baseline justify-between gap-3',
  typeToken: 'shrink-0 text-meta text-foreground-subtle',
  typeSample: 'min-w-0 truncate text-right text-foreground',

  row: 'flex flex-wrap items-center gap-2.5',

  inputs: 'flex flex-col gap-3.5',
  composer: 'w-full',

  icons: 'grid grid-cols-6 gap-3',
  iconCell: 'flex flex-col items-center gap-1.5 text-muted-foreground',
  iconLabel: 'text-center text-micro font-normal tracking-normal break-all text-foreground-subtle',

  anatomyCard: 'h-[174px]',
  anatomyMenu: '-mr-1',
  anatomyNote: 'text-caption text-muted-foreground',
  anatomyHighlight: 'font-medium text-mint-ink',
} as const;
