/**
 * School portal sidebar
 * Reads SCHOOL_NAV from constants and filters items based on user permissions.
 * Supports group headings via item.group property.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, BookMarked,
  ClipboardList, CalendarCheck, FileText, DollarSign,
  Settings, ShieldCheck, Calendar, CalendarDays, X, CreditCard,
  UserCog, GitBranch, Layers, Bell, BarChart2, FlaskConical,
} from 'lucide-react';

import { SCHOOL_NAV } from '@/constants';
import useAuthStore from '@/store/authStore';
import useUiStore from '@/store/uiStore';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  LayoutDashboard, Users, GraduationCap, BookOpen, BookMarked,
  ClipboardList, CalendarCheck, CalendarDays, FileText, DollarSign,
  Settings, ShieldCheck, Calendar, CreditCard, UserCog, GitBranch,
  Layers, Bell, BarChart2, FlaskConical,
};

export default function Sidebar() {
  const pathname      = usePathname();
  const isMaster      = useAuthStore((s) => s.isMasterAdmin());
  const canDo         = useAuthStore((s) => s.canDo);
  const roleCode      = useAuthStore((s) => s.user?.role_code);
  const sidebarOpen   = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Before mount: show all nav items so SSR and initial hydration match.
  // After mount: filter by permissions (Zustand store is hydrated from localStorage by now).
  const visibleItems = !mounted
    ? SCHOOL_NAV
    : SCHOOL_NAV.filter((item) => {
        if (!item.permission) return true;           // always visible (Dashboard)
        if (isMaster) return true;                   // Master Admin sees everything
        if (item.hideForRoles?.includes(roleCode)) return false;
        return canDo(item.permission);
      });

  // Group items by their `group` property preserving insert order
  const grouped = visibleItems.reduce((acc, item) => {
    const key = item.group ?? '__none__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* ── Mobile overlay ── */}
      {mounted && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo + Close button (mobile only) */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <span className="text-lg font-bold">☁ Clouds Academy</span>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1">
              {/* Group label — skip for ungrouped (null group) items */}
              {group !== '__none__' && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 select-none">
                  {group}
                </p>
              )}

              {items.map((item) => {
                const Icon   = ICON_MAP[item.icon] || LayoutDashboard;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { if (sidebarOpen) toggleSidebar(); }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
