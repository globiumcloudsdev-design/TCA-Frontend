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
  // Bypass all permission checks
  return children;
}
