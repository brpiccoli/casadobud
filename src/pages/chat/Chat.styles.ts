export const chatPageStyles = {
  root: 'flex flex-1 flex-col',
  header:
    'flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 @xl/main:px-6',
  headerTitle: 'truncate text-sm text-body',
  headerActions: 'flex shrink-0 items-center gap-1 text-muted-foreground',
  hero: 'flex flex-1 items-center justify-center px-4 py-10 @xl/main:px-6 @xl/main:py-16',
  heroContent: 'flex w-full max-w-[720px] flex-col items-center',
  date: 'font-heading text-sm text-muted-foreground @xl/main:text-base',
  title:
    'mt-3 mb-7 text-center font-heading text-[32px] leading-tight text-body @xl/main:mb-9 @xl/main:text-[44px]',
  suggestions: 'mt-6 flex flex-wrap justify-center gap-2',
  suggestion:
    'h-8 gap-2 px-3.5 text-[13px] font-normal text-muted-foreground hover:text-foreground',
  disclaimer: 'px-4 pb-5 text-center text-xs text-label-muted @xl/main:px-6',
} as const;
