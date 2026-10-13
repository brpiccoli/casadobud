import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface AuthFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}
