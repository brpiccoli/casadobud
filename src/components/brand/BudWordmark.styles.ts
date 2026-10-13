import { cva } from 'class-variance-authority';

export const budWordmarkVariants = cva('font-heading tracking-tight text-body select-none', {
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
  highlight: 'text-mint',
} as const;
