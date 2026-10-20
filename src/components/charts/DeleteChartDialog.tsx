import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
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
          <AlertDialogMedia className="bg-destructive/12 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir gráfico?</AlertDialogTitle>
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
