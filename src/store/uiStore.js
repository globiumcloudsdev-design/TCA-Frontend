/**
 * The Clouds Academy — UI Store (Zustand)
 *
 * Holds UI state: sidebar collapse, active branch (for branch-enabled schools),
 * current academic year context, and notification badge count.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setActiveBranch } from '@/lib/auth';

export const useUIStore = create(
  persist(
    (set) => ({
      // Sidebar — false by default so mobile starts with it closed
      // (Desktop always shows sidebar via CSS md:translate-x-0 regardless)
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      // Active Branch (only relevant when school.has_branches = true)
      // null means school-wide scope
      activeBranchId: null,
      activeBranchName: null,
      setActiveBranch: (id, name) => {
        setActiveBranch(id); // also stores in localStorage for api.js interceptor
        set({ activeBranchId: id, activeBranchName: name });
      },
      clearActiveBranch: () => {
        setActiveBranch(null);
        set({ activeBranchId: null, activeBranchName: null });
      },

      // Current Academic Year context
      activeAcademicYearId: null,
      activeAcademicYearName: null,
      setActiveAcademicYear: (id, name) =>
        set({ activeAcademicYearId: id, activeAcademicYearName: name }),

      // Notification badge
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
      clearUnread: () => set({ unreadCount: 0 }),
    }),
    {
      name: 'clouds-ui',
      // sidebarOpen is intentionally NOT persisted — always starts closed on reload.
      // Desktop shows sidebar via CSS (md:translate-x-0) regardless of this state.
      partialize: (s) => ({
        activeBranchId: s.activeBranchId,
        activeBranchName: s.activeBranchName,
        activeAcademicYearId: s.activeAcademicYearId,
        activeAcademicYearName: s.activeAcademicYearName,
      }),
    }
  )
);

// Alias — some files import as useUiStore (lowercase i)
export const useUiStore = useUIStore;

export default useUIStore;
