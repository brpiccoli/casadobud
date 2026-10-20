export const chatPageStyles = {
  root: 'flex flex-1 flex-col',
  header:
    'flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 @xl/main:px-6',
  headerTitle: 'truncate text-ui text-foreground',
  headerActions: 'flex shrink-0 items-center gap-1',
  hero: 'flex flex-1 items-center justify-center px-4 py-10 @xl/main:px-6 @xl/main:py-16',
  heroContent: 'flex w-full max-w-[720px] flex-col items-center',
  date: 'font-heading text-ui text-muted-foreground @xl/main:text-subhead',
  title:
    'mt-3 mb-7 text-center font-heading text-title text-foreground @xl/main:mb-9 @xl/main:text-display',
  dictationTitle: 'text-center font-heading text-title text-foreground',
  suggestions: 'mt-6 flex flex-wrap justify-center gap-2.5',
  thread: 'flex min-h-0 flex-1 flex-col',
  composer: 'mx-auto w-full max-w-[720px] px-4 pb-2 @xl/main:px-6',
  dictationComposer: 'mx-auto w-full max-w-[980px] px-4 pb-8 @xl/main:px-6',
  disclaimer: 'px-4 pb-5 text-center text-meta text-foreground-subtle @xl/main:px-6',
} as const;
