// // /**
// //  * InstituteLayoutWrapper
// //  * Har institute type ke liye adaptive sidebar + header wrapper
// //  *
// //  * Responsive behaviour:
// //  *   Mobile  (< lg) : sidebar hidden by default; hamburger button opens it as
// //  *                    a slide-in overlay with a dark backdrop.
// //  *   Desktop (≥ lg) : sidebar always visible, collapsible to icon-only (w-16).
// //  */
// // 'use client';

// // import { useState, useEffect, useMemo } from 'react';
// // import Link from 'next/link';
// // import { usePathname, useRouter } from 'next/navigation';
// // import { cn } from '@/lib/utils';
// // import useAuthStore from '@/store/authStore';
// // import { useInstituteNav } from '@/hooks/useInstituteConfig';
// // import useInstituteConfig from '@/hooks/useInstituteConfig';
// // import * as Icons from 'lucide-react';
// // import { toast } from 'sonner';
// // import { authService } from '@/services';
// // import { Button } from '@/components/ui/button';

// // export default function InstituteLayoutWrapper({ children }) {
// //   const [collapsed,   setCollapsed]   = useState(false);   // desktop collapse
// //   const [mobileOpen,  setMobileOpen]  = useState(false);   // mobile drawer
// //   const [mounted,     setMounted]     = useState(false);
// //   const pathname  = usePathname();
// //   const router    = useRouter();

// //   useEffect(() => { setMounted(true); }, []);

// //   // Close mobile drawer on route change
// //   useEffect(() => { setMobileOpen(false); }, [pathname]);

// //   const user          = useAuthStore((s) => s.user);
// //   const logout        = useAuthStore((s) => s.logout);
// //   const getDashPath   = useAuthStore((s) => s.dashboardPath);
// //   const dashboardPath = mounted ? getDashPath() : '/login';

// //   const { typeDefinition } = useInstituteConfig();
// //   const allNavItems  = useInstituteNav();

// //   const navItems     = mounted ? allNavItems : [];

// //   const grouped = useMemo(() => {
// //     return navItems.reduce((acc, item) => {
// //       acc[item.group] = acc[item.group] ?? [];
// //       acc[item.group].push(item);
// //       return acc;
// //     }, {});
// //   }, [navItems]);

// //   const handleLogout = async () => {
// //     try { await authService.logout(); } catch (_) { /* ignore */ }
// //     finally { logout(); router.replace('/login'); toast.success('Logged out'); }
// //   };

// //   // ─── Sidebar inner content (shared between desktop + mobile drawer) ──────
// //   function SidebarContent({ isCollapsed }) {
// //     return (
// //       <>
// //         {/* Logo / Institute name */}
// //         <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
// //           {typeDefinition && <span className="text-xl">{typeDefinition.icon}</span>}
// //           {!isCollapsed && (
// //             <div className="min-w-0 flex-1">
// //               <p className="truncate text-sm font-semibold leading-tight">
// //                 {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
// //               </p>
// //               <p className="text-[10px] text-muted-foreground">
// //                 {typeDefinition?.label ?? 'Institute'}
// //               </p>
// //             </div>
// //           )}
// //           {/* Desktop collapse toggle — hidden on mobile */}
// //           <Button
// //             onClick={() => setCollapsed((v) => !v)}
// //             className="hidden lg:block ml-auto text-muted-foreground hover:text-foreground shrink-0"
// //             aria-label="Toggle sidebar"
// //           >
// //             <Icons.PanelLeft size={16} />
// //           </Button>
// //           {/* Mobile close button — hidden on desktop */}
// //           <Button
// //             onClick={() => setMobileOpen(false)}
// //             className="lg:hidden ml-auto text-muted-foreground hover:text-foreground shrink-0"
// //             aria-label="Close menu"
// //           >
// //             <Icons.X size={16} />
// //           </Button>
// //         </div>

// //         {/* Nav items */}
// //         <nav className="flex-1 overflow-y-auto py-2">
// //           {Object.entries(grouped).map(([group, items]) => (
// //             <div key={group} className="mb-1">
// //               {!isCollapsed && (
// //                 <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
// //                   {group}
// //                 </p>
// //               )}
// //               {items.map((item) => {
// //                 const Icon = Icons[item.icon] ?? Icons.Circle;
// //                 const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
// //                 return (
// //                   <Link
// //                     key={item.href}
// //                     href={item.href}
// //                     className={cn(
// //                       'flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
// //                       isCollapsed ? 'justify-center' : '',
// //                       isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
// //                     )}
// //                     title={isCollapsed ? item.label : undefined}
// //                   >
// //                     <Icon size={16} className="shrink-0" />
// //                     {!isCollapsed && <span className="truncate">{item.label}</span>}
// //                   </Link>
// //                 );
// //               })}
// //             </div>
// //           ))}
// //         </nav>

// //         {/* User + logout */}
// //         <div className="shrink-0 border-t p-3">
// //           {!isCollapsed ? (
// //             <div className="flex items-center gap-2">
// //               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
// //                 {user?.first_name?.[0]}{user?.last_name?.[0]}
// //               </div>
// //               <div className="min-w-0 flex-1">
// //                 <p className="truncate text-xs font-semibold">{user?.first_name} {user?.last_name}</p>
// //                 <p className="truncate text-[10px] text-muted-foreground">{user?.role?.name}</p>
// //               </div>
// //               <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground" title="Logout">
// //                 <Icons.LogOut size={14} />
// //               </button>
// //             </div>
// //           ) : (
// //             <button onClick={handleLogout} className="flex w-full justify-center text-muted-foreground hover:text-foreground" title="Logout">
// //               <Icons.LogOut size={16} />
// //             </button>
// //           )}
// //         </div>
// //       </>
// //     );
// //   }

// //   return (
// //     <div className="flex h-screen overflow-hidden bg-background">

// //       {/* ══════ MOBILE OVERLAY BACKDROP ══════ */}
// //       {mobileOpen && (
// //         <div
// //           className="fixed inset-0 z-40 bg-black/50 lg:hidden"
// //           onClick={() => setMobileOpen(false)}
// //           aria-hidden="true"
// //         />
// //       )}

// //       {/* ══════ MOBILE SIDEBAR DRAWER ══════ */}
// //       <aside
// //         className={cn(
// //           'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:hidden',
// //           mobileOpen ? 'translate-x-0' : '-translate-x-full',
// //         )}
// //       >
// //         <SidebarContent isCollapsed={false} />
// //       </aside>

// //       {/* ══════ DESKTOP SIDEBAR ══════ */}
// //       <aside
// //         className={cn(
// //           'hidden lg:flex flex-col border-r bg-card transition-all duration-200 shrink-0',
// //           collapsed ? 'w-16' : 'w-60',
// //         )}
// //       >
// //         <SidebarContent isCollapsed={collapsed} />
// //       </aside>

// //       {/* ══════════════ MAIN CONTENT ══════════════ */}
// //       <main className="flex flex-1 flex-col overflow-hidden min-w-0">
// //         {/* Top Header */}
// //         <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
// //           {/* Hamburger — mobile only */}
// //           <button
// //             onClick={() => setMobileOpen(true)}
// //             className="lg:hidden text-muted-foreground hover:text-foreground"
// //             aria-label="Open menu"
// //           >
// //             <Icons.Menu size={20} />
// //           </button>

// //           {/* Institute code / breadcrumb area */}
// //           <div className="flex flex-1 items-center gap-3 min-w-0">
// //             <Link href={dashboardPath} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground lg:hidden">
// //               {typeDefinition && <span className="text-base">{typeDefinition.icon}</span>}
// //               <span className="truncate text-sm font-semibold">
// //                 {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
// //               </span>
// //             </Link>
// //           </div>

// //           <div className="flex shrink-0 items-center gap-2">
// //             <span className="text-xs text-muted-foreground hidden sm:block">
// //               {user?.school?.code || user?.institute?.code}
// //             </span>
// //           </div>
// //         </header>

// //         {/* Page content */}
// //         <div className="flex-1 overflow-auto p-4 md:p-6">
// //           {children}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }










/**
 * InstituteLayoutWrapper — v3
 * Header: AppBreadcrumb + NotificationBell + ThemeToggle + AvatarWithInitials
 *
 * Breadcrumb auto-generates from pathname using navItems labels.
 * All provided components used as-is from @/components/shared/.
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { useInstituteNav } from '@/hooks/useInstituteConfig';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services';

// ── Shared components ────────────────────────────────────────────
import AppBreadcrumb      from '@/components/common/AppBreadcrumb';
import NotificationBell   from '@/components/common/NotificationBell';
import ThemeToggle        from '@/components/common/ThemeToggle';
import AvatarWithInitials from '@/components/common/AvatarWithInitials';

/* ─────────────────────────────────────────────
   useBreadcrumbs
   Builds AppBreadcrumb items[] from pathname + navItems map.

   Example:
     /institute/students/123  →
       [ { label:'Dashboard', href:'/institute' },
         { label:'Students',  href:'/institute/students' },
         { label:'123' }   ← last segment capitalised if no nav match
       ]
───────────────────────────────────────────── */
function useBreadcrumbs(navItems, pathname, dashboardPath) {
  return useMemo(() => {
    if (!pathname) return [];

    // href → label lookup from nav config
    const map = Object.fromEntries(navItems.map((n) => [n.href, n.label]));

    // Exact match on dashboard path
    if (pathname === dashboardPath) {
      return [{ label: 'Dashboard' }];
    }

    const items = [{ label: 'Dashboard', href: dashboardPath }];
    const segments = pathname.split('/').filter(Boolean);
    let accumulated = '';

    segments.forEach((seg, idx) => {
      accumulated += '/' + seg;
      const label = map[accumulated];
      const isLast = idx === segments.length - 1;

      if (label) {
        items.push(isLast ? { label } : { label, href: accumulated });
      } else if (isLast) {
        // Readable fallback for dynamic segments (IDs, slugs, etc.)
        const readable = seg
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        // Avoid duplicate with previous item
        if (readable !== items[items.length - 1]?.label) {
          items.push({ label: readable });
        }
      }
    });

    return items;
  }, [navItems, pathname, dashboardPath]);
}

/* ─────────────────────────────────────────────
   NavItem
───────────────────────────────────────────── */
function NavItem({ item, isCollapsed, pathname }) {
  const Icon     = Icons[item.icon] ?? Icons.Circle;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg mx-2 px-2.5 py-2 text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        isCollapsed && 'justify-center px-0 w-10 mx-auto',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary" />
      )}

      <Icon
        size={16}
        className={cn(
          'shrink-0 transition-transform duration-150',
          isActive ? 'text-primary' : 'group-hover:scale-110',
        )}
      />

      {!isCollapsed && <span className="truncate leading-none">{item.label}</span>}

      {isCollapsed && (
        <span className={cn(
          'pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md',
          'bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-md border',
          'opacity-0 scale-95 transition-all duration-100',
          'group-hover:opacity-100 group-hover:scale-100',
        )}>
          {item.label}
        </span>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────
   SidebarContent
───────────────────────────────────────────── */
function SidebarContent({
  isCollapsed, onCollapse, onMobileClose, isMobile,
  grouped, pathname, user, typeDefinition, onLogout,
}) {
  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className={cn(
        'flex h-14 shrink-0 items-center gap-2.5 border-b px-3',
        isCollapsed && 'justify-center px-0',
      )}>
        {typeDefinition && (
          <span className="text-xl leading-none select-none">{typeDefinition.icon}</span>
        )}

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-snug text-foreground">
              {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
            </p>
            <p className="text-[10px] leading-none text-muted-foreground mt-0.5">
              {typeDefinition?.label ?? 'Institute'}
            </p>
          </div>
        )}

        {!isMobile && (
          <button
            onClick={onCollapse}
            className={cn(
              'ml-auto flex h-7 w-7 items-center justify-center rounded-md shrink-0',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icons.PanelLeft
              size={15}
              className={cn('transition-transform duration-200', isCollapsed && 'rotate-180')}
            />
          </button>
        )}

        {isMobile && (
          <button
            onClick={onMobileClose}
            className={cn(
              'ml-auto flex h-7 w-7 items-center justify-center rounded-md shrink-0',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label="Close menu"
          >
            <Icons.X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 96%, transparent 100%)',
        }}
        aria-label="Navigation"
      >
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {!isCollapsed ? (
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group}
              </p>
            ) : (
              <div className="mx-3 mb-2 mt-1 h-px bg-border" />
            )}
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavItem key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="shrink-0 border-t p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <AvatarWithInitials
              src={user?.photo_url}
              firstName={user?.first_name ?? ''}
              lastName={user?.last_name ?? ''}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-snug">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-none mt-0.5">
                {user?.role?.name}
              </p>
            </div>
            <button
              onClick={onLogout}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              title="Logout"
              aria-label="Logout"
            >
              <Icons.LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <AvatarWithInitials
              src={user?.photo_url}
              firstName={user?.first_name ?? ''}
              lastName={user?.last_name ?? ''}
              size="sm"
            />
            <button
              onClick={onLogout}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              title="Logout"
              aria-label="Logout"
            >
              <Icons.LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export default function InstituteLayoutWrapper({ children }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const user          = useAuthStore((s) => s.user);
  const logout        = useAuthStore((s) => s.logout);
  const getDashPath   = useAuthStore((s) => s.dashboardPath);
  const dashboardPath = mounted ? getDashPath() : '/';

  const { typeDefinition } = useInstituteConfig();
  const allNavItems         = useInstituteNav();
  const navItems            = mounted ? allNavItems : [];

  const grouped = useMemo(
    () => navItems.reduce((acc, item) => {
      acc[item.group] = acc[item.group] ?? [];
      acc[item.group].push(item);
      return acc;
    }, {}),
    [navItems],
  );

  // Auto-build breadcrumb from current pathname
  const breadcrumbItems = useBreadcrumbs(navItems, pathname, dashboardPath);

  const handleLogout = useCallback(async () => {
    try { await authService.logout(); } catch (_) { /* ignore */ }
    finally {
      logout();
      router.replace('/login');
      toast.success('Logged out successfully');
    }
  }, [logout, router]);

  const sidebarProps = { grouped, pathname, user, typeDefinition, onLogout: handleLogout };

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Mobile sidebar */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card shadow-xl lg:hidden',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent
          {...sidebarProps}
          isCollapsed={false}
          isMobile={true}
          onMobileClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        aria-label="Desktop navigation"
        className={cn(
          'hidden lg:block border-r bg-card shrink-0 overflow-hidden',
          'transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-[60px]' : 'w-[220px]',
        )}
      >
        <SidebarContent
          {...sidebarProps}
          isCollapsed={collapsed}
          isMobile={false}
          onCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* ════════════════════════════════════════
            TOP HEADER
            Left  : [hamburger] [mobile-logo] | [breadcrumb]
            Right : [code badge] [ThemeToggle] [NotificationBell] [avatar]
        ════════════════════════════════════════ */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3 sm:px-4">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              'lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Icons.Menu size={18} />
          </button>

          {/* Mobile institute name (sidebar not visible on mobile) */}
          <Link
            href={dashboardPath}
            className="flex items-center gap-1.5 lg:hidden min-w-0 shrink-0"
          >
            {typeDefinition && (
              <span className="text-base leading-none">{typeDefinition.icon}</span>
            )}
            <span className="truncate text-sm font-semibold text-foreground max-w-[120px]">
              {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
            </span>
          </Link>

          {/* Divider between mobile logo and breadcrumb */}
          <div className="h-5 w-px bg-border lg:hidden shrink-0" />

          {/* ── Breadcrumb ── */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/*
              On xs screens the breadcrumb can get crowded with the mobile logo.
              We show it on sm+ always; on xs only if needed (hidden by default is fine,
              since the mobile logo gives context). Change 'hidden sm:block' to 'block'
              if you want it everywhere.
            */}
            <div className="hidden sm:block">
              <AppBreadcrumb items={breadcrumbItems} />
            </div>
          </div>

          {/* ── Right actions ── */}
          <div className="flex shrink-0 items-center gap-0.5">

            {/* Institute code badge — medium screens+ */}
            {(user?.school?.code || user?.institute?.code) && (
              <span className="hidden md:inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground mr-1.5">
                {user?.school?.code || user?.institute?.code}
              </span>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <NotificationBell />

            {/* User avatar — desktop only (sidebar already has it on mobile) */}
            <div className="hidden lg:flex items-center gap-2 pl-2 ml-1 border-l">
              <AvatarWithInitials
                src={user?.photo_url}
                firstName={user?.first_name ?? ''}
                lastName={user?.last_name ?? ''}
                size="sm"
              />
              <div className="hidden xl:block">
                <p className="text-xs font-semibold leading-none text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                  {user?.role?.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}