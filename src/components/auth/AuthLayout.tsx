import { BudWordmark } from '@/components/brand/BudWordmark';

import { authLayoutStyles as styles } from './AuthLayout.styles';
import type { AuthLayoutProps } from './AuthLayout.types';

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className={styles.root}>
      <div className={styles.glowTop} aria-hidden />
      <div className={styles.glowBottom} aria-hidden />

      <div className={styles.container}>
        <BudWordmark size="md" />

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>

        <section className={styles.card}>{children}</section>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </main>
  );
}
