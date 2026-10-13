import { BudWordmark } from '@/components/brand/BudWordmark';

import { splashScreenStyles as styles } from './SplashScreen.styles';
import type { SplashScreenProps } from './SplashScreen.types';

const DEFAULT_TAGLINE = 'o cuidado do seu time, em um só lugar';

export function SplashScreen({ title, subtitle = DEFAULT_TAGLINE }: SplashScreenProps) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.glowTop} aria-hidden />
      <div className={styles.glowBottom} aria-hidden />
      <div className={styles.content}>
        <BudWordmark size="xl" />
        {title ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
