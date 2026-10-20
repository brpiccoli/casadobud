import type { GraphType } from '@/features/bud/bud.types';

export interface NewChartDialogProps {
  open: boolean;
  creating?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (tipo: GraphType) => void;
  onCreateWithBud: () => void;
}
