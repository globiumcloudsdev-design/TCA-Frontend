'use client';

/**
 * Branch Utilities & Resolver
 *
 * Provides universal branch resolution across tables, headers, forms, and cards:
 * - Maps branch IDs / UUIDs to human-friendly branch names
 * - Eliminates raw branch IDs / UUIDs from ever being displayed to users
 * - Maintains in-memory lookup cache and synchronizes with authStore & instituteStore
 */

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useUIStore from '@/store/uiStore';
import { branchService } from '@/services';
import { useQuery } from '@tanstack/react-query';

// In-memory branch lookup cache (Key: branch ID/value/code -> Value: Branch Name)
const branchNameCache = new Map();

/**
 * Register branches into the global cache
 * @param {Array} list
 */
export function registerBranches(list) {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    if (!item) continue;
    const name = item.name || item.branch_name || item.label || item.title;
    if (!name) continue;

    if (item.id) branchNameCache.set(String(item.id), name);
    if (item.value) branchNameCache.set(String(item.value), name);
    if (item._id) branchNameCache.set(String(item._id), name);
    if (item.code) branchNameCache.set(String(item.code), name);
  }
}

/**
 * Resolve any branch object, ID, or UUID into a clean, human-readable branch name.
 * NEVER renders a raw UUID / ID string to the user.
 *
 * @param {string|number|object|null} branchOrId
 * @param {string|null} fallback Default text if cannot be resolved (default: '—')
 * @returns {string} Human-friendly branch name
 */
export function resolveBranchName(branchOrId, fallback = '—') {
  if (branchOrId === null || branchOrId === undefined || branchOrId === '') {
    return fallback;
  }

  // 1. If it is already an object with name/label
  if (typeof branchOrId === 'object') {
    const directName = branchOrId.name || branchOrId.branch_name || branchOrId.label || branchOrId.title;
    if (directName) {
      if (branchOrId.id) branchNameCache.set(String(branchOrId.id), directName);
      return directName;
    }
    // Fall back to ID inside object
    branchOrId = branchOrId.id || branchOrId.branch_id || branchOrId.value || branchOrId._id;
  }

  const str = String(branchOrId).trim();
  if (!str || str === 'undefined' || str === 'null') {
    return fallback;
  }

  // 2. Check in-memory cache
  if (branchNameCache.has(str)) {
    return branchNameCache.get(str);
  }

  // Check if string contains "Branch " prefix already (e.g. "Branch 4" or "Branch uuid")
  const stripped = str.replace(/^Branch\s+/i, '').trim();
  if (branchNameCache.has(stripped)) {
    return branchNameCache.get(stripped);
  }

  // 3. Check current user auth store
  try {
    const authState = useAuthStore.getState();
    const user = authState?.user;

    // Check user.branch or user.assigned_branch
    if (user?.branch && (String(user.branch.id) === str || String(user.branch.id) === stripped)) {
      const name = user.branch.name || user.branch.branch_name;
      if (name) {
        branchNameCache.set(str, name);
        return name;
      }
    }
    if (user?.assigned_branch && (String(user.assigned_branch.id) === str || String(user.assigned_branch.id) === stripped)) {
      const name = user.assigned_branch.name || user.assigned_branch.branch_name;
      if (name) {
        branchNameCache.set(str, name);
        return name;
      }
    }

    // Check user.institute.branches or user.branches
    const userBranches = user?.institute?.branches || user?.branches || [];
    if (Array.isArray(userBranches) && userBranches.length > 0) {
      const match = userBranches.find((b) => 
        String(b.id) === str || 
        String(b.id) === stripped || 
        String(b.value) === str ||
        String(b.code || '').toUpperCase() === str.toUpperCase()
      );
      if (match) {
        const name = match.name || match.label || match.branch_name;
        if (name) {
          branchNameCache.set(str, name);
          return name;
        }
      }
    }
  } catch (e) {}

  // 4. Check institute store
  try {
    const instituteState = useInstituteStore.getState();
    const instBranches = instituteState?.currentInstitute?.branches;
    if (Array.isArray(instBranches) && instBranches.length > 0) {
      const match = instBranches.find((b) => 
        String(b.id) === str || 
        String(b.id) === stripped || 
        String(b.value) === str ||
        String(b.code || '').toUpperCase() === str.toUpperCase()
      );
      if (match) {
        const name = match.name || match.label || match.branch_name;
        if (name) {
          branchNameCache.set(str, name);
          return name;
        }
      }
    }
  } catch (e) {}

  // 5. Check UI store active branch
  try {
    const uiState = useUIStore.getState();
    if (uiState?.activeBranchId && (String(uiState.activeBranchId) === str || String(uiState.activeBranchId) === stripped)) {
      if (uiState.activeBranchName && !uiState.activeBranchName.includes('Selected Branch')) {
        branchNameCache.set(str, uiState.activeBranchName);
        return uiState.activeBranchName;
      }
    }
  } catch (e) {}

  // 6. UUID / ID protection — NEVER display a raw UUID to the user!
  const isLikelyUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stripped) || (stripped.length >= 20 && stripped.includes('-'));
  if (isLikelyUuid) {
    try {
      const user = useAuthStore.getState()?.user;
      const branches = user?.institute?.branches || user?.branches || [];
      if (branches.length === 1 && branches[0].name) {
        return branches[0].name;
      }
    } catch (e) {}
    return fallback !== '—' && fallback !== null ? fallback : 'Main Branch';
  }

  // 7. If it's already a clean non-UUID word (e.g. "Main", "North Campus"), return it
  if (!/^[0-9]+$/.test(stripped) && stripped.length > 1 && !stripped.includes('-')) {
    return stripped;
  }

  return fallback !== '—' && fallback !== null ? fallback : (stripped ? `Branch ${stripped}` : '—');
}

/**
 * Hook to fetch and cache all institute branches globally
 */
export function useBranches() {
  const user = useAuthStore((s) => s.user);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const instituteId = currentInstitute?.id || user?.institute_id || user?.school_id;

  const { data: apiBranches = [], isLoading } = useQuery({
    queryKey: ['branches', 'global-list', instituteId],
    queryFn: async () => {
      try {
        const res = await branchService.getAll({ limit: 100, is_active: true });
        const list = res?.data?.rows ?? (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list) && list.length > 0) {
          registerBranches(list);
          return list;
        }
      } catch (err) {
        // fallback
      }
      const fallbackList = currentInstitute?.branches || user?.institute?.branches || user?.branches || [];
      registerBranches(fallbackList);
      return fallbackList;
    },
    enabled: !!instituteId,
    staleTime: 5 * 60 * 1000,
  });

  const branches = Array.isArray(apiBranches) && apiBranches.length > 0
    ? apiBranches
    : (currentInstitute?.branches || user?.institute?.branches || user?.branches || []);

  if (branches.length > 0) {
    registerBranches(branches);
  }

  return {
    branches,
    isLoading,
    getBranchName: resolveBranchName,
    registerBranches,
  };
}
