'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown, Check, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { branchService } from '@/services';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch, schoolHasBranches, getMainBranch } from '@/lib/auth';
import { resolveBranchName, registerBranches } from '@/lib/branchUtils';

/**
 * BranchSwitcher — Global Branch Selector in Header/Navbar
 *
 * Requirements:
 * 1. Super Admin:
 *    - Prominent "Branch Selector" dropdown menu listing "All Branches" and active campuses.
 *    - Switching triggers instant query invalidation / screen refresh for that branch context.
 *
 * 2. Branch Admin:
 *    - Dropdown menu is completely hidden / removed.
 *    - Displays plain text: "Logged into: [Branch Name]" with no ability to switch.
 */
export default function BranchSwitcher({ className = '' }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeBranchId, activeBranchName, setActiveBranch, clearActiveBranch } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBranchAdmin = checkIsBranchAdmin(user);
  const isSuperAdmin = !isBranchAdmin;
  const assignedBranch = getAssignedBranch(user);
  const hasBranches = schoolHasBranches(user);

  // Auto-scope Branch Admin if not already scoped
  useEffect(() => {
    if (isBranchAdmin && assignedBranch?.id) {
      if (activeBranchId !== assignedBranch.id) {
        const bName = resolveBranchName(assignedBranch.id, assignedBranch.name || 'Assigned Branch');
        setActiveBranch(assignedBranch.id, bName);
      }
    }
  }, [isBranchAdmin, assignedBranch, activeBranchId, setActiveBranch]);

  // Fetch branches for Super Admin switcher
  const { data } = useQuery({
    queryKey: ['branches', 'global-switcher'],
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
      const fallbackList = user?.institute?.branches ?? user?.branches ?? [];
      registerBranches(fallbackList);
      return fallbackList;
    },
    enabled: mounted && isSuperAdmin && hasBranches,
    staleTime: 60 * 1000,
  });

  const rawBranches = Array.isArray(data)
    ? data
    : (data?.data?.rows ?? (Array.isArray(data?.data) ? data.data : (user?.institute?.branches ?? user?.branches ?? [])));
  const branches = Array.isArray(rawBranches) ? rawBranches : [];

  if (branches.length > 0) {
    registerBranches(branches);
  }

  // Auto-scope Super Admin to Main Branch if not yet initialized
  useEffect(() => {
    if (!mounted || !isSuperAdmin || !hasBranches) return;
    const isUninitialized = !activeBranchId || activeBranchId === 'null' || activeBranchId === 'undefined';
    if (isUninitialized && branches.length > 0) {
      const main =
        getMainBranch(user) ||
        branches.find((b) => b.is_main === true) ||
        branches.find((b) => {
          const code = String(b.code || '').toUpperCase();
          const name = String(b.name || '').toLowerCase();
          return code.endsWith('-MAIN') || code === 'MAIN' || name.includes('main');
        }) ||
        branches[0];

      if (main?.id) {
        const bName = resolveBranchName(main, main.name || 'Main Branch');
        setActiveBranch(main.id, bName);
      }
    }
  }, [mounted, isSuperAdmin, hasBranches, activeBranchId, branches, user, setActiveBranch]);

  if (!mounted) return null;

  // ── 1. BRANCH ADMIN: Plain Text Display Only (No Dropdown) ───────────────────
  if (isBranchAdmin) {
    const branchDisplayName = resolveBranchName(
      assignedBranch?.id || user?.branch_id,
      assignedBranch?.name || user?.branch?.name || user?.branch_name || 'Assigned Branch'
    );
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-2.5 py-1.5 rounded-md bg-muted/60 border border-border/50 select-none shadow-xs",
          className
        )}
        title={`Logged into: ${branchDisplayName}`}
      >
        <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0" />
        <span className="truncate max-w-[200px]">
          Logged into: <strong className="text-foreground font-semibold">{branchDisplayName}</strong>
        </span>
      </div>
    );
  }

  // ── 2. SUPER ADMIN: Interactive Dropdown Branch Selector ─────────────────────
  const isAllBranches = !activeBranchId || activeBranchId === 'all';
  const currentLabel = !isAllBranches
    ? (resolveBranchName(activeBranchId, activeBranchName && !activeBranchName.includes('Selected Branch') ? activeBranchName : null) || 'Selected Branch')
    : 'All Branches';

  const handleSelectBranch = (branch) => {
    const bName = resolveBranchName(branch, branch.name || 'Branch');
    setActiveBranch(branch.id, bName);
    // Instant refresh across the entire screen
    queryClient.invalidateQueries();
    toast.success(`Switched view to ${bName}`);
  };

  const handleClearBranch = () => {
    // Explicitly set 'all' for All Branches global view
    setActiveBranch('all', 'All Branches');
    // Instant refresh across the entire screen
    queryClient.invalidateQueries();
    toast.success('Viewing All Branches (Global View)');
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Branch Selector: ${currentLabel}`}
            className="h-8.5 px-3 flex items-center gap-2 text-xs font-semibold bg-background hover:bg-accent/60 border-primary/20 shadow-xs hover:border-primary/40 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[180px] font-medium text-foreground">
              {currentLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-md">
          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
            Branch Selector
          </DropdownMenuLabel>

          {/* All Branches Global View */}
          <DropdownMenuItem
            onClick={handleClearBranch}
            className={cn(
              'flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer text-xs transition-colors',
              isAllBranches ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
            )}
          >
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              <span>All Branches</span>
            </div>
            {isAllBranches && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>

          {branches.length > 0 && <DropdownMenuSeparator className="my-1" />}

          {/* Individual Active Branches */}
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {branches.map((branch) => {
              const isSelected = !isAllBranches && String(activeBranchId) === String(branch.id);
              return (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer text-xs transition-colors',
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{resolveBranchName(branch, branch.name || 'Branch')}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

