import { Bell, ChevronDown, Globe, Sparkles, Sun } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

import { profilePageStyles as styles } from './Profile.styles';

export function PreferencesSection() {
  const { isDarkMode, setMode } = useTheme();

  return (
    <section className={styles.section} aria-labelledby="profile-preferences-title">
      <h2 id="profile-preferences-title" className={styles.sectionTitle}>
        Preferências
      </h2>

      <ul className={styles.preferenceList}>
        <li className={styles.preferenceRow}>
          <Sun className={styles.preferenceIcon} aria-hidden />
          <label htmlFor="preference-light-theme" className={styles.preferenceLabel}>
            Tema claro
          </label>
          <Switch
            id="preference-light-theme"
            checked={!isDarkMode}
            onCheckedChange={(checked) => void setMode(checked ? 'light' : 'dark')}
          />
        </li>
        <li className={styles.preferenceRow}>
          <Bell className={styles.preferenceIcon} aria-hidden />
          <label htmlFor="preference-email-notifications" className={styles.preferenceLabel}>
            Notificações por email <span className={styles.comingSoon}>· em breve</span>
          </label>
          <Switch id="preference-email-notifications" disabled />
        </li>
        <li className={styles.preferenceRow}>
          <Sparkles className={styles.preferenceIcon} aria-hidden />
          <label htmlFor="preference-weekly-summary" className={styles.preferenceLabel}>
            Resumo semanal do Bud <span className={styles.comingSoon}>· em breve</span>
          </label>
          <Switch id="preference-weekly-summary" disabled />
        </li>
        <li className={styles.preferenceRow}>
          <Globe className={styles.preferenceIcon} aria-hidden />
          <span className={styles.preferenceLabel}>Idioma</span>
          <span className={styles.languagePill}>
            Português (BR)
            <ChevronDown className="size-3.5" aria-hidden />
          </span>
        </li>
      </ul>
    </section>
  );
}
