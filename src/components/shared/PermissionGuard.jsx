/**
 * PermissionGuard
 * Renders children only if the current user has the required permission.
 *
 * Usage:
 *   <PermissionGuard permission={PERMISSIONS.STUDENT_CREATE}>
 *     <button>Add Student</button>
 *   </PermissionGuard>
 */
'use client';

import useAuthStore from '@/store/authStore';

export default function PermissionGuard({ permission, fallback = null, children }) {
  const isMasterAdmin = useAuthStore((s) => s.isMasterAdmin());
  const canDo         = useAuthStore((s) => s.canDo);

  const allowed = isMasterAdmin || !permission || canDo(permission);

  return allowed ? children : fallback;
}
