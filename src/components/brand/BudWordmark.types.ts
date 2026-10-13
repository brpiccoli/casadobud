import type { VariantProps } from 'class-variance-authority';

import type { budWordmarkVariants } from './BudWordmark.styles';

export interface BudWordmarkProps extends VariantProps<typeof budWordmarkVariants> {
  className?: string;
}
