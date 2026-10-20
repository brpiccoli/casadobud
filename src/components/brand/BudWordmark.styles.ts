import { cva } from 'class-variance-authority';

export const budWordmarkVariants = cva('font-heading text-foreground select-none', {
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-5xl',
      xl: 'text-7xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const budWordmarkStyles = {
  highlight: 'font-semibold text-mint-ink',
} as const;
