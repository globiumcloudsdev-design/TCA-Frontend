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
  if (isMasterAdmin) return true;
  return userPermissions.includes(permissionCode);
}

/**
 * Check multiple permissions (user must have ALL of them).
 */
export function hasAllPermissions(userPermissions = [], permCodes = [], isMasterAdmin = false) {
  if (isMasterAdmin) return true;
  return permCodes.every((code) => userPermissions.includes(code));
}

/**
 * Check multiple permissions (user must have AT LEAST ONE).
 */
export function hasAnyPermission(userPermissions = [], permCodes = [], isMasterAdmin = false) {
  if (isMasterAdmin) return true;
  return permCodes.some((code) => userPermissions.includes(code));
}
