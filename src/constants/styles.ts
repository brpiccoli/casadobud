export const Typography = {
  xs: 10,
  sm: 12,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,

  lineHeight: {
    tight: 20,
    normal: 22,
    relaxed: 24,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const MediaQuery = {
  compact: '(max-width: 39.99rem)',
  desktop: '(min-width: 64rem)',
} as const;

export const AnimationDuration = {
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 800,
  slowest: 4000,
} as const;
