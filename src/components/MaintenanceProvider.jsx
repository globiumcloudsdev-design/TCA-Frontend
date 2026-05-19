'use client';

import { useQuery } from '@tanstack/react-query';
import { publicService } from '@/services';
import MaintenancePage from './common/MaintenancePage';
import useAuthStore from '@/store/authStore';
import { usePathname } from 'next/navigation';

export default function MaintenanceProvider({ children }) {
  const user = useAuthStore(s => s.user);
  const pathname = usePathname();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['global-status-public'],
    queryFn: () => publicService.getPlatformStatus(),
    // Check if NOT a master admin (they bypass maintenance)
    enabled: user?.role_code !== 'MASTER_ADMIN',
    refetchInterval: 1000 * 60 * 2, // Check every 2 minutes
  });

  const maintenanceMode = settings?.data?.maintenance_mode;
  const isAdminUser = ['MASTER_ADMIN', 'SUPPORT_STAFF'].includes(user?.role_code);
  const isMasterAdminPath = pathname.startsWith('/master-admin');
  
  // If maintenance is ON and NOT an admin user, show maintenance page
  if (maintenanceMode?.enabled && !isAdminUser && !isMasterAdminPath && !isLoading) {
    // ONLY block dashboard areas, let /login and home page be accessible
    const isDashboardArea = 
      pathname.startsWith('/school') || 
      pathname.startsWith('/coaching') || 
      pathname.startsWith('/academy') || 
      pathname.startsWith('/college') || 
      pathname.startsWith('/university') ||
      pathname.startsWith('/student') ||
      pathname.startsWith('/parent') ||
      pathname.startsWith('/teacher');

    if (isDashboardArea) {
      return <MaintenancePage maintenance={maintenanceMode} />;
    }
  }

  return children;
}
