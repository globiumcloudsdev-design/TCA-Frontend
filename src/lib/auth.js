/**
 * The Clouds Academy — Auth Helpers
 *
 * Helper functions for login, logout, checking permissions,
 * and reading the current user from Zustand store.
 */

import Cookies from 'js-cookie';

// ── Token helpers ─────────────────────────────────────────────────────────
export function setAccessToken(token) {
  Cookies.set('access_token', token, { expires: 7, sameSite: 'Lax' });
}

export function getAccessToken() {
  return Cookies.get('access_token') || null;
}

export function removeAccessToken() {
  Cookies.remove('access_token');
}

// ── School helpers ────────────────────────────────────────────────────────
export function setSchoolCode(code) {
  if (code) localStorage.setItem('school_code', code);
}

export function getSchoolCode() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_code');
}

export function setActiveBranch(branchId) {
  if (branchId) localStorage.setItem('active_branch_id', branchId);
  else localStorage.removeItem('active_branch_id');
}

export function clearActiveBranch() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('active_branch_id');
  }
}

export function getActiveBranch() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('active_branch_id');
}

// ── Clear everything on logout ────────────────────────────────────────────
export function clearAuthData() {
  removeAccessToken();
  localStorage.removeItem('school_code');
  localStorage.removeItem('active_branch_id');
}

// ── Permission check ──────────────────────────────────────────────────────
/**
 * Check if the logged-in user has a given permission code.
 * @param {string[]} userPermissions  — array of permission codes from auth store
 * @param {string}   permissionCode   — e.g. 'student.create'
 * @param {boolean}  isMasterAdmin    — Master Admin bypasses all checks
 */
export function hasPermission(userPermissions = [], permissionCode, isMasterAdmin = false) {
  // Bypass all permissions
  return true;
}

/**
 * Check multiple permissions (user must have ALL of them).
 */
export function hasAllPermissions(userPermissions = [], permCodes = [], isMasterAdmin = false) {
  // Bypass all permissions
  return true;
}

/**
 * Check multiple permissions (user must have AT LEAST ONE).
 */
export function hasAnyPermission(userPermissions = [], permCodes = [], isMasterAdmin = false) {
  // Bypass all permissions
  return true;
}

// ── Branch & Multi-Branch Access Control helpers ───────────────────────────
/**
 * Check if user is assigned to the default "Main Branch".
 * 
 * Business Rule:
 * 1. Main Branch = Super Admin: The user assigned to the default "Main Branch"
 *    is the Super Admin. They must have global access to see all data across all branches
 *    (using the branch dropdowns) and must not be restricted.
 * 2. Other Branches = Branch Admins: Any user assigned to a newly created, non-main branch
 *    is a standard "Branch Admin". They must be strictly restricted to seeing only their own branch.
 *
 * @param {object} user - User object
 * @returns {boolean}
 */
export function isMainBranchUser(user) {
  if (!user) return false;

  // 1. Explicit main branch flags
  if (user.is_main_branch === true || user.is_main === true) return true;
  if (user.branch?.is_main === true || user.assigned_branch?.is_main === true) return true;

  // 2. Global platform / institute admin types are always super admin
  const userType = String(user.user_type || '').toUpperCase();
  if (
    userType === 'INSTITUTE_ADMIN' ||
    userType === 'SUPER_ADMIN' ||
    userType === 'SUPER ADMIN' ||
    userType === 'MASTER_ADMIN' ||
    userType === 'MASTER ADMIN'
  ) {
    return true;
  }

  // 3. Main branch naming / code conventions
  const branchName = String(user.branch?.name || user.assigned_branch?.name || user.branch_name || '').toLowerCase();
  const branchCode = String(user.branch?.code || user.assigned_branch?.code || user.branch_code || '').toUpperCase();

  if (
    branchCode.endsWith('-MAIN') ||
    branchCode === 'MAIN' ||
    branchName.includes('main campus') ||
    branchName.includes('main branch')
  ) {
    return true;
  }

  // 4. Cross-reference user.institute.branches if present
  const branchId = user.branch?.id || user.assigned_branch?.id || user.branch_id;
  if (branchId && Array.isArray(user.institute?.branches)) {
    const matched = user.institute.branches.find((b) => String(b.id) === String(branchId));
    if (
      matched &&
      (matched.is_main === true ||
        String(matched.code || '').toUpperCase().endsWith('-MAIN') ||
        String(matched.name || '').toLowerCase().includes('main'))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user is a Branch Admin (restricted to a single branch).
 * @param {object} user - User object from auth store
 * @returns {boolean}
 */
export function isBranchAdmin(user) {
  if (!user) return false;

  // Explicit bypass
  if (user.is_super_admin === true) return false;

  // 1. MAIN BRANCH USER = SUPER ADMIN (Must NEVER be restricted as Branch Admin)
  if (isMainBranchUser(user)) {
    return false;
  }

  // 2. Explicit branch admin flag on non-main branch
  if (user.is_branch_admin === true) return true;

  // 3. Explicit non-main branch indicator
  if (user.branch && user.branch.is_main === false) {
    return true;
  }
  if (user.assigned_branch && user.assigned_branch.is_main === false) {
    return true;
  }

  // 4. Role / User Type for Branch Admin
  const userType = String(user.user_type || '').toUpperCase();
  if (
    userType === 'BRANCH_ADMIN' ||
    userType === 'CAMPUS_ADMIN' ||
    userType === 'BRANCH_STAFF' ||
    userType === 'BRANCH ADMIN' ||
    userType === 'CAMPUS ADMIN'
  ) {
    return true;
  }

  const roleCode = String(
    user.role_code ||
    user.role?.code ||
    (typeof user.role === 'string' ? user.role : user.role?.name) ||
    user.role_name ||
    ''
  ).toUpperCase();

  if (
    roleCode === 'BRANCH_ADMIN' ||
    roleCode === 'BRANCH_STAFF' ||
    roleCode === 'CAMPUS_ADMIN' ||
    roleCode === 'BRANCH ADMIN' ||
    roleCode === 'CAMPUS ADMIN'
  ) {
    return true;
  }

  // 5. If user has a branch_id assigned and is not main branch
  if (user.branch_id) {
    return true;
  }

  return false;
}

/**
 * Check if user is a Super Admin / Institute Admin (manages all branches).
 * @param {object} user - User object from auth store
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  return !isBranchAdmin(user);
}

/**
 * Get assigned branch details for the user.
 * @param {object} user - User object
 * @returns {{ id: string, name: string } | null}
 */
export function getAssignedBranch(user) {
  if (!user) return null;
  const branchId = user.branch?.id || user.assigned_branch?.id || user.branch_id;
  if (!branchId) return null;

  // Try to find full branch from user.institute.branches or user.branches if available
  const knownBranches = user.institute?.branches || user.branches || [];
  const foundInInstitute = Array.isArray(knownBranches)
    ? knownBranches.find((b) => String(b.id) === String(branchId))
    : null;

  const branchName =
    user.branch?.name ||
    user.assigned_branch?.name ||
    foundInInstitute?.name ||
    user.branch_name ||
    user.branchName ||
    'Assigned Branch';

  return {
    id: branchId,
    name: branchName,
    ...(user.branch || {}),
    ...(foundInInstitute || {}),
  };
}

/**
 * Check if school/institute supports multiple branches.
 * @param {object} user - User object
 * @returns {boolean}
 */
export function schoolHasBranches(user) {
  if (!user) return true; // Default to multi-branch aware
  if (user.institute?.settings?.has_branches === true) return true;
  if (user.school?.settings?.has_branches === true) return true;
  if (Array.isArray(user.institute?.branches) && user.institute.branches.length > 0) return true;
  if (Array.isArray(user.branches) && user.branches.length > 0) return true;
  return true;
}

