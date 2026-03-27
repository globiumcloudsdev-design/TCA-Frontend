/**
 * UserMenu — Logged-in user dropdown in the navbar
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   user    { first_name, last_name, email, role }
 *   onLogout () => void
 *
 * Usage:
 *   <UserMenu user={user} onLogout={handleLogout} />
 */
'use client';

import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AvatarWithInitials from './AvatarWithInitials';

export default function UserMenu({ user, onLogout }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 hover:bg-muted transition-colors">
          <AvatarWithInitials
            firstName={user?.first_name}
            lastName={user?.last_name}
            size="sm"
          />
          <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
            {user?.first_name} {user?.last_name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <p className="text-xs text-primary mt-0.5">{user?.role?.name}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings size={14} className="mr-2" /> Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut size={14} className="mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
