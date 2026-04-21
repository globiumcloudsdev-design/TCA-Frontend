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
// export function useInstituteNav() {
//   const { nav } = useInstituteConfig();
//   const canDo = useAuthStore((s) => s.canDo);
//   const schoolHasBranches = useAuthStore((s) => s.schoolHasBranches);
//   const user = useAuthStore((s) => s.user);

//   const filteredNav = useMemo(() => {
//     // Basic dependency check
//     if (!nav) return [];

//     return nav.filter((item) => {
//       // Permission check
//       if (item.permission) {
//         if (!canDo(item.permission)) return false;
//       }

//       // Branches check
//       if (item.requiresBranches) {
//         if (!schoolHasBranches()) return false;
//       }

//       return true;
//     });
//   }, [nav, canDo, schoolHasBranches, user]);

//   return filteredNav;
// }




export function useInstituteNav() {
  const { nav } = useInstituteConfig();
  const canDo = useAuthStore((s) => s.canDo);
  const schoolHasBranches = useAuthStore((s) => s.schoolHasBranches);
  const currentBranch = useAuthStore((s) => s.branch); // ✅ add this line
  const user = useAuthStore((s) => s.user);

  const filteredNav = useMemo(() => {
    if (!nav) return [];

    return nav.filter((item) => {
      // Permission check
      if (item.permission) {
        if (!canDo(item.permission)) return false;
      }

      // Branches check
      if (item.requiresBranches) {
        if (!schoolHasBranches()) return false;
        // ✅ Agar school ke branches hain, lekin current branch main nahi hai to hide karo
        if (currentBranch && !currentBranch.is_main) return false;
      }

      return true;
    });
  }, [nav, canDo, schoolHasBranches, currentBranch, user]);

  return filteredNav;
}