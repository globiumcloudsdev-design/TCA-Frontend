/**
 * The Clouds Academy — Institute Store (Zustand)
 * 
 * Manages current institute/school context and settings
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAuthStore from "./authStore";

export const useInstituteStore = create(
  persist(
    (set, get) => ({
      // Current institute/school being viewed/used
      currentInstitute: null,
      
      // List of institutes user has access to (for super admin)
      institutes: [],
      
      // Loading states
      isLoading: false,
      
      // Error state
      error: null,

      // ─────────────────────────────────────────
      // Set Current Institute
      // ─────────────────────────────────────────
      setCurrentInstitute: (institute) => {
        set({ 
          currentInstitute: institute,
          error: null 
        });
      },

      // ─────────────────────────────────────────
      // Set Institutes List
      // ─────────────────────────────────────────
      setInstitutes: (institutes) => {
        // console.log("📋 Setting Institutes List:", institutes);
        set({ institutes });
      },

      // ─────────────────────────────────────────
      // Loading State
      // ─────────────────────────────────────────
      setLoading: (val) => {
        // console.log("⏳ Institute Loading:", val);
        set({ isLoading: val });
      },

      // ─────────────────────────────────────────
      // Set Error
      // ─────────────────────────────────────────
      setError: (error) => {
        console.error("❌ Institute Error:", error);
        set({ error });
      },

      // ─────────────────────────────────────────
      // Clear Institute Data
      // ─────────────────────────────────────────
      clearInstituteData: () => {
        // console.log("🧹 Clearing Institute Data");
        set({
          currentInstitute: null,
          institutes: [],
          error: null
        });
      },

      // ─────────────────────────────────────────
      // Initialize from Auth Store
      // ─────────────────────────────────────────
      initializeFromAuth: () => {
        const authUser = useAuthStore.getState().user;
        
        if (authUser) {
          // Check if user has institute/school
          const institute = authUser.institute || authUser.school || null;
          
          if (institute) {
            // console.log("🔄 Initializing Institute from Auth:", institute);
            set({ currentInstitute: institute });
          }
          
          // For super admin, might have multiple institutes
          if (authUser.institutes) {
            set({ institutes: authUser.institutes });
          }
        }
      },

      // ─────────────────────────────────────────
      // Getters
      // ─────────────────────────────────────────

      // Get institute ID
      instituteId: () => {
        return get().currentInstitute?.id || null;
      },

      // Get institute type
      instituteType: () => {
        return get().currentInstitute?.institute_type || null;
      },

      // Get institute name
      instituteName: () => {
        return get().currentInstitute?.name || '';
      },

      // Get institute code
      instituteCode: () => {
        return get().currentInstitute?.code || '';
      },

      // Get institute logo
      instituteLogo: () => {
        return get().currentInstitute?.logo_url || null;
      },

      // Get institute settings
      settings: () => {
        return get().currentInstitute?.settings || {};
      },

      // Check if institute has branches
      hasBranches: () => {
        const settings = get().currentInstitute?.settings || {};
        return settings.has_branches === true;
      },

      // Check if institute has multiple campuses
      hasCampuses: () => {
        const settings = get().currentInstitute?.settings || {};
        return settings.has_campuses === true;
      },

      // Get academic year settings
      academicYearSettings: () => {
        const settings = get().currentInstitute?.settings?.academic_year || {};
        return {
          startMonth: settings.start_month || 4, // April default
          endMonth: settings.end_month || 3,     // March default
          format: settings.format || 'YYYY-YYYY',
          ...settings
        };
      },

      // Get fee settings
      feeSettings: () => {
        const settings = get().currentInstitute?.settings?.fee || {};
        return {
          currency: settings.currency || 'PKR',
          lateFeePercentage: settings.late_fee_percentage || 0,
          fineAfterDays: settings.fine_after_days || 10,
          ...settings
        };
      },

      // Get exam settings
      examSettings: () => {
        const settings = get().currentInstitute?.settings?.exam || {};
        return {
          gradingSystem: settings.grading_system || 'percentage',
          passingPercentage: settings.passing_percentage || 40,
          ...settings
        };
      },

      // Get attendance settings
      attendanceSettings: () => {
        const settings = get().currentInstitute?.settings?.attendance || {};
        return {
          requiredPercentage: settings.required_percentage || 75,
          markingFrequency: settings.marking_frequency || 'daily',
          ...settings
        };
      },

      // Check if a feature is enabled
      isFeatureEnabled: (featureKey) => {
        const features = get().currentInstitute?.settings?.features || {};
        return features[featureKey] === true;
      },

      // Get all enabled features
      enabledFeatures: () => {
        const features = get().currentInstitute?.settings?.features || {};
        return Object.keys(features).filter(key => features[key] === true);
      },

      // Check if current institute is loaded
      isReady: () => {
        return !!get().currentInstitute;
      },

      // Get branch/campus options
      branchOptions: () => {
        const branches = get().currentInstitute?.branches || [];
        return branches.map(branch => ({
          value: branch.id,
          label: branch.name,
          code: branch.code
        }));
      },
    }),
    {
      name: "clouds-institute",
      
      // Persist only necessary fields
      partialize: (state) => ({
        currentInstitute: state.currentInstitute,
        institutes: state.institutes,
      }),

      // Runs when store loads from localStorage
      onRehydrateStorage: () => (state) => {
        // console.log("♻️ Institute Store Rehydrated");
        console.log("🏢 Current Institute:", state?.currentInstitute);
      },
    }
  )
);

// Auto-initialize from auth store when auth changes
if (typeof window !== 'undefined') {
  // Subscribe to auth store changes
  useAuthStore.subscribe((state) => {
    if (state.user) {
      useInstituteStore.getState().initializeFromAuth();
    } else {
      useInstituteStore.getState().clearInstituteData();
    }
  });

  // Initial check
  setTimeout(() => {
    if (useAuthStore.getState().user) {
      useInstituteStore.getState().initializeFromAuth();
    }
  }, 100);
}

export default useInstituteStore;



