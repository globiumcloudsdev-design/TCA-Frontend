'use client';

/**
 * BranchInitializer
 * Runs once after mount and auto-scopes the Branch Admin to their assigned branch.
 * Renders nothing — purely a side-effect component.
 */

import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch } from '@/lib/auth';

export default function BranchInitializer() {
  const user = useAuthStore((s) => s.user);
  const { setActiveBranch, clearActiveBranch, activeBranchId } = useUIStore();
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }

    const isNewUser = lastUserIdRef.current && lastUserIdRef.current !== user.id;
    lastUserIdRef.current = user.id;

    if (checkIsBranchAdmin(user)) {
      const assigned = getAssignedBranch(user);
      const branchId = assigned?.id || user?.branch_id || user?.branch?.id;
      const branchName = assigned?.name || user?.branch?.name || user?.branch_name || 'Assigned Branch';
      if (branchId && activeBranchId !== branchId) {
        setActiveBranch(branchId, branchName);
      }
    } else {
      // Global Admin (Super Admin / Institute Admin):
      // If user switched accounts or freshly authenticated, ensure we don't carry over
      // a stale branch lock from a previous Branch Admin session
      if (isNewUser && activeBranchId) {
        clearActiveBranch();
      }
    }
  }, [user?.id, user?.branch_id, activeBranchId, setActiveBranch, clearActiveBranch]);

  return null;
}
