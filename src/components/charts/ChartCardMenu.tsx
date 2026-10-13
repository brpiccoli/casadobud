import { Copy, Ellipsis, Maximize2, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { chartCardStyles as styles } from './ChartCard.styles';
import type { ChartCardMenuProps } from './ChartCard.types';

export function ChartCardMenu({ chartTitle, onAction }: ChartCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className={styles.menuTrigger}
          aria-label={`Opções do gráfico ${chartTitle}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onAction('rename')}>
          <Pencil />
          Renomear
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction('duplicate')}>
          <Copy />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction('expand')}>
          <Maximize2 />
          Expandir
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onAction('delete')}>
          <Trash2 />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
