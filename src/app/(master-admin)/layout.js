// src/app/(master-admin)/layout.js
/**
 * Master Admin layout — fully responsive with mobile sidebar
 */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  LogOut, FileText, Menu, X, ShieldCheck, Mail, BarChart3, Bell, BellRing,
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

import useAuthStore from '@/store/authStore';
import { authService } from '@/services';
import { DUMMY_INSTITUTES_REPORT } from '@/data/masterAdminDummyData';
import {
  AppModal, InputField, SelectField, TextareaField, FormSubmitButton, DatePickerField,
} from '@/components/common';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/master-admin',                        label: 'Dashboard',       icon: LayoutDashboard, perm: null                    },
  { href: '/master-admin/roles',                  label: 'Roles',           icon: ShieldCheck,     perm: 'platform_role.read'     },
  { href: '/master-admin/subscription-templates', label: 'Sub. Templates',  icon: FileText,        perm: 'sub_template.read'      },
  { href: '/master-admin/institutes',                label: 'Institutes',      icon: Building2,       perm: 'institute.read'         },
  // { href: '/master-admin/users',                  label: 'Users',           icon: Users,           perm: 'platform_user.read'     },
  { href: '/master-admin/subscriptions',          label: 'Invoices',   icon: CreditCard,      perm: 'subscription.read'      },
  { href: '/master-admin/emails',                 label: 'Bulk Emails',     icon: Mail,            perm: 'email.view_history'     },
  { href: '/master-admin/reports',                label: 'Reports',         icon: BarChart3,       perm: 'report.platform_overview'},
  { href: '/master-admin/notifications',          label: 'Notifications',   icon: BellRing,        perm: 'notification.broadcast' },
];

// ── Notification recipient options ──────────────────────────────────────────
const NOTIF_RECIPIENT_OPTIONS = [
  { value: 'all', label: 'All Institutes' },
  ...DUMMY_INSTITUTES_REPORT.map((i) => ({
    value: i.id.toString(),
    label: `${i.name} — ${i.city}`,
  })),
];

const NOTIF_TYPE_OPTIONS = [
  { value: 'info',         label: 'Info / General'       },
  { value: 'announcement', label: 'Announcement'         },
  { value: 'warning',      label: 'Warning'              },
  { value: 'alert',        label: 'Urgent Alert'         },
  { value: 'reminder',     label: 'Reminder'             },
  { value: 'payment',      label: 'Payment / Invoice'    },
  { value: 'subscription', label: 'Subscription Notice'  },
];

export default function MasterAdminLayout({ children }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const user         = useAuthStore((s) => s.user);
  const canDo        = useAuthStore((s) => s.canDo);
  const logout       = useAuthStore((s) => s.logout);
  const [open,       setOpen]      = useState(false);
  const [notifOpen,  setNotifOpen] = useState(false);
  const [mounted,    setMounted]   = useState(false);

  console.log('Login User', user);
  
  // Delay permission-filtering until after hydration so server HTML matches
  // first client render (Zustand reads localStorage only on client).
  useEffect(() => { setMounted(true); }, []);

  const visibleNav = mounted
    ? NAV.filter(({ perm }) => !perm || canDo(perm))
    : NAV.filter(({ perm }) => !perm);

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) {}
    logout();
    Cookies.remove('access_token');
    Cookies.remove('role_code');
    Cookies.remove('institute_type');
    router.replace('/login');
    toast.success('Logged out');
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo + close (mobile only) */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <span className="font-bold text-sm">☁ Master Admin</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/master-admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                    : 'text-white/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-white',
                )}
              >
                <Icon size={16} />{label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {user && (
          <div className="border-t border-white/10 px-5 py-3">
            <p className="text-sm font-semibold text-white truncate">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 border-t border-white/10 px-5 py-4 text-sm text-white/60 hover:text-white"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col md:ml-56 min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="flex-1 text-sm font-medium text-muted-foreground truncate">
            The Clouds Academy — Admin Panel
          </span>

          {/* Send Notification button */}
          <button
            onClick={() => setNotifOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 px-3 py-1.5 text-xs font-semibold transition-colors"
            title="Send notification to institute admins"
          >
            <Bell size={13} /> Send Notification
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* ── Send Notification Modal ──────────────────── */}
      <SendNotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

// ── SendNotificationModal ─────────────────────────────────────────────────────
function SendNotificationModal({ open, onClose }) {
  const [sending, setSending] = useState(false);
  const {
    register, control, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recipients:   'all',
      type:         'info',
      subject:      '',
      message:      '',
      schedule_at:  null,
    },
  });

  const recipients = watch('recipients');
  const recipientLabel =
    recipients === 'all'
      ? 'All Institutes'
      : DUMMY_INSTITUTES_REPORT.find((i) => i.id.toString() === recipients)?.name ?? recipients;

  const handleSend = (data) => {
    if (!data.subject?.trim()) { toast.error('Subject is required'); return; }
    if (!data.message?.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onClose();
      reset();
      const scheduled = data.schedule_at ? ` — scheduled for ${data.schedule_at}` : '';
      toast.success(`Notification sent to: ${recipientLabel}${scheduled}`);
    }, 1000);
  };

  const handleClose = () => { onClose(); reset(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Send Notification"
      description="Send a message or alert to one institute or all institutes"
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <FormSubmitButton
            loading={sending}
            label="Send Notification"
            loadingLabel="Sending…"
            onClick={handleSubmit(handleSend)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleSend)} className="space-y-4">

        {/* Recipient */}
        <SelectField
          label="Send To"
          name="recipients"
          control={control}
          options={NOTIF_RECIPIENT_OPTIONS}
          placeholder="Select recipient…"
          required
        />

        {/* Type */}
        <SelectField
          label="Notification Type"
          name="type"
          control={control}
          options={NOTIF_TYPE_OPTIONS}
          placeholder="Select type…"
          required
        />

        {/* Subject */}
        <InputField
          label="Subject"
          name="subject"
          register={register}
          error={errors.subject}
          placeholder="Notification subject line…"
          required
        />

        {/* Message */}
        <TextareaField
          label="Message"
          name="message"
          register={register}
          error={errors.message}
          rows={5}
          placeholder="Write the notification message here…"
          required
        />

        {/* Optional schedule */}
        <DatePickerField
          label="Schedule Date (optional — leave blank to send now)"
          name="schedule_at"
          control={control}
          placeholder="Send immediately or pick a date"
        />

      </form>
    </AppModal>
  );
}
