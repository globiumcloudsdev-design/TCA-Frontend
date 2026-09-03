'use client';

import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { isBranchAdmin as checkBranchAdmin, isSuperAdmin as checkSuperAdmin, getAssignedBranch as checkAssignedBranch, schoolHasBranches as checkHasBranches } from '@/lib/auth';

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

  const assignedBranchName = assignedBranch?.name || user?.branch?.name || user?.branch_name || 'Assigned Branch';
  const assignedBranchId = assignedBranch?.id || user?.branch_id || user?.branch?.id || null;

  return {
    isBranchAdmin,
    isSuperAdmin,
    assignedBranch,
    assignedBranchName,
    assignedBranchId,
    hasBranches,
    canSwitchBranch: isSuperAdmin,
    activeBranchId: isBranchAdmin ? assignedBranchId : activeBranchId,
    activeBranchName: isBranchAdmin ? assignedBranchName : (activeBranchName || (activeBranchId ? 'Selected Branch' : 'All Branches')),
    setActiveBranch,
    clearActiveBranch,
    isAllBranches: isSuperAdmin && !activeBranchId,
  };
}
