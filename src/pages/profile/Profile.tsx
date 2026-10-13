import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

import { AccountSection } from './AccountSection';
import { PlanSection } from './PlanSection';
import { PreferencesSection } from './PreferencesSection';
import { profilePageStyles as styles } from './Profile.styles';
import { SecuritySection } from './SecuritySection';

export function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Perfil</h1>
        <p className={styles.subtitle}>Sua conta na casadobud.</p>
      </header>

      <div className={styles.grid}>
        <AccountSection />
        <SecuritySection />
        <PreferencesSection />
        <PlanSection />
      </div>

      <div className={styles.footer}>
        <Button variant="pill" className={styles.pillButton} onClick={() => void handleSignOut()}>
          <LogOut />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
