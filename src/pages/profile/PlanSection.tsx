import { Tag } from '@/components/ui/tag';
import { BUD_CONTACT_URL } from '@/constants/auth';

import { profilePageStyles as styles } from './Profile.styles';

export function PlanSection() {
  return (
    <section className={styles.section} aria-labelledby="profile-plan-title">
      <h2 id="profile-plan-title" className={styles.sectionTitle}>
        Plano
      </h2>
      <Tag tone="accent">casadobud · times</Tag>
      <p className={styles.planText}>
        Plano do clube com acesso completo ao Chat e aos Gráficos para toda a comissão.
      </p>
      <a href={BUD_CONTACT_URL} className={styles.planLink}>
        Falar com o Bud sobre o plano
      </a>
    </section>
  );
}
