import { PanelLeft, SquarePen } from 'lucide-react';

import { BudWordmark } from '@/components/brand/BudWordmark';
import { Button } from '@/components/ui/button';

import { topBarStyles as styles } from './AppLayout.styles';
import type { TopBarProps } from './TopBar.types';

export function TopBar({ menuLabel, onOpenMenu, onNewConversation }: TopBarProps) {
  return (
    <header className={styles.root}>
      <Button
        variant="ghost"
        size="icon-sm"
        className={styles.button}
        onClick={onOpenMenu}
        aria-label={menuLabel}
      >
        <PanelLeft />
      </Button>
      <BudWordmark size="sm" className={styles.wordmark} />
      <Button
        variant="ghost"
        size="icon-sm"
        className={styles.button}
        onClick={onNewConversation}
        aria-label="Nova conversa"
      >
        <SquarePen />
      </Button>
    </header>
  );
}
