import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ROUTES } from '@/constants/routes';
import { MediaQuery } from '@/constants/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { appLayoutStyles as styles } from './AppLayout.styles';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'casadobud:sidebar-collapsed';

function readCollapsed(): boolean {
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
}

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(MediaQuery.desktop);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerPathname, setDrawerPathname] = useState<string | null>(null);

  const drawerOpen = !isDesktop && drawerPathname === pathname;
  const showDockedSidebar = isDesktop && !collapsed;

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const closeDrawer = () => setDrawerPathname(null);

  const handleOpenMenu = () => {
    if (isDesktop) {
      setCollapsed(false);
      return;
    }
    setDrawerPathname(pathname);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) return;
    closeDrawer();
  };

  return (
    <div className={styles.root}>
      {showDockedSidebar ? <Sidebar onCollapse={() => setCollapsed(true)} /> : null}

      {isDesktop ? null : (
        <Sheet open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
          <SheetContent side="left" showCloseButton={false} className={styles.drawer}>
            <SheetTitle className={styles.srOnly}>Menu</SheetTitle>
            <SheetDescription className={styles.srOnly}>
              Navegação, busca e histórico de conversas.
            </SheetDescription>
            <Sidebar
              className={styles.drawerSidebar}
              collapseLabel="Fechar menu"
              onCollapse={closeDrawer}
              onNavigate={closeDrawer}
            />
          </SheetContent>
        </Sheet>
      )}

      <main className={styles.main}>
        {showDockedSidebar ? null : (
          <TopBar
            menuLabel={isDesktop ? 'Abrir barra lateral' : 'Abrir menu'}
            onOpenMenu={handleOpenMenu}
            onNewConversation={() => navigate(ROUTES.chat)}
          />
        )}
        <Outlet />
      </main>
    </div>
  );
}
