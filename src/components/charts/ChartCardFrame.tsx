import { cn } from '@/lib/utils';

import { chartCardFrameVariants, chartCardStyles as styles } from './ChartCard.styles';
import type { ChartCardFrameProps } from './ChartCard.types';

export function ChartCardFrame({
  title,
  tag,
  menu,
  footer,
  children,
  className,
  bodyClassName,
  footerClassName,
  editing = false,
  highlighted = false,
  selected = false,
  dragging = false,
  dragHandle,
  resizeHandle,
  onSelect,
}: ChartCardFrameProps) {
  return (
    <article
      className={cn(
        chartCardFrameVariants({ editing, highlighted, selected, dragging }),
        className,
      )}
      onClick={onSelect}
    >
      <header className={styles.header}>
        {dragHandle}
        {tag}
        <h3 className={styles.title}>{title}</h3>
        {menu}
      </header>
      <div className={cn(styles.body, bodyClassName)}>{children}</div>
      {footer ? (
        typeof footer === 'string' || typeof footer === 'number' ? (
          <p className={cn(styles.footer, footerClassName)}>{footer}</p>
        ) : (
          <div className={cn(styles.footer, footerClassName)}>{footer}</div>
        )
      ) : null}
      {resizeHandle}
    </article>
  );
}
