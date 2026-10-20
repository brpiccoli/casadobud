import { Maximize2, Minimize2, Move, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { chartEditToolbarStyles as styles } from './ChartEditToolbar.styles';
import type { ChartEditToolbarProps } from './ChartCard.types';

export function ChartEditToolbar({
  disabled,
  onExpand,
  onShrink,
  onDelete,
  onFinish,
}: ChartEditToolbarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.bar} role="toolbar" aria-label="Ferramentas de layout">
        <span className="flex size-9 items-center justify-center text-muted-foreground" aria-hidden>
          <Move className="size-4" />
        </span>
        <Button
          variant="quiet"
          size="icon"
          className={styles.icon}
          disabled={disabled}
          aria-label="Expandir card"
          onClick={onExpand}
        >
          <Maximize2 />
        </Button>
        <Button
          variant="quiet"
          size="icon"
          className={styles.icon}
          disabled={disabled}
          aria-label="Compactar card"
          onClick={onShrink}
        >
          <Minimize2 />
        </Button>
        <Button
          variant="quiet"
          size="icon"
          className={styles.danger}
          disabled={disabled}
          aria-label="Excluir card"
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
        <span className={styles.divider} aria-hidden />
        <Button size="sm" onClick={onFinish}>
          Concluir edição
        </Button>
      </div>
    </div>
  );
}
