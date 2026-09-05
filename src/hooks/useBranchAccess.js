'use client';

import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { isBranchAdmin as checkBranchAdmin, isSuperAdmin as checkSuperAdmin, getAssignedBranch as checkAssignedBranch, schoolHasBranches as checkHasBranches } from '@/lib/auth';
import { resolveBranchName } from '@/lib/branchUtils';

/**
 * useBranchAccess hook
 * Unified hook providing multi-branch state, role-based branch restrictions,
 * active branch info, and branch switching actions.
 */
export default function useBranchAccess() {
  const user = useAuthStore((s) => s.user);
  const { activeBranchId, activeBranchName, setActiveBranch, clearActiveBranch } = useUIStore();

  const isBranchAdmin = checkBranchAdmin(user);
  const isSuperAdmin = !isBranchAdmin;
  const assignedBranch = checkAssignedBranch(user);
  const hasBranches = checkHasBranches(user);

  const assignedBranchId = assignedBranch?.id || user?.branch_id || user?.branch?.id || null;
  const assignedBranchName = assignedBranch?.name || resolveBranchName(assignedBranchId, user?.branch?.name || user?.branch_name || 'Assigned Branch');

  const isAllBranches = !activeBranchId || activeBranchId === 'all';

  const resolvedActiveName = isBranchAdmin
    ? assignedBranchName
    : (!isAllBranches
        ? (activeBranchName && !activeBranchName.includes('Selected Branch')
            ? activeBranchName
            : resolveBranchName(activeBranchId, 'Selected Branch'))
        : 'All Branches');

  return {
    isBranchAdmin,
    isSuperAdmin,
    assignedBranch,
    assignedBranchName,
    assignedBranchId,
    hasBranches,
    canSwitchBranch: isSuperAdmin,
    activeBranchId: isBranchAdmin ? assignedBranchId : (isAllBranches ? null : activeBranchId),
    activeBranchName: resolvedActiveName,
    setActiveBranch: (id, name) => setActiveBranch(id, name || resolveBranchName(id)),
    clearActiveBranch,
    isAllBranches: isSuperAdmin && isAllBranches,
    getBranchName: resolveBranchName,
  };
}
