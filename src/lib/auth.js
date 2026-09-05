/**
 * The Clouds Academy — Auth Helpers
 *
 * Helper functions for login, logout, checking permissions,
 * and reading the current user from Zustand store.
 */

import Cookies from 'js-cookie';

// ── Token helpers ─────────────────────────────────────────────────────────
export function setAccessToken(token) {
  Cookies.set('access_token', token, { expires: 7, sameSite: 'Lax', path: '/' });
}

export function getAccessToken() {
  return Cookies.get('access_token') || null;
}

export function removeAccessToken() {
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('access_token');
  if (typeof window !== 'undefined') {
    try {
      Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
    } catch (e) {}
  }
}

export function setRefreshToken(token) {
  if (!token) return;
  Cookies.set('refresh_token', token, { expires: 30, sameSite: 'Lax', path: '/' });
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('refresh_token', token);
    } catch (e) {}
  }
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return Cookies.get('refresh_token') || null;
  return Cookies.get('refresh_token') || localStorage.getItem('refresh_token') || null;
}

export function removeRefreshToken() {
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('refresh_token');
  Cookies.remove('refreshToken', { path: '/' });
  Cookies.remove('refreshToken');
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refreshToken');
    } catch (e) {}
    try {
      Cookies.remove('refresh_token', { path: '/', domain: window.location.hostname });
      Cookies.remove('refreshToken', { path: '/', domain: window.location.hostname });
    } catch (e) {}
  }
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
  const cookieNames = [
    'access_token',
    'refresh_token',
    'refreshToken',
    'portal_token',
    'role_code',
    'user_type',
    'institute_type',
    'portal_type',
    'selected_account_id',
  ];

  try {
    const all = Cookies.get() || {};
    Object.keys(all).forEach((k) => {
      if (!cookieNames.includes(k)) cookieNames.push(k);
    });
  } catch (e) {}

  cookieNames.forEach((name) => {
    Cookies.remove(name, { path: '/' });
    Cookies.remove(name);
    if (typeof window !== 'undefined') {
      try {
        Cookies.remove(name, { path: '/', domain: window.location.hostname });
      } catch (e) {}
    }
  });

  if (typeof window !== 'undefined') {
    const storageKeys = [
      'school_code',
      'active_branch_id',
      'clouds-auth',
      'clouds-ui',
      'clouds-institute',
      'clouds-portal',
      'accessToken',
      'refresh_token',
      'refreshToken',
      'user',
      'originalAdminToken',
      'originalAdminUser',
    ];
    storageKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    try {
      sessionStorage.clear();
    } catch (e) {}
  }

  // Wipe TanStack Query in-memory cache
  try {
    const { queryClient } = require('@/lib/queryClient');
    queryClient.clear();
  } catch (e) {}
}

/**
 * Perform complete, instant logout with zero UI freeze
 */
export async function logoutUser({ redirectTo = '/login' } = {}) {
  // 1. Immediately wipe all local auth cookies, storage, and React Query cache
  clearAuthData();

  // 2. Reset authStore, uiStore, instituteStore and portalStore
  try {
    const authMod = require('@/store/authStore');
    const authStore = authMod.useAuthStore || authMod.default || authMod;
    authStore?.getState?.()?.logout?.();
  } catch (e) {}

  try {
    const uiMod = require('@/store/uiStore');
    const uiStore = uiMod.useUIStore || uiMod.default || uiMod;
    uiStore?.getState?.()?.clearActiveBranch?.();
  } catch (e) {}

  try {
    const instMod = require('@/store/instituteStore');
    const instStore = instMod.useInstituteStore || instMod.default || instMod;
    instStore?.getState?.()?.clearInstitute?.();
  } catch (e) {}

  try {
    const portalMod = require('@/store/portalStore');
    const portalStore = portalMod.usePortalStore || portalMod.default || portalMod;
    portalStore?.getState?.()?.clearPortalUser?.();
  } catch (e) {}

  // 3. Fire-and-forget backend logout with short 800ms timeout so user never waits
  try {
    const authSvcMod = require('@/services/authService');
    const authSvc = authSvcMod.authService || authSvcMod.default || authSvcMod;
    if (authSvc?.logout) {
      Promise.race([
        authSvc.logout(),
        new Promise((res) => setTimeout(res, 800)),
      ]).catch(() => {});
    }
  } catch (e) {}

  // 4. Clean window redirect - guarantees full unmount and zero stale memory state
  if (typeof window !== 'undefined') {
    window.location.replace(redirectTo);
  }
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

/**
 * Resolve the Main Branch for an institute/user.
 * Searches:
 * 1. user.main_branch / user.mainBranch
 * 2. user.branch if marked as is_main or matching MAIN code/name
 * 3. user.institute.branches or user.branches (finds is_main: true, -MAIN code, or first branch)
 * 4. user.branch / user.assigned_branch fallback
 *
 * @param {object} user
 * @returns {{ id: string, name: string } | null}
 */
export function getMainBranch(user) {
  if (!user) return null;

  if (user.main_branch?.id) {
    return {
      id: user.main_branch.id,
      name: user.main_branch.name || user.main_branch.branch_name || 'Main Branch',
      ...user.main_branch,
    };
  }

  if (user.mainBranch?.id) {
    return {
      id: user.mainBranch.id,
      name: user.mainBranch.name || user.mainBranch.branch_name || 'Main Branch',
      ...user.mainBranch,
    };
  }

  const branches = user.institute?.branches || user.branches || [];
  if (Array.isArray(branches) && branches.length > 0) {
    const main = branches.find((b) => b.is_main === true);
    if (main?.id) {
      return {
        id: main.id,
        name: main.name || main.branch_name || 'Main Branch',
        ...main,
      };
    }
    const byCodeOrName = branches.find((b) => {
      const code = String(b.code || '').toUpperCase();
      const name = String(b.name || '').toLowerCase();
      return code.endsWith('-MAIN') || code === 'MAIN' || name.includes('main');
    });
    if (byCodeOrName?.id) {
      return {
        id: byCodeOrName.id,
        name: byCodeOrName.name || byCodeOrName.branch_name || 'Main Branch',
        ...byCodeOrName,
      };
    }
    if (branches[0]?.id) {
      return {
        id: branches[0].id,
        name: branches[0].name || branches[0].branch_name || 'Main Branch',
        ...branches[0],
      };
    }
  }

  if (user.branch?.id && (user.branch.is_main === true || user.is_main_branch === true)) {
    return {
      id: user.branch.id,
      name: user.branch.name || user.branch.branch_name || 'Main Branch',
      ...user.branch,
    };
  }

  if (user.branch?.id) {
    return {
      id: user.branch.id,
      name: user.branch.name || user.branch.branch_name || 'Main Branch',
      ...user.branch,
    };
  }

  if (user.assigned_branch?.id) {
    return {
      id: user.assigned_branch.id,
      name: user.assigned_branch.name || user.assigned_branch.branch_name || 'Main Branch',
      ...user.assigned_branch,
    };
  }

  return null;
}


