'use client';

/**
 * BranchInitializer
 * Runs once after mount:
 * - Branch Admin: Auto-scopes to their assigned branch.
 * - Super Admin: Auto-scopes to Main Branch first upon login / fresh session.
 *   If user subsequently selects "All Branches" (or another branch), their choice is preserved.
 * Renders nothing — purely a side-effect component.
 */

import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch, getMainBranch } from '@/lib/auth';
import { resolveBranchName, registerBranches } from '@/lib/branchUtils';
import { branchService } from '@/services';

export default function BranchInitializer() {
  const user = useAuthStore((s) => s.user);
  const { setActiveBranch, activeBranchId } = useUIStore();
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }

    const isNewUser = lastUserIdRef.current !== user.id;
    lastUserIdRef.current = user.id;

    if (checkIsBranchAdmin(user)) {
      const assigned = getAssignedBranch(user);
      const branchId = assigned?.id || user?.branch_id || user?.branch?.id;
      const branchName = resolveBranchName(assigned || user?.branch || user?.branch_name || branchId, 'Assigned Branch');
      if (branchId && activeBranchId !== branchId) {
        setActiveBranch(branchId, branchName);
      }
    } else {
      // Global Admin (Super Admin / Institute Admin):
      // Business Requirement: Show Main Branch data first upon login.
      // If user later explicitly selects "All Branches", it is stored as 'all' and preserved.
      const isUninitialized = !activeBranchId || activeBranchId === 'null' || activeBranchId === 'undefined';
      if (isNewUser || isUninitialized) {
        const main = getMainBranch(user);
        if (main?.id) {
          const branchName = resolveBranchName(main, main.name || 'Main Branch');
          if (activeBranchId !== main.id) {
            setActiveBranch(main.id, branchName);
          }
        } else {
          // Fetch branches from API to discover and set the Main Branch
          branchService
            .getAll({ limit: 100, is_active: true })
            .then((res) => {
              const list = res?.data?.rows ?? (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
              if (Array.isArray(list) && list.length > 0) {
                registerBranches(list);
                const foundMain =
                  list.find((b) => b.is_main === true) ||
                  list.find((b) => {
                    const code = String(b.code || '').toUpperCase();
                    const name = String(b.name || '').toLowerCase();
                    return code.endsWith('-MAIN') || code === 'MAIN' || name.includes('main');
                  }) ||
                  list[0];

                if (foundMain?.id) {
                  const bName = resolveBranchName(foundMain, foundMain.name || 'Main Branch');
                  setActiveBranch(foundMain.id, bName);
                }
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [user?.id, user?.branch_id, activeBranchId, setActiveBranch]);

  return null;
}
