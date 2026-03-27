// frontend/src/stores/authStore.js

/**
 * The Clouds Academy — Auth Store (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken, setSchoolCode, clearAuthData } from "@/lib/auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ─────────────────────────────────────────
      // Set User (Login)
      // ─────────────────────────────────────────
      setUser: (user, accessToken) => {
        console.log("🔐 Setting User:", user);
        console.log("🏫 Institute with Logo:", user?.institute);
        console.log("🌿 Branch Info:", user?.branch);

        if (accessToken) setAccessToken(accessToken);
        
        // Set school code from institute
        if (user?.institute?.code) setSchoolCode(user.institute.code);
        // Fallback to old school object
        if (user?.school?.code) setSchoolCode(user.school.code);

        set({
          user,
          isAuthenticated: true,
        });
      },

      // ─────────────────────────────────────────
      // Loading State
      // ─────────────────────────────────────────
      setLoading: (val) => {
        console.log("⏳ Auth Loading:", val);
        set({ isLoading: val });
      },

      // ─────────────────────────────────────────
      // Logout
      // ─────────────────────────────────────────
      logout: () => {
        console.log("🚪 User Logged Out:", get().user);

        clearAuthData();

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // ─────────────────────────────────────────
      // Getters
      // ─────────────────────────────────────────

      isMasterAdmin: () => {
        const user = get().user;
        return user?.role_code === "MASTER_ADMIN" || user?.user_type === "MASTER_ADMIN";
      },

      permissions: () => {
        const user = get().user;
        return user?.permissions || [];
      },

      canDo: (permissionCode) => {
        const u = get().user;

        if (!u) return false;
        if (u.role_code === "MASTER_ADMIN" || u.user_type === "MASTER_ADMIN") return true;

        const perms = u.permissions || [];

        if (perms.includes("ALL")) return true;

        return perms.includes(permissionCode);
      },

      canDoAny: (codes = []) => {
        const u = get().user;

        if (!u) return false;
        if (u.role_code === "MASTER_ADMIN" || u.user_type === "MASTER_ADMIN") return true;

        const perms = u.permissions || [];

        if (perms.includes("ALL")) return true;

        return codes.some((code) => perms.includes(code));
      },

      // ✅ Updated schoolHasBranches to use institute settings
      schoolHasBranches: () => {
        const u = get().user;

        console.log("🔍 Debug - Full user object:", u);
        console.log("🔍 Debug - Institute object:", u?.institute);
        // console.log("🔍 Debug - Institute settings:", u?.institute?.settings);
        
        // Check institute settings
        const hasBranchesFromInstitute = u?.institute?.settings?.has_branches === true;
        
        // Check branch data exists
        const hasBranchData = !!u?.branch;

        console.log("🔍 Debug - hasBranchesFromInstitute:", hasBranchesFromInstitute);
        console.log("🔍 Debug - hasBranchData:", hasBranchData);

        return hasBranchesFromInstitute;
      },

      // ✅ New: Get branch info
      getBranch: () => {
        const u = get().user;
        return u?.branch || null;
      },

      // ✅ New: Check if user is in a branch
      hasBranch: () => {
        const u = get().user;
        return !!u?.branch_id || !!u?.branch;
      },

      // ✅ New: Get institute logo URL
      instituteLogo: () => {
        const u = get().user;
        return u?.institute?.logo_url || u?.school?.logo_url || null;
      },

      // ✅ New: Get full institute info
      getInstitute: () => {
        const u = get().user;
        return u?.institute || u?.school || null;
      },

      // institute type
      instituteType: () => {
        const u = get().user;

        return (
          u?.institute_type ||
          u?.institute?.institute_type ||
          u?.school?.institute_type ||
          null
        );
      },

      // dashboard redirect path (updated for branch users)
      dashboardPath: () => {
        const u = get().user;

        if (!u) return "/login";

        if (u.role_code === "MASTER_ADMIN" || u.user_type === "MASTER_ADMIN") {
          return "/master-admin";
        }

        // Branch users might have different dashboard
        if (u.branch_id || u.branch) {
          const branchPath = `/branch/${u.branch_id || u.branch?.id}/dashboard`;
          return branchPath;
        }

        const type =
          u.institute_type ||
          u.institute?.institute_type ||
          u.school?.institute_type ||
          "school";

        const PATHS = {
          school: "/school/dashboard",
          coaching: "/coaching/dashboard",
          academy: "/academy/dashboard",
          college: "/college/dashboard",
          university: "/university/dashboard",
        };

        return PATHS[type] ?? "/dashboard";
      },

      // Helper: get settings object
      settings: () => {
        const u = get().user;
        return u?.institute?.settings || u?.school?.settings || {};
      },

      // Helper: get user type display name
      userTypeName: () => {
        const u = get().user;
        const typeMap = {
          MASTER_ADMIN: 'Master Admin',
          INSTITUTE_ADMIN: 'Institute Admin',
          BRANCH_ADMIN: 'Branch Admin',
          TEACHER: 'Teacher',
          STUDENT: 'Student',
          PARENT: 'Parent',
          STAFF: 'Staff'
        };
        return typeMap[u?.user_type] || u?.user_type || 'User';
      }
    }),
    {
      name: "clouds-auth",

      // Persist only safe fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // 🔥 Runs when store loads from localStorage
      onRehydrateStorage: () => (state) => {
        console.log("♻️ Auth Store Rehydrated");
        console.log("👤 Persisted User:", state?.user);
        console.log("🏫 Persisted Institute:", state?.user?.institute);
        console.log("🌿 Persisted Branch:", state?.user?.branch);
      },
    }
  )
);

export default useAuthStore;