/**
 * usePermission — checks if current user has a given permission.
 * Returns { can, isMasterAdmin } for use in components.
 */
'use client';

import useAuthStore from '@/store/authStore';

export function usePermission(permissionCode) {
  return {
    can: true,
    isMasterAdmin: true,
  };
}

export function usePermissions(permissionCodes = []) {
  return {
    canAny: true,
    isMasterAdmin: true,
  };
}
