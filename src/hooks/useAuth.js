/**
 * useAuth — thin wrapper around authStore with redirect helper
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export function useAuth({ requireAuth = true, redirectTo = '/login' } = {}) {
  const router          = useRouter();
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  return { user, isAuthenticated, isLoading };
}
