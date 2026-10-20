import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { RenameChartDialogProps } from './ChartCard.types';

function RenameChartForm({
  initialTitle,
  onCancel,
  onConfirm,
}: {
  initialTitle: string;
  onCancel: () => void;
  onConfirm: (title: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const trimmed = title.trim();
  const canSave = trimmed.length > 0 && trimmed !== initialTitle;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        onConfirm(trimmed);
      }}
    >
      <DialogHeader>
        <DialogTitle>Renomear gráfico</DialogTitle>
        <DialogDescription>O nome aparece no card e no menu do dashboard.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2 py-1">
        <Label htmlFor="chart-title">Nome</Label>
        <Input
          id="chart-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave}>
          Salvar nome
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameChartDialog({ chartTitle, onCancel, onConfirm }: RenameChartDialogProps) {
  return (
    <Dialog open={chartTitle !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <DialogContent>
        {chartTitle ? (
          <RenameChartForm
            key={chartTitle}
            initialTitle={chartTitle}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
