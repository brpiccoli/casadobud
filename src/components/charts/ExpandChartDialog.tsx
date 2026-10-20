import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

import { ChartCard } from './ChartCard';
import type { ExpandChartDialogProps } from './ChartCard.types';

export function ExpandChartDialog({ chart, onClose, onAction }: ExpandChartDialogProps) {
  return (
    <Dialog open={chart !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-3xl" showCloseButton>
        <DialogTitle className="sr-only">{chart?.title ?? 'Gráfico'}</DialogTitle>
        <DialogDescription className="sr-only">Visualização ampliada do gráfico.</DialogDescription>
        {chart ? (
          <ChartCard
            chart={chart}
            onAction={(action, nextChart) => {
              if (action === 'expand') return;
              onAction(action, nextChart);
              if (action === 'delete') onClose();
            }}
            className="h-[min(70vh,520px)]"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
