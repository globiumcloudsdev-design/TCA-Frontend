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
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch, schoolHasBranches } from '@/lib/auth';
import { DUMMY_BRANCHES } from '@/data/dummyData';

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
        setActiveBranch(assignedBranch.id, assignedBranch.name || 'Assigned Branch');
      }
    }
  }, [isBranchAdmin, assignedBranch, activeBranchId, setActiveBranch]);

  // Fetch branches for Super Admin switcher
  const { data } = useQuery({
    queryKey: ['branches', 'global-switcher'],
    queryFn: async () => {
      try {
        const res = await branchService.getAll({ limit: 100 });
        const list = res?.data?.rows ?? res?.data ?? res ?? [];
        if (Array.isArray(list) && list.length > 0) return list;
      } catch (err) {
        // fallback
      }
      return user?.institute?.branches ?? user?.branches ?? DUMMY_BRANCHES;
    },
    enabled: mounted && isSuperAdmin && hasBranches,
    staleTime: 60 * 1000,
  });

  const branches = Array.isArray(data)
    ? data
    : (data?.data?.rows ?? data?.data ?? user?.institute?.branches ?? DUMMY_BRANCHES);

  if (!mounted) return null;

  // ── 1. BRANCH ADMIN: Plain Text Display Only (No Dropdown) ───────────────────
  if (isBranchAdmin) {
    const branchDisplayName = assignedBranch?.name || user?.branch?.name || user?.branch_name || 'Assigned Branch';
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
  const currentLabel = activeBranchId
    ? (activeBranchName || branches.find((b) => String(b.id) === String(activeBranchId))?.name || 'Selected Branch')
    : 'All Branches';

  const handleSelectBranch = (branch) => {
    setActiveBranch(branch.id, branch.name);
    // Instant refresh across the entire screen
    queryClient.invalidateQueries();
    toast.success(`Switched view to ${branch.name}`);
  };

  const handleClearBranch = () => {
    clearActiveBranch();
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
              !activeBranchId ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
            )}
          >
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              <span>All Branches</span>
            </div>
            {!activeBranchId && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>

          {branches.length > 0 && <DropdownMenuSeparator className="my-1" />}

          {/* Individual Active Branches */}
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {branches.map((branch) => {
              const isSelected = String(activeBranchId) === String(branch.id);
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
                    <span className="truncate">{branch.name}</span>
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

