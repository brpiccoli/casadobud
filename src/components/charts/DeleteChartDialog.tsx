import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { DeleteChartDialogProps } from './ChartCard.types';

export function DeleteChartDialog({ chartTitle, onCancel, onConfirm }: DeleteChartDialogProps) {
  return (
    <AlertDialog
      open={chartTitle !== null}
      onOpenChange={(open) => (open ? undefined : onCancel())}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-xl font-normal">
            Excluir gráfico?
          </AlertDialogTitle>
          <AlertDialogDescription>
            “{chartTitle}” sai do dashboard. Você pode desfazer logo em seguida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Excluir gráfico
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
