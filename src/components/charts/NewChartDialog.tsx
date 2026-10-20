import { Sparkles } from 'lucide-react';

import { ChartVisual } from '@/components/charts/ChartVisual';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tag } from '@/components/ui/tag';
import { CHART_TEMPLATES } from '@/features/charts/charts.templates';

import { newChartDialogStyles as styles } from './NewChartDialog.styles';
import type { NewChartDialogProps } from './NewChartDialog.types';

export function NewChartDialog({
  open,
  creating = false,
  onOpenChange,
  onSelectTemplate,
  onCreateWithBud,
}: NewChartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content} showCloseButton>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.title}>Novo gráfico</DialogTitle>
          <DialogDescription className={styles.description}>
            Escolha um modelo ou crie com o Bud.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.grid}>
          {CHART_TEMPLATES.map((template) => (
            <button
              key={template.tipo}
              type="button"
              className={styles.card}
              disabled={creating}
              onClick={() => onSelectTemplate(template.tipo)}
            >
              {template.kind === 'kpi' ? (
                <span className={styles.kpiPreview}>
                  {template.preview.kind === 'kpi' ? template.preview.value : ''}
                </span>
              ) : (
                <span className={styles.preview}>
                  {template.preview.kind === 'kpi' ? null : (
                    <ChartVisual chart={template.preview} />
                  )}
                </span>
              )}
              <span className={styles.label}>{template.label}</span>
              <Tag className={styles.presetTag}>Pré-definido</Tag>
            </button>
          ))}

          <button
            type="button"
            className={styles.budCard}
            disabled={creating}
            onClick={onCreateWithBud}
          >
            <span className={styles.budPreview}>
              <Sparkles className={styles.budIcon} aria-hidden />
            </span>
            <span className={styles.budLabel}>Criar com o Bud</span>
            <span className={styles.budCopy}>Descreva no chat e ele monta o gráfico com você.</span>
          </button>
        </div>

        <DialogFooter className={styles.footer}>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
