/**
 * Top navbar for school portal — uses ThemeToggle, NotificationBell, UserMenu
 */
'use client';

import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

import useAuthStore  from '@/store/authStore';
import useUiStore    from '@/store/uiStore';
import { authService } from '@/services';
import { Button }         from '@/components/ui/button';
import { Separator }      from '@/components/ui/separator';
import ThemeToggle        from '@/components/common/ThemeToggle';
import NotificationBell   from '@/components/common/NotificationBell';
import UserMenu           from '@/components/common/UserMenu';
import BranchSwitcher     from '@/components/common/BranchSwitcher';

import { logoutUser } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const { user }           = useAuthStore();
  const { toggleSidebar }  = useUiStore();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    logoutUser({ redirectTo: '/login' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:left-64">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden" aria-label="Toggle sidebar">
        <Menu size={20} />
      </Button>

      <BranchSwitcher />

      <div className="flex-1" />

      <ThemeToggle />
      <NotificationBell />
      <Separator orientation="vertical" className="h-6" />
      <UserMenu user={user} onLogout={handleLogout} />
    </header>
  );
}
