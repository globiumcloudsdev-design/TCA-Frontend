/**
 * usePermission — checks if current user has a given permission.
 * Returns { can, isMasterAdmin } for use in components.
 */
'use client';

import useAuthStore from '@/store/authStore';

export function usePermission(permissionCode) {
  const canDo = useAuthStore((s) => s.canDo);
  const isMaster = useAuthStore((s) => s.isMasterAdmin());
  return {
    can: typeof canDo === 'function' ? canDo(permissionCode) : true,
    isMasterAdmin: isMaster,
  };
}

export function usePermissions(permissionCodes = []) {
  const canDoAny = useAuthStore((s) => s.canDoAny);
  const isMaster = useAuthStore((s) => s.isMasterAdmin());
  return {
    canAny: typeof canDoAny === 'function' ? canDoAny(permissionCodes) : true,
    isMasterAdmin: isMaster,
  };
}
