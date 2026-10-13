import { cn } from '@/lib/utils';

import { budWordmarkStyles, budWordmarkVariants } from './BudWordmark.styles';
import type { BudWordmarkProps } from './BudWordmark.types';

export function BudWordmark({ size = 'md', className }: BudWordmarkProps) {
  return (
    <span className={cn(budWordmarkVariants({ size }), className)} aria-label="casadobud">
      casa<span className={budWordmarkStyles.highlight}>do</span>bud
    </span>
  );
}
