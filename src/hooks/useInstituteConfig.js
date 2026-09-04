/**
 * useInstituteConfig — Custom React Hook
 *
 * Zustand authStore se logged-in user ka institute_type padhke
 * uske liye complete config return karta hai:
 *   terms, nav, dashboardPath, feeStructure, attendanceConfig, studentColumns
 *
 * Usage:
 *   const { terms, nav, dashboardPath } = useInstituteConfig();
 *   <h1>{terms.students}</h1>   → "Students" | "Candidates" | "Trainees" etc.
 */

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { getInstituteConfig, getTypeFromPath } from '@/config/instituteConfig';

export default function useInstituteConfig() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const config = useMemo(() => {
    // 1st priority: user object mein institute_type stored hai
    const fromUser = user?.institute_type || user?.school?.institute_type || user?.institute?.institute_type;

    // 2nd priority: current URL path se detect karein (/coaching/dashboard → 'coaching')
    const fromPath = getTypeFromPath(pathname);

    const resolvedType = fromUser || fromPath || 'school';
    return getInstituteConfig(resolvedType);
  }, [user, pathname]);

  return config;
}

/**
 * useTerm(key) — sirf ek term chahiye ho to shorthand
 *
 * Usage:
 *   const studentLabel = useTerm('students');  → 'Candidates'
 */
export function useTerm(key) {
  const { terms } = useInstituteConfig();
  return terms[key] ?? key;
}

/**
 * useInstituteNav() — filtered nav items (permission-aware)
 *
 * Usage:
 *   const navItems = useInstituteNav();
 */
import { isBranchAdmin as checkIsBranchAdmin, schoolHasBranches as checkSchoolHasBranches } from '@/lib/auth';

export function useInstituteNav() {
  const { nav } = useInstituteConfig();
  const user = useAuthStore((s) => s.user);

  const filteredNav = useMemo(() => {
    if (!Array.isArray(nav)) return [];
    const isBranchAdmin = checkIsBranchAdmin(user);
    const hasBranches = checkSchoolHasBranches(user);

    return nav.filter((item) => {
      // 1. Branch Admin is strictly locked out of Branch Management
      if (isBranchAdmin) {
        if (item.href?.includes('/branches')) return false;
        if (item.superAdminOnly === true) return false;
        if (item.hideForRoles?.includes('BRANCH_ADMIN')) return false;
      }

      // 2. Hide branch-dependent items if institute doesn't have multiple branches
      if (item.requiresBranches && !hasBranches) {
        return false;
      }

      return true;
    });
  }, [nav, user]);

  return filteredNav;
}