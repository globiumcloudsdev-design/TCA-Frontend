'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitBranch, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import { branchService } from '@/services';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * BranchSwitcher — shown in the school Navbar.
 *
 * • School Admin (BRANCH_READ permission) → interactive dropdown
 *   - "All Branches" resets the filter
 *   - Selecting a branch scopes all queries to that branch
 *
 * • Branch Admin → static badge showing their assigned branch
 */
export default function BranchSwitcher() {
  const { canDo, schoolHasBranches, user } = useAuthStore();
  const { activeBranchId, activeBranchName, setActiveBranch, clearActiveBranch } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch branch list for the switcher dropdown (School Admin only)
  const { data } = useQuery({
    queryKey: ['branches', 'switcher'],
    queryFn: () => branchService.getAll({ limit: 100 }),
    enabled: mounted && schoolHasBranches() && canDo(PERMISSIONS.BRANCH_READ),
    staleTime: 5 * 60 * 1000,
  });

  const branches = data?.data?.rows ?? data?.data ?? data ?? [];

  if (!mounted || !schoolHasBranches()) return null;

  // ── Branch Admin: readonly badge ─────────────────────────────────────────────
  if (!canDo(PERMISSIONS.BRANCH_READ) || user?.role_code === 'BRANCH_ADMIN') {
    const label = user?.branch?.name ?? activeBranchName ?? 'My Branch';
    return (
      <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
        <GitBranch className="h-3 w-3" />
        {label}
      </Badge>
    );
  }

  // ── School Admin: interactive dropdown ──────────────────────────────────────
  const currentLabel = activeBranchName ?? 'All Branches';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex h-8 items-center gap-1.5 text-xs font-medium max-w-[160px]"
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]">
        {/* All branches option */}
        <DropdownMenuItem
          onSelect={clearActiveBranch}
          className={cn('gap-2', !activeBranchId && 'font-semibold')}
        >
          <Check className={cn('h-3.5 w-3.5', activeBranchId ? 'opacity-0' : 'opacity-100')} />
          All Branches
        </DropdownMenuItem>

        {branches.length > 0 && <DropdownMenuSeparator />}

        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onSelect={() => setActiveBranch(branch.id, branch.name)}
            className={cn('gap-2', activeBranchId === branch.id && 'font-semibold')}
          >
            <Check
              className={cn('h-3.5 w-3.5', activeBranchId === branch.id ? 'opacity-100' : 'opacity-0')}
            />
            {branch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
