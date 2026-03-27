/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   masterAdminSidebarData.js — The Clouds Academy                    ║
 * ║                                                                      ║
 * ║  Master Admin sidebar ka complete data — nav items, quick actions,  ║
 * ║  badge counts, aur future planned sections sab yahan hain.          ║
 * ║                                                                      ║
 * ║  Used by: src/app/(master-admin)/layout.js                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — MAIN SIDEBAR NAV ITEMS
// Yahi layout.js mein NAV array hai — isko single source of truth banana chahiye
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sidebar navigation items for Master Admin panel.
 * icon: Lucide icon name (string) — import karo layout mein
 * badge: optional — dynamic count ke liye (API se ata hai)
 * description: tooltip / screen-reader ke liye
 */
export const MASTER_ADMIN_NAV = [
  {
    href:        '/master-admin',
    label:       'Dashboard',
    icon:        'LayoutDashboard',
    exact:       true,           // exact match — sirf /master-admin pe active hoga
    description: 'Platform overview: total institutes, revenue, active subscriptions',
  },
  {
    href:        '/master-admin/schools',
    label:       'Institutes',
    icon:        'Building2',
    exact:       false,
    description: 'Institutes manage karo — create, edit, activate/deactivate, assign plans',
  },
  {
    href:        '/master-admin/subscriptions',
    label:       'Subscriptions',
    icon:        'CreditCard',
    exact:       false,
    badgeKey:    'expiring_soon',   // Dashboard stats se badge count lena hai
    description: 'Institutes ki subscription status track karo',
  },
  {
    href:        '/master-admin/subscription-templates',
    label:       'Sub. Templates',
    icon:        'FileText',
    exact:       false,
    description: 'Subscription plans banana / edit karna (Basic, Standard, Premium, Enterprise)',
  },
  {
    href:        '/master-admin/roles',
    label:       'Roles',
    icon:        'ShieldCheck',
    exact:       false,
    description: 'Platform-level roles aur unki permissions manage karo',
  },
  {
    href:        '/master-admin/users',
    label:       'Users',
    icon:        'Users',
    exact:       false,
    description: 'Platform ke admin users manage karo (Support staff, etc.)',
  },
  {
    href:        '/master-admin/emails',
    label:       'Bulk Emails',
    icon:        'Mail',
    exact:       false,
    description: 'Tamam ya specific institutes ko broadcast emails bhejo',
  },
  {
    href:        '/master-admin/reports',
    label:       'Reports',
    icon:        'BarChart3',
    exact:       false,
    description: 'Platform revenue, institute stats, subscription reports',
  },
  {
    href:        '/master-admin/notifications',
    label:       'Notifications',
    icon:        'BellRing',
    exact:       false,
    badgeKey:    'unread_notifications',
    description: 'Institutes ko in-app notifications bhejo',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — FUTURE / PLANNED NAV ITEMS (aage add honge)
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_ADMIN_NAV_FUTURE = [
  {
    href:        '/master-admin/billing',
    label:       'Billing',
    icon:        'Receipt',
    status:      'planned',
    description: 'Invoices, payment history, stripe dashboard',
  },
  {
    href:        '/master-admin/support',
    label:       'Support Tickets',
    icon:        'LifeBuoy',
    status:      'planned',
    description: 'Institute admins ke support requests handle karo',
  },
  {
    href:        '/master-admin/audit-logs',
    label:       'Audit Logs',
    icon:        'ScrollText',
    status:      'planned',
    description: 'Platform pe har action ka log — kaun, kab, kya kiya',
  },
  {
    href:        '/master-admin/settings',
    label:       'Settings',
    icon:        'Settings',
    status:      'planned',
    description: 'Platform-wide settings (maintenance mode, rate limits, etc.)',
  },
  {
    href:        '/master-admin/announcements',
    label:       'Announcements',
    icon:        'Megaphone',
    status:      'planned',
    description: 'Platform-wide announcements banner for all institutes',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — QUICK ACTIONS (Dashboard ke top mein shortcut buttons)
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_ADMIN_QUICK_ACTIONS = [
  {
    label:  '+ New Institute',
    href:   '/master-admin/schools',
    color:  'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    icon:   'Building2',
    action: 'open_create_modal',   // modal trigger ke liye
  },
  {
    label:  'Generate Invoice',
    href:   '/master-admin/subscriptions',
    color:  'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    icon:   'Receipt',
    action: 'navigate',
  },
  {
    label:  'Bulk Email',
    href:   '/master-admin/emails',
    color:  'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200',
    icon:   'Mail',
    action: 'navigate',
  },
  {
    label:  'Create Report',
    href:   '/master-admin/reports',
    color:  'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
    icon:   'BarChart3',
    action: 'navigate',
  },
  {
    label:  'Search Institute',
    href:   '/master-admin/schools',
    color:  'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200',
    icon:   'Search',
    action: 'focus_search',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — NOTIFICATION SEND OPTIONS
// Bulk notification bhejtay waqt recipient aur type options
// ─────────────────────────────────────────────────────────────────────────────

export const NOTIF_TYPE_OPTIONS = [
  { value: 'info',          label: 'Info / General'       },
  { value: 'announcement',  label: 'Announcement'         },
  { value: 'warning',       label: 'Warning'              },
  { value: 'alert',         label: 'Urgent Alert'         },
  { value: 'reminder',      label: 'Reminder'             },
  { value: 'payment',       label: 'Payment / Invoice'    },
  { value: 'subscription',  label: 'Subscription Notice'  },
];

// Recipient options "All Institutes" + individual institutes
// (Dynamic wala masterAdminDummyData se import karo)
export const NOTIF_STATIC_RECIPIENT = [
  { value: 'all', label: 'All Institutes' },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — INSTITUTE SUBSCRIPTION STATUS BADGE CONFIG
// Subscription status ke liye color + label mapping
// ─────────────────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUS_CONFIG = {
  trial:     { label: 'Trial',     color: 'bg-yellow-100 text-yellow-800',  dot: 'bg-yellow-500' },
  active:    { label: 'Active',    color: 'bg-green-100 text-green-800',    dot: 'bg-green-500'  },
  expired:   { label: 'Expired',   color: 'bg-red-100 text-red-800',        dot: 'bg-red-500'    },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700',      dot: 'bg-gray-400'   },
  suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-800',  dot: 'bg-orange-500' },
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — INSTITUTE TYPE OPTIONS (school form mein dropdown)
// ─────────────────────────────────────────────────────────────────────────────

export const INSTITUTE_TYPE_OPTIONS = [
  { value: 'school',      label: 'School'           },
  { value: 'college',     label: 'College'          },
  { value: 'university',  label: 'University'       },
  { value: 'coaching',    label: 'Coaching Center'  },
  { value: 'academy',     label: 'Academy'          },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — DASHBOARD STAT CARD CONFIG
// Dashboard pe jo stat cards dikhte hain unki config
// ─────────────────────────────────────────────────────────────────────────────

export const DASHBOARD_STAT_CARDS = [
  {
    key:         'total_institutes',
    label:       'Total Institutes',
    icon:        'Building2',
    color:       'text-blue-600',
    bgColor:     'bg-blue-50',
    linkHref:    '/master-admin/schools',
    description: 'Platform pe registered tamam institutes',
  },
  {
    key:         'active_subscriptions',
    label:       'Active Subscriptions',
    icon:        'CreditCard',
    color:       'text-emerald-600',
    bgColor:     'bg-emerald-50',
    linkHref:    '/master-admin/subscriptions',
    description: 'Currently active ya trial subscriptions',
  },
  {
    key:         'total_revenue',
    label:       'Total Revenue',
    icon:        'TrendingUp',
    color:       'text-violet-600',
    bgColor:     'bg-violet-50',
    linkHref:    '/master-admin/reports',
    format:      'currency',   // PKR / USD formatting
    description: 'Collected platform revenue',
  },
  {
    key:         'expiring_soon',
    label:       'Expiring Soon',
    icon:        'AlertCircle',
    color:       'text-amber-600',
    bgColor:     'bg-amber-50',
    linkHref:    '/master-admin/subscriptions',
    description: 'Subscriptions jo agli 30 din mein expire hongi',
  },
  {
    key:         'total_students',
    label:       'Total Students',
    icon:        'GraduationCap',
    color:       'text-cyan-600',
    bgColor:     'bg-cyan-50',
    linkHref:    '/master-admin/reports',
    description: 'Tamam institutes mein enrolled students ka total',
  },
  {
    key:         'total_users',
    label:       'Platform Users',
    icon:        'Users',
    color:       'text-pink-600',
    bgColor:     'bg-pink-50',
    linkHref:    '/master-admin/users',
    description: 'Tamam institute admins + platform staff',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — BILLING CYCLE OPTIONS (subscription banate waqt)
// ─────────────────────────────────────────────────────────────────────────────

export const BILLING_CYCLE_OPTIONS = [
  { value: 'monthly',  label: 'Monthly'  },
  { value: 'yearly',   label: 'Yearly'   },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — SCHOOL / INSTITUTE TABLE COLUMNS (list page pe)
// ─────────────────────────────────────────────────────────────────────────────

export const INSTITUTE_TABLE_COLUMNS = [
  { key: 'name',                  label: 'Institute Name',        sortable: true  },
  { key: 'code',                  label: 'Code',                  sortable: false },
  { key: 'type',                  label: 'Type',                  sortable: true  },
  { key: 'city',                  label: 'City',                  sortable: true  },
  { key: 'subscription_status',   label: 'Subscription',          sortable: true  },
  { key: 'total_students',        label: 'Students',              sortable: true  },
  { key: 'is_active',             label: 'Status',                sortable: true  },
  { key: 'created_at',            label: 'Registered',            sortable: true  },
  { key: 'actions',               label: 'Actions',               sortable: false },
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — USER TABLE COLUMNS (users page pe)
// ─────────────────────────────────────────────────────────────────────────────

export const USER_TABLE_COLUMNS = [
  { key: 'name',           label: 'Name',         sortable: true  },
  { key: 'email',          label: 'Email',        sortable: true  },
  { key: 'role',           label: 'Role',         sortable: false },
  { key: 'school',         label: 'Institute',    sortable: true  },
  { key: 'is_active',      label: 'Status',       sortable: true  },
  { key: 'last_login_at',  label: 'Last Login',   sortable: true  },
  { key: 'created_at',     label: 'Created',      sortable: true  },
  { key: 'actions',        label: 'Actions',      sortable: false },
];


export default {
  MASTER_ADMIN_NAV,
  MASTER_ADMIN_NAV_FUTURE,
  MASTER_ADMIN_QUICK_ACTIONS,
  NOTIF_TYPE_OPTIONS,
  NOTIF_STATIC_RECIPIENT,
  SUBSCRIPTION_STATUS_CONFIG,
  INSTITUTE_TYPE_OPTIONS,
  DASHBOARD_STAT_CARDS,
  BILLING_CYCLE_OPTIONS,
  INSTITUTE_TABLE_COLUMNS,
  USER_TABLE_COLUMNS,
};
