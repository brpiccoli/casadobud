import type { BudCategory, BudDataMode } from './bud.types';

const DASH_SEPARATOR_PATTERN = /\s*[—–]\s*|\s+-\s+/g;
const DOUBLE_COMMA_PATTERN = /,\s*,/g;
const COMMA_BEFORE_PUNCTUATION_PATTERN = /,\s*([.!?])/g;

export function sanitizeBudCopy(text: string): string {
  return text
    .replace(DASH_SEPARATOR_PATTERN, ', ')
    .replace(DOUBLE_COMMA_PATTERN, ',')
    .replace(COMMA_BEFORE_PUNCTUATION_PATTERN, '$1');
}

export function filterAllowedCategories(
  categories: readonly BudCategory[],
  allowed: readonly BudCategory[],
): BudCategory[] {
  return categories.filter((category) => allowed.includes(category));
}

export function isIllustrativeData(dataMode: BudDataMode): boolean {
  return dataMode === 'placeholder';
}
