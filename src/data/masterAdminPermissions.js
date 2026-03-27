/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   masterAdminPermissions.js — The Clouds Academy                    ║
 * ║                                                                      ║
 * ║  Master Admin ka poora permission system yahan hai.                  ║
 * ║  Master Admin SaaS platform ka owner hota hai — har cheez ka        ║
 * ║  access hai uske paas bina kisi restriction ke.                      ║
 * ║                                                                      ║
 * ║  Backend mein:                                                       ║
 * ║    • role_code  = 'MASTER_ADMIN'  (User.model mein ENUM)            ║
 * ║    • permissions = ['ALL']  (login pe return hota hai)               ║
 * ║    • isMasterAdmin middleware  → role_code check karta hai           ║
 * ║    • hasPermission middleware  → agar MASTER_ADMIN hai to bypass     ║
 * ║    • schoolContext middleware  → MASTER_ADMIN ke liye skip           ║
 * ║    • subscription middleware  → MASTER_ADMIN ke liye skip           ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import { ALL_PERMISSIONS } from './permissionsData.js';
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — MASTER ADMIN IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_ADMIN_ROLE = {
  code: 'MASTER_ADMIN',
  name: 'Master Admin',
  level: 'platform',         // Institute ke upar — SaaS level
  school_id: null,           // Kisi bhi school se belong nahi karta
  is_system: true,           // Yeh role delete nahi ho sakta
  permissions: ALL_PERMISSIONS, // Platform + Institute — tamam permissions
  description:
    'SaaS platform ka super admin. Tamam institutes, subscriptions, billing, roles aur ' +
    'platform-level settings ka complete access. Kisi bhi permission check se bypass hota hai.',
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — PLATFORM PERMISSIONS (Master Admin ke exclusive permissions)
// Yeh permissions sirf Master Admin ke paas hain — kisi institute user ke paas nahi
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_PERMISSIONS = {

  // ── Institutes (Schools) ─────────────────────────────────────────────────
  institute: {
    label: 'Institute Management',
    permissions: [
      { code: 'institute.create',          label: 'Naya institute create karna'                    },
      { code: 'institute.read',            label: 'Tamam institutes ki list dekhna'                },
      { code: 'institute.update',          label: 'Institute ka profile / settings update karna'   },
      { code: 'institute.delete',          label: 'Institute permanently delete karna'             },
      { code: 'institute.activate',        label: 'Institute ko activate / deactivate karna'       },
      { code: 'institute.assign_role',     label: 'Institute ko subscription role assign karna'    },
      { code: 'institute.export',          label: 'Institutes ka data export (CSV/PDF)'            },
      { code: 'institute.view_stats',      label: 'Per-institute stats dekhna (students, revenue)'  },
    ],
  },

  // ── Subscriptions ────────────────────────────────────────────────────────
  subscription: {
    label: 'Subscription Management',
    permissions: [
      { code: 'subscription.create',       label: 'Institute ke liye subscription create karna'    },
      { code: 'subscription.read',         label: 'Tamam subscriptions ki list dekhna'             },
      { code: 'subscription.update',       label: 'Subscription details update karna'              },
      { code: 'subscription.cancel',       label: 'Subscription cancel karna'                      },
      { code: 'subscription.renew',        label: 'Subscription manually renew karna'              },
      { code: 'subscription.export',       label: 'Subscription data export karna'                 },
    ],
  },

  // ── Subscription Templates (Plans) ───────────────────────────────────────
  subscription_template: {
    label: 'Subscription Templates / Plans',
    permissions: [
      { code: 'sub_template.create',       label: 'Naya subscription plan/template banana'         },
      { code: 'sub_template.read',         label: 'Tamam templates dekhna'                        },
      { code: 'sub_template.update',       label: 'Plan ki price / features update karna'          },
      { code: 'sub_template.delete',       label: 'Template delete karna'                          },
    ],
  },

  // ── Platform Roles ───────────────────────────────────────────────────────
  platform_role: {
    label: 'Platform Roles',
    permissions: [
      { code: 'platform_role.create',      label: 'Platform-level role banana (e.g. Support Admin)'  },
      { code: 'platform_role.read',        label: 'Platform roles ki list dekhna'                   },
      { code: 'platform_role.update',      label: 'Role ka naam / permissions update karna'           },
      { code: 'platform_role.delete',      label: 'Role delete karna'                               },
      { code: 'platform_role.assign',      label: 'User ko platform role assign karna'              },
    ],
  },

  // ── Platform Users ───────────────────────────────────────────────────────
  platform_user: {
    label: 'Platform Users (Admin Panel Users)',
    permissions: [
      { code: 'platform_user.create',      label: 'Naya platform user banana (e.g. Support staff)'  },
      { code: 'platform_user.read',        label: 'Tamam platform users ki list dekhna'            },
      { code: 'platform_user.update',      label: 'User profile / role update karna'               },
      { code: 'platform_user.delete',      label: 'User ka account delete karna'                   },
      { code: 'platform_user.toggle',      label: 'User activate / deactivate karna'               },
    ],
  },

  // ── Bulk Emails ──────────────────────────────────────────────────────────
  email: {
    label: 'Bulk Email / Communication',
    permissions: [
      { code: 'email.send_bulk',           label: 'Tamam ya specific institutes ko bulk email bhejna' },
      { code: 'email.view_history',        label: 'Purani emails ka history dekhna'                },
    ],
  },

  // ── Platform Reports ─────────────────────────────────────────────────────
  report: {
    label: 'Platform Reports',
    permissions: [
      { code: 'report.platform_overview',  label: 'Overall platform stats report (revenue, institutes, users)' },
      { code: 'report.revenue',            label: 'Revenue report (monthly/yearly breakdown)'     },
      { code: 'report.institute_wise',     label: 'Institute-wise detailed report'                },
      { code: 'report.subscription',       label: 'Subscription churn / renewal report'           },
      { code: 'report.export',             label: 'Reports export karna (CSV / PDF)'              },
    ],
  },

  // ── Notifications (Broadcast) ────────────────────────────────────────────
  notification: {
    label: 'Platform Notifications',
    permissions: [
      { code: 'notification.broadcast',    label: 'Tamam institutes ko platform notification bhejna' },
      { code: 'notification.targeted',     label: 'Specific institute ya user ko notification'    },
    ],
  },

  // ── Platform Settings ────────────────────────────────────────────────────
  platform_settings: {
    label: 'Platform Settings',
    permissions: [
      { code: 'platform.settings',         label: 'Platform-wide settings update karna'           },
      { code: 'platform.backup',           label: 'Database backup manage karna'                  },
      { code: 'platform.audit_logs',       label: 'Audit logs dekhna (kaun kya kar raha hai)'     },
      { code: 'platform.maintenance',      label: 'Maintenance mode toggle karna'                 },
    ],
  },

  // ── Institute Data Access (Read-only for support) ─────────────────────────
  institute_data: {
    label: 'Institute Data Access (Support Level)',
    permissions: [
      { code: 'institute_data.students',   label: 'Kisi bhi institute ke students dekhna (support)'  },
      { code: 'institute_data.users',      label: 'Kisi bhi institute ke users dekhna'             },
      { code: 'institute_data.fees',       label: 'Kisi bhi institute ka fee data dekhna'          },
      { code: 'institute_data.attendance', label: 'Kisi bhi institute ka attendance dekhna'        },
    ],
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — INSTITUTE-LEVEL PERMISSIONS (Jo Master Admin inn institutes ko de sakta hai)
// Master Admin subscription roles ke through institutes ko yeh permissions assign karta hai
// ─────────────────────────────────────────────────────────────────────────────

export const INSTITUTE_ACCESS_LEVELS = {
  // Basic Plan institutes ke paas yeh modules hote hain
  BASIC: [
    'dashboard.view',
    'student.create', 'student.read', 'student.update', 'student.delete',
    'attendance.mark', 'attendance.read',
    'fee.read', 'fee.collect',
    'notice.read',
    'user.read',
    'report.view',
  ],

  // Standard Plan
  STANDARD: [
    'dashboard.view',
    'student.create', 'student.read', 'student.update', 'student.delete', 'student.export',
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'parent.create', 'parent.read', 'parent.update',
    'class.create', 'class.read', 'class.update', 'class.delete',
    'section.create', 'section.read', 'section.update', 'section.delete',
    'attendance.mark', 'attendance.read', 'attendance.update', 'attendance.export',
    'fee.create', 'fee.read', 'fee.update', 'fee.collect', 'fee.refund', 'fee.export',
    'exam.create', 'exam.read', 'exam.update', 'exam.result.enter',
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'role.read', 'role.create', 'role.update',
    'user.read', 'user.create', 'user.update',
    'report.view', 'report.export',
    'settings.view', 'settings.update',
  ],

  // Premium Plan — full access
  PREMIUM: ['ALL'],

  // Enterprise Plan — full access + branches
  ENTERPRISE: ['ALL', 'branch.create', 'branch.read', 'branch.update', 'branch.delete'],
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — WHAT MASTER ADMIN CAN DO PER PAGE
// Har page pe Master Admin ke available actions
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_ADMIN_PAGE_ACTIONS = {
  '/master-admin': {
    label: 'Dashboard',
    actions: [
      'Platform overview stats dekhna (total institutes, revenue, active subscriptions)',
      'Expiring subscriptions ka alert dekhna',
      'Recent institute registrations dekhna',
      'Quick actions use karna (New Institute, Bulk Email, Reports)',
    ],
  },

  '/master-admin/schools': {
    label: 'Institutes',
    actions: [
      'Tamam institutes ki list dekhna (search, filter, pagination)',
      'Naya institute create karna (name, code, city, logo, subscription plan)',
      'Institute ka profile edit karna',
      'Institute activate / deactivate karna',
      'Institute delete karna (soft delete)',
      'Institute detail page pe jaana → students, users, subscription history dekhna',
      'Institute ko subscription role assign karna (Basic/Standard/Premium/Enterprise)',
    ],
  },

  '/master-admin/subscriptions': {
    label: 'Subscriptions',
    actions: [
      'Tamam institutes ki subscriptions dekhna (status: trial/active/expired/cancelled)',
      'Naya subscription create karna (institute select, plan select, dates)',
      'Subscription cancel karna',
      'Subscription status filter karna',
      'Expiring subscriptions track karna',
    ],
  },

  '/master-admin/subscription-templates': {
    label: 'Subscription Templates',
    actions: [
      'Subscription plans ki list dekhna (Basic, Standard, Premium, Enterprise)',
      'Naya plan banana (naam, price, billing cycle, max students, modules)',
      'Plan ki details edit karna',
      'Plan delete karna',
    ],
  },

  '/master-admin/roles': {
    label: 'Roles',
    actions: [
      'Platform-level roles dekhna',
      'Naya role banana with permissions',
      'Role ki permissions update karna',
      'Role delete karna',
    ],
  },

  '/master-admin/users': {
    label: 'Users',
    actions: [
      'Tamam platform users ki list dekhna (search, filter by school, status)',
      'Naya platform user banana (Support Admin, etc.)',
      'User ka role / status update karna',
      'User activate / deactivate karna',
      'User delete karna',
    ],
  },

  '/master-admin/emails': {
    label: 'Bulk Emails',
    actions: [
      'Tamam institutes ko ek saath email bhejna',
      'Specific institute select karke targeted email bhejna',
      'Subject, message compose karna',
      'Email history dekhna (future feature)',
    ],
  },

  '/master-admin/reports': {
    label: 'Reports',
    actions: [
      'Platform-wide revenue report dekhna',
      'Institute-wise student count report',
      'Subscription renewal / churn report',
      'Monthly / yearly comparison charts',
      'Reports export karna (CSV/PDF)',
    ],
  },

  '/master-admin/notifications': {
    label: 'Notifications',
    actions: [
      'Tamam ya specific institutes ko notification bhejna',
      'Notification type select karna (info, warning, payment, subscription, etc.)',
      'Scheduled notifications (future feature)',
      'Sent notifications ka history dekhna',
    ],
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — MASTER ADMIN vs INSTITUTE ADMIN COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_COMPARISON = {
  MASTER_ADMIN: {
    scope: 'Platform (SaaS level)',
    school_id: null,
    bypass_permissions: true,
    bypass_school_context: true,
    bypass_subscription_check: true,
    can_access_all_institutes: true,
    can_manage_subscriptions: true,
    can_manage_plans: true,
    can_send_bulk_emails: true,
    can_see_platform_revenue: true,
    can_create_institutes: true,
    login_permissions_returned: ALL_PERMISSIONS,
  },

  INSTITUTE_ADMIN: {
    scope: 'Single institute only',
    school_id: 'UUID (apne institute ka)',
    bypass_permissions: false,
    bypass_school_context: false,
    bypass_subscription_check: false,
    can_access_all_institutes: false,
    can_manage_subscriptions: false,
    can_manage_plans: false,
    can_send_bulk_emails: false,
    can_see_platform_revenue: false,
    can_create_institutes: false,
    login_permissions_returned: 'Dynamic — UserRole → Role → RolePermissions se load hoti hain',
  },
};

export default {
  MASTER_ADMIN_ROLE,
  PLATFORM_PERMISSIONS,
  INSTITUTE_ACCESS_LEVELS,
  MASTER_ADMIN_PAGE_ACTIONS,
  ROLE_COMPARISON,
};
