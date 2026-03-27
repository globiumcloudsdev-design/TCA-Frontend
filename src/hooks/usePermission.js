/**
 * usePermission — checks if current user has a given permission.
 * Returns { can, isMasterAdmin } for use in components.
 */
'use client';

import useAuthStore from '@/store/authStore';

export function usePermission(permissionCode) {
  const isMasterAdmin = useAuthStore((s) => s.isMasterAdmin());
  const canDo         = useAuthStore((s) => s.canDo);

  return {
    can:          isMasterAdmin || canDo(permissionCode),
    isMasterAdmin,
  };
}

export function usePermissions(permissionCodes = []) {
  const isMasterAdmin = useAuthStore((s) => s.isMasterAdmin());
  const canDoAny      = useAuthStore((s) => s.canDoAny);

  return {
    canAny:       isMasterAdmin || canDoAny(permissionCodes),
    isMasterAdmin,
  };
}
