// frontend/src/store/authStore.js

/**
 * The Clouds Academy — Auth Store (Zustand)
 * Complete with all settings and policy methods
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken, setSchoolCode, clearAuthData } from "@/lib/auth";
import { settingService } from "@/services/settingService";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // =========================================================
      // STATE
      // =========================================================
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // =========================================================
      // CORE METHODS
      // =========================================================
      
      /**
       * Set user after login
       */
      setUser: (user, accessToken) => {
        console.log("🔐 Setting User:", user);
        console.log("🏫 Institute:", user?.institute);
        console.log("🌿 Branch:", user?.branch);

        if (accessToken) setAccessToken(accessToken);
        
        if (user?.institute?.code) setSchoolCode(user.institute.code);
        if (user?.school?.code) setSchoolCode(user.school.code);

        set({
          user,
          isAuthenticated: true,
        });
      },

      /**
       * Set loading state
       */
      setLoading: (val) => {
        set({ isLoading: val });
      },

      /**
       * Logout user
       */
      logout: () => {
        console.log("🚪 User Logged Out:", get().user);
        clearAuthData();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * Refresh user data from server (after updates)
       */
      refreshUserData: async () => {
        try {
          const response = await settingService.refreshUserData();
          if (response.success && response.data) {
            const currentUser = get().user;
            const updatedUser = {
              ...currentUser,
              ...response.data,
              institute: response.data.institute || currentUser?.institute,
              branch: response.data.branch || currentUser?.branch
            };
            
            set({ user: updatedUser });
            console.log("🔄 User data refreshed successfully");
            return true;
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
          return false;
        }
      },

      // =========================================================
      // SETTINGS UPDATE METHODS (Realtime Store Updates)
      // =========================================================
      
      /**
       * Update entire institute settings object
       */
      setInstituteSettings: (updatedSettings) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = {
          ...currentUser,
          institute: {
            ...currentUser.institute,
            settings: {
              ...currentUser.institute?.settings,
              ...updatedSettings
            }
          }
        };

        console.log("🔄 Updating Institute Settings:", updatedSettings);
        set({ user: updatedUser });
      },

      /**
       * Update specific settings section (academic, timings, finance, etc.)
       */
      updateSettingSection: (sectionName, sectionData) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const currentSettings = currentUser.institute?.settings || {};
        
        const updatedUser = {
          ...currentUser,
          institute: {
            ...currentUser.institute,
            settings: {
              ...currentSettings,
              [sectionName]: {
                ...currentSettings[sectionName],
                ...sectionData
              }
            }
          }
        };

        console.log(`🔄 Updating ${sectionName} section:`, sectionData);
        set({ user: updatedUser });
      },

      /**
       * Update institute logo URL
       */
      setInstituteLogo: (logoUrl) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = {
          ...currentUser,
          institute: {
            ...currentUser.institute,
            logo_url: logoUrl
          }
        };

        console.log("🔄 Updating Institute Logo:", logoUrl);
        set({ user: updatedUser });
      },

      /**
       * Update institute name
       */
      setInstituteName: (name) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = {
          ...currentUser,
          institute: {
            ...currentUser.institute,
            name: name
          }
        };

        console.log("🔄 Updating Institute Name:", name);
        set({ user: updatedUser });
      },

      /**
       * Enable/disable a module
       */
      setModuleEnabled: (moduleName, enabled) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const currentModules = currentUser.institute?.settings?.modules || {};
        
        const updatedUser = {
          ...currentUser,
          institute: {
            ...currentUser.institute,
            settings: {
              ...currentUser.institute?.settings,
              modules: {
                ...currentModules,
                [moduleName]: {
                  ...currentModules[moduleName],
                  enabled: enabled
                }
              }
            }
          }
        };

        console.log(`🔄 Module ${moduleName} set to:`, enabled);
        set({ user: updatedUser });
      },

      // =========================================================
      // GETTERS - Institute Info
      // =========================================================
      
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
        if (!Array.isArray(perms)) return false;
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

      schoolHasBranches: () => {
        const u = get().user;
        return u?.institute?.settings?.has_branches === true;
      },

      getBranch: () => {
        const u = get().user;
        return u?.branch || null;
      },

      hasBranch: () => {
        const u = get().user;
        return !!u?.branch_id || !!u?.branch;
      },

      instituteLogo: () => {
        const u = get().user;
        return u?.institute?.logo_url || u?.school?.logo_url || null;
      },

      getInstitute: () => {
        const u = get().user;
        return u?.institute || u?.school || null;
      },

      instituteType: () => {
        const u = get().user;
        return u?.institute_type || u?.institute?.institute_type || u?.school?.institute_type || "school";
      },

      dashboardPath: () => {
        const u = get().user;
        if (!u) return "/login";
        if (u.role_code === "MASTER_ADMIN" || u.user_type === "MASTER_ADMIN") {
          return "/master-admin";
        }
        if (u.branch_id || u.branch) {
          return `/branch/${u.branch_id || u.branch?.id}/dashboard`;
        }
        const type = get().instituteType();
        const PATHS = {
          school: "/school/dashboard",
          coaching: "/coaching/dashboard",
          academy: "/academy/dashboard",
          college: "/college/dashboard",
          university: "/university/dashboard",
        };
        return PATHS[type] ?? "/dashboard";
      },

      settings: () => {
        const u = get().user;
        return u?.institute?.settings || u?.school?.settings || {};
      },

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
      },

      // =========================================================
      // GETTERS - Settings Sections
      // =========================================================
      
      instituteSettings: () => {
        const u = get().user;
        return u?.institute?.settings || u?.school?.settings || {};
      },

      getSettingSection: (sectionName) => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings[sectionName] || {};
      },

      academicSettings: () => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings.academic || {};
      },

      timingsSettings: () => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings.timings || {};
      },

      financeSettings: () => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings.finance || {};
      },

      communicationSettings: () => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings.communication || {};
      },

      moduleSettings: () => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        return settings.modules || {};
      },

      isModuleEnabled: (moduleName) => {
        const u = get().user;
        const settings = u?.institute?.settings || u?.school?.settings || {};
        const modules = settings.modules || {};
        return modules[moduleName]?.enabled === true;
      },

      // =========================================================
      // GETTERS - Policies
      // =========================================================
      
      getAllPolicies: () => {
        const u = get().user;
        return u?.institute?.policies?.all || [];
      },

      getPoliciesByType: (policyType) => {
        const u = get().user;
        return u?.institute?.policies?.by_type?.[policyType] || [];
      },

      getLatestPolicy: (policyType) => {
        const u = get().user;
        return u?.institute?.policies?.latest?.[policyType] || null;
      },

      getPolicyConfig: (policyType, key = null) => {
        const policy = get().getLatestPolicy(policyType);
        if (!policy || !policy.config) return key ? null : {};
        return key ? policy.config[key] : policy.config;
      },

      // =========================================================
      // GETTERS - Branches
      // =========================================================
      
      getBranches: () => {
        const u = get().user;
        return u?.institute?.branches || [];
      },

      getMainBranch: () => {
        const u = get().user;
        const branches = u?.institute?.branches || [];
        return branches.find(b => b.is_main === true) || null;
      },
    }),
    {
      name: "clouds-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("♻️ Auth Store Rehydrated");
        console.log("👤 User:", state?.user?.first_name);
        console.log("🏫 Institute:", state?.user?.institute?.name);
      },
    }
  )
);

export default useAuthStore;