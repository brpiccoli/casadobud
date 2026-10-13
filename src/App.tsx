import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppRouter } from '@/navigation/AppRouter';
import { AppQueryProvider } from '@/providers/AppQueryProvider';

export default function App() {
  return (
    <AppQueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AppRouter />
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppQueryProvider>
  );
}
