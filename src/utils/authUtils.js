/**
 * Unified authentication utilities for The Clouds Academy
 */

/**
 * Get the correct dashboard path for a user based on their role and institute type
 * @param {Object} user - The user object from auth store or API
 * @param {string} fallbackInstituteType - Optional fallback institute type if not in user object
 * @returns {string} The dashboard URL
 */
export const getDashboardPath = (user, fallbackInstituteType = 'school') => {
  if (!user) return '/login';

  const role = (user.user_type || user.role_code || user.role?.code || '').toUpperCase();
  const instType = (user.institute?.institute_type || user.institute_type || user.school?.institute_type || fallbackInstituteType || '').toLowerCase();

  // Master Admin Roles
  const MASTER_ROLES = ['MASTER_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_STAFF', 'MASTER_STAFF', 'MASTER_SUPPORT', 'SUPER_ADMIN', 'ADMIN', 'MASTER'];
  if (MASTER_ROLES.includes(role)) {
    return '/master-admin';
  }

  // Portal Roles (Student, Teacher, Parent)
  if (role === 'TEACHER') return '/teacher';
  if (role === 'STUDENT') return '/student';
  if (role === 'PARENT') return '/parent';

  // Institute Admin & Staff Roles
  if (role === 'INSTITUTE_ADMIN' || role === 'BRANCH_ADMIN' || role === 'STAFF') {
    // If user belongs to a specific branch, we might want to go to branch dashboard
    // But for now, following existing logic of institute-type based dashboard
    return `/${instType}/dashboard`;
  }

  // Default fallback
  return '/dashboard';
};
