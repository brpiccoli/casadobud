import type { ReactNode } from 'react';

import type { ColorSwatch } from '@/features/foundations/foundations.types';

export interface FoundationsPanelProps {
  title: string;
  children: ReactNode;
}

export interface SwatchProps {
  swatch: ColorSwatch;
}
