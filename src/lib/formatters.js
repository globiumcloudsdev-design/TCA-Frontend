/**
 * The Clouds Academy — Shared Formatters & Status Maps
 *
 * Usage:
 *   import { fmtDate, fmtCurrency, SUB_STATUS, statusCls } from '@/lib/formatters';
 *
 * Covers: Date/time, Currency, All status types (subscription, fee, attendance…)
 */

import { format, formatDistance, isValid } from 'date-fns';

// ─── Date & Time ──────────────────────────────────────────────────────────────

/**
 * Format any date value.
 * @param {string|Date|null} d
 * @param {string} pattern  date-fns pattern string
 * @returns {string}
 */
export const fmtDate = (d, pattern = 'dd MMM yyyy') => {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return isValid(date) ? format(date, pattern) : '—';
  } catch {
    return '—';
  }
};

export const fmtDateShort  = (d) => fmtDate(d, 'dd/MM/yyyy');        // 07/03/2026
export const fmtDateMedium = (d) => fmtDate(d, 'dd MMM yyyy');       // 07 Mar 2026
export const fmtDateFull   = (d) => fmtDate(d, 'EEEE, dd MMMM yyyy');// Saturday, 07 March 2026
export const fmtDatetime   = (d) => fmtDate(d, 'dd MMM yyyy, HH:mm');// 07 Mar 2026, 14:30
export const fmtTime       = (d) => fmtDate(d, 'HH:mm');             // 14:30
export const fmtMonthYear  = (d) => fmtDate(d, 'MMM yyyy');          // Mar 2026

/** Human-readable relative time: "3 hours ago" */
export const timeAgo = (d) => {
  if (!d) return '—';
  try {
    return formatDistance(new Date(d), new Date(), { addSuffix: true });
  } catch {
    return '—';
  }
};

/** Number of days until the given date (negative if past) */
export const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86_400_000);
};

/** Returns 'Expired', 'Today', or 'X days left' */
export const trialCountdown = (d) => {
  const days = daysUntil(d);
  if (days === null) return '—';
  if (days < 0)  return 'Expired';
  if (days === 0) return 'Today';
  return `${days}d left`;
};

// ─── Numbers & Currency ───────────────────────────────────────────────────────

/**
 * Format a number as currency.
 * @param {number|string} amount
 * @param {string} currency  ISO 4217 code (default: PKR)
 */
export const fmtCurrency = (amount, currency = 'PKR') => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/** Format a plain number with thousand separators */
export const fmtAmount = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-PK').format(num);
};

/** Format percentage */
export const fmtPercent = (value, decimals = 1) => {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(decimals)}%`;
};

// ─── Status Maps ─────────────────────────────────────────────────────────────
// Each entry: { label, cls (Tailwind badge classes), icon? }

/** Subscription / Institute status */
export const SUB_STATUS = {
  trial:     { label: 'Trial',     icon: '🕐', cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  active:    { label: 'Active',    icon: '✅', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  expired:   { label: 'Expired',   icon: '⏰', cls: 'bg-red-100     text-red-700     border-red-200'     },
  suspended: { label: 'Suspended', icon: '🚫', cls: 'bg-slate-100   text-slate-600   border-slate-200'   },
};

export const SUB_STATUS_OPTIONS = Object.entries(SUB_STATUS).map(([value, { icon, label }]) => ({
  value,
  label: `${icon} ${label}`,
}));

/** General entity status */
export const ENTITY_STATUS = {
  active:   { label: 'Active',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive', cls: 'bg-slate-100   text-slate-500   border-slate-200'   },
  pending:  { label: 'Pending',  cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100     text-red-700     border-red-200'     },
  blocked:  { label: 'Blocked',  cls: 'bg-red-100     text-red-700     border-red-200'     },
  draft:    { label: 'Draft',    cls: 'bg-gray-100    text-gray-600    border-gray-200'    },
};

/** Fee / payment status */
export const FEE_STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100  text-amber-700  border-amber-200'    },
  paid:      { label: 'Paid',      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  overdue:   { label: 'Overdue',   cls: 'bg-red-100    text-red-700    border-red-200'       },
  partial:   { label: 'Partial',   cls: 'bg-blue-100   text-blue-700   border-blue-200'      },
  waived:    { label: 'Waived',    cls: 'bg-purple-100 text-purple-700 border-purple-200'    },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100   text-gray-500   border-gray-200'      },
};

/** Attendance status */
export const ATTENDANCE_STATUS = {
  present: { label: 'Present', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  absent:  { label: 'Absent',  cls: 'bg-red-100     text-red-700     border-red-200'     },
  late:    { label: 'Late',    cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  leave:   { label: 'Leave',   cls: 'bg-blue-100    text-blue-700    border-blue-200'    },
  holiday: { label: 'Holiday', cls: 'bg-purple-100  text-purple-700  border-purple-200'  },
  half:    { label: 'Half Day',cls: 'bg-orange-100  text-orange-700  border-orange-200'  },
};

/** Exam / result status */
export const EXAM_STATUS = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  ongoing:   { label: 'Ongoing',   cls: 'bg-amber-100  text-amber-700  border-amber-200'  },
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100   text-gray-500   border-gray-200'   },
  published: { label: 'Published', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

/** Leave request status */
export const LEAVE_STATUS = {
  pending:  { label: 'Pending',  cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100     text-red-700     border-red-200'     },
};

/** Payroll status */
export const PAYROLL_STATUS = {
  draft:     { label: 'Draft',     cls: 'bg-gray-100   text-gray-500   border-gray-200'   },
  generated: { label: 'Generated', cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  paid:      { label: 'Paid',      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100    text-red-700    border-red-200'     },
};

 // ─── Card color palette ───────────────────────────────────────────────────────
export const CARD_COLORS = [
  { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700'       },
  { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700'   },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700'     },
  { bg: 'bg-rose-50',    border: 'border-rose-200',    icon: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700'       },
  { bg: 'bg-cyan-50',    border: 'border-cyan-200',    icon: 'text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700'       },
  { bg: 'bg-teal-50',    border: 'border-teal-200',    icon: 'text-teal-600',    badge: 'bg-teal-100 text-teal-700'       },
  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  icon: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700'   },
];


// ─── Utility functions ────────────────────────────────────────────────────────

/**
 * Get the tailwind class for a status from any status map.
 * @param {object} map  One of the STATUS maps above
 * @param {string} key  Status key
 * @param {string} [fallback]  Default class if key not found
 */
export const statusCls = (map, key, fallback = 'bg-gray-100 text-gray-600 border-gray-200') =>
  map[key]?.cls ?? fallback;

/**
 * Get the human label for a status.
 */
export const statusLabel = (map, key, fallback) =>
  map[key]?.label ?? (fallback ?? key ?? '—');

/** Convert a snake_case or dot.case string to Title Case */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Truncate a string to max length with ellipsis */
export const truncate = (str, max = 30) => {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}…` : str;
};
