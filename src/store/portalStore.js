// src/store/portalStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePortalStore = create(
  persist(
    (set, get) => ({
      portalUser:    null,
      portalType:    null,          // 'PARENT' | 'STUDENT' | 'TEACHER'
      instituteType: null,          // 'school' | 'coaching' | 'academy' | 'college' | 'university'
      permissions:   [],             // User permissions
      isLoading:     false,
      _hasHydrated:  false,

      setPortalUser: (user, type, instType) => {
        // Check if user has permissions from the API
        const userPermissions = user?.permissions || [];
        
        // Filter out any null/undefined values
        const cleanPermissions = userPermissions.filter(p => p != null);
        
        // Log for debugging
        console.log('🎯 Setting portal user:', { 
          type, 
          hasPermissions: cleanPermissions.length > 0,
          permissionCount: cleanPermissions.length,
          firstFewPermissions: cleanPermissions.slice(0, 3)
        });
        
        set({
          portalUser: user,
          portalType: type,
          instituteType: instType || user?.institute?.institute_type || user?.school?.institute_type || 'school',
          permissions: cleanPermissions,
        });
      },

      updatePortalUser: (updates) => {
        set((state) => {
          if (!state.portalUser) return {};
          return {
            portalUser: {
              ...state.portalUser,
              ...updates
            }
          };
        });
      },

      clearPortal: () => set({ 
        portalUser: null, 
        portalType: null, 
        instituteType: null,
        permissions: []
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      /** Convenience getter — always returns a non-null string */
      getInstituteType: () =>
        get().instituteType || get().portalUser?.institute?.institute_type || get().portalUser?.school?.institute_type || 'school',

      /** Check if user has specific permission — Bypassed */
      canDo: (permission) => {
        // Bypass all permissions — return true for all portal permission checks
        return true;
      },

      /** Get user display name */
      displayName: () => {
        const user = get().portalUser;
        if (!user) return '';
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '';
      },

      /** Get user role display */
      roleDisplay: () => {
        const { portalType } = get();
        const display = {
          STUDENT: 'Student',
          PARENT: 'Parent',
          TEACHER: 'Teacher'
        };
        return display[portalType] || portalType || '';
      },
    }),
    {
      name: 'portal-session',
      partialize: (state) => ({
        portalUser: state.portalUser,
        portalType: state.portalType,
        instituteType: state.instituteType,
        permissions: state.permissions, // Also persist permissions
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          // Clean permissions on rehydrate
          if (state.permissions && Array.isArray(state.permissions)) {
            state.permissions = state.permissions.filter(p => p != null);
          }
          console.log('♻️ Portal store rehydrated with permissions:', state.permissions?.length || 0);
        }
      },
    },
  ),
);

export default usePortalStore;