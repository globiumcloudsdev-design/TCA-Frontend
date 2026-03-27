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

      /** Check if user has specific permission - FIXED VERSION */
      canDo: (permission) => {
        try {
          const { permissions, portalType } = get();

          // Debug logging
          console.log('🔍 canDo check:', { 
            permission, 
            portalType,
            permissionsCount: permissions?.length || 0,
            permissionsSample: permissions?.slice(0, 3) || []
          });

          // SAFE hasPermission function with null checks
          const hasPermission = (list = [], required) => {
            if (!required) return true;
            
            // Ensure list is array and not empty
            if (!Array.isArray(list) || list.length === 0) return false;
            
            // Filter out any null/undefined values first
            const cleanList = list.filter(item => item != null);
            
            // Check for exact match or wildcard
            if (cleanList.includes('ALL') || cleanList.includes('*') || cleanList.includes(required)) {
              return true;
            }
            
            // Check for namespace wildcards (e.g., 'dashboard.*' matches 'dashboard.view')
            // SAFE: Check if item exists and is string before calling endsWith
            return cleanList.some((p) => {
              // Skip if p is null or undefined
              if (p == null) return false;
              
              // Convert to string if it's not already (though it should be)
              const permString = String(p);
              
              // Check if it ends with .* and matches the required permission prefix
              return permString.endsWith('.*') && required.startsWith(permString.slice(0, -2));
            });
          };
          
          // If permissions array is empty or not array, use defaults
          if (!Array.isArray(permissions) || permissions.length === 0) {
            console.log('⚠️ No permissions found, using role-based defaults for:', portalType);
            
            // Teachers have specific permissions
            if (portalType === 'TEACHER') {
              const teacherDefaults = [
                'dashboard.view',
                'classes.read',
                'students.read',
                'attendance.mark',
                'timetable.view',
                'homework.create',
                'assignments.create',
                'notes.create',
                'announcements.create'
              ];
              return hasPermission(teacherDefaults, permission);
            }
            
            // Parents have view permissions
            if (portalType === 'PARENT') {
              const parentDefaults = [
                'dashboard.view',
                'attendance.view',
                'fees.view',
                'results.view',
                'announcements.view'
              ];
              return hasPermission(parentDefaults, permission);
            }
            
            // Students have self permissions
            if (portalType === 'STUDENT') {
              const studentDefaults = [
                'dashboard.view.self',
                'attendance.view.self',
                'fees.view.self',
                'results.view.self',
                'timetable.view.self',
                'assignments.view',
                'homework.view',
                'announcements.view',
                'syllabus.view'
              ];
              return hasPermission(studentDefaults, permission);
            }
            
            // Default fallback for unknown portal type
            return false;
          }

          // Clean permissions array before using
          const cleanPermissions = permissions.filter(p => p != null);
          
          // Use actual permissions if available
          console.log('✅ Using actual permissions from user, count:', cleanPermissions.length);
          return hasPermission(cleanPermissions, permission);
          
        } catch (error) {
          console.error('❌ Error in canDo permission check:', error, { permission });
          // Fail safe - return false on error
          return false;
        }
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