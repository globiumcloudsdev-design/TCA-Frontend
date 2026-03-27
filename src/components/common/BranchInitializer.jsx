'use client';

/**
 * BranchInitializer
 * Runs once after mount and auto-scopes the Branch Admin to their assigned branch.
 * Renders nothing — purely a side-effect component.
 */

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function BranchInitializer() {
  const user             = useAuthStore((s) => s.user);
  const { setActiveBranch, activeBranchId } = useUIStore();

  useEffect(() => {
    if (
      user?.role_code === 'BRANCH_ADMIN' &&
      user?.branch_id &&
      !activeBranchId
    ) {
      setActiveBranch(user.branch_id, user.branch?.name ?? 'My Branch');
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
