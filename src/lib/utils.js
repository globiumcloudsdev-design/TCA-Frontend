/**
 * The Clouds Academy — Utility helpers
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, isValid } from 'date-fns';

// ── Tailwind class merge ──────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────────────────
export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '—';
  try {
    let d;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      } else {
        d = new Date(date);
      }
    } else {
      d = new Date(date);
    }
    return isValid(d) && !isNaN(d.getTime()) ? format(d, pattern) : '—';
  } catch (e) {
    return '—';
  }
}

export function timeAgo(date) {
  if (!date) return '—';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

// ── Currency ──────────────────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'PKR') {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('ur-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(num);
}

// ── Truncate text ─────────────────────────────────────────────────────────
export function truncate(str, length = 30) {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

// ── Initials for avatars ──────────────────────────────────────────────────
export function getInitials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ── Full name helper ──────────────────────────────────────────────────────
export function fullName(obj) {
  if (!obj) return '';
  return `${obj.first_name || ''} ${obj.last_name || ''}`.trim();
}

// ── Gender label ──────────────────────────────────────────────────────────
export function genderLabel(value) {
  const map = { male: 'Male', female: 'Female', other: 'Other' };
  return map[value] || value || '—';
}

// ── Status badge colors ───────────────────────────────────────────────────
export const FEE_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
  partial: 'bg-blue-100 text-blue-800',
};

export const ATTENDANCE_STATUS_COLORS = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  leave: 'bg-blue-100 text-blue-800',
  holiday: 'bg-purple-100 text-purple-800',
};

// ── Extract error message from axios error ────────────────────────────────
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

// ── Debounce ──────────────────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Build query string from object ───────────────────────────────────────
export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  return query.toString() ? `?${query}` : '';
}

// ── Active Academic Year Helpers ──────────────────────────────────────────
/**
 * Resolves the active / current academic year object from a list of academic years or options.
 * Prioritizes:
 * 1. is_current === true
 * 2. is_active === true (or status === 'active')
 * 3. first available element
 */
export function getActiveAcademicYear(years = []) {
  const list = Array.isArray(years?.data?.rows)
    ? years.data.rows
    : Array.isArray(years?.data)
    ? years.data
    : Array.isArray(years?.rows)
    ? years.rows
    : Array.isArray(years)
    ? years
    : [];

  if (!list.length) return null;

  const current = list.find(
    (y) => y?.is_current === true || String(y?.is_current) === 'true' || String(y?.is_current) === '1'
  );
  if (current) return current;

  const active = list.find(
    (y) =>
      y?.is_active === true ||
      String(y?.is_active) === 'true' ||
      String(y?.is_active) === '1' ||
      y?.status === 'active'
  );
  if (active) return active;

  return list[0];
}

/**
 * Returns the ID (or value) of the active / current academic year as string, or '' if not found.
 */
export function getActiveAcademicYearId(years = []) {
  const active = getActiveAcademicYear(years);
  if (!active) return '';
  return String(active.value ?? active.id ?? '');
}

/**
 * Normalizes field label and required status so that there are never duplicate asterisks.
 * If the label text contains trailing asterisk(s) (or required is true), it strips all asterisks
 * from the label text and returns { labelText, isRequired: true }.
 */
export function sanitizeFieldLabel(label, required = false) {
  if (typeof label !== 'string') {
    return { labelText: label, isRequired: Boolean(required) };
  }
  const hasAsterisk = /[\s*]*\*+[\s*]*$/.test(label);
  const isRequired = Boolean(required || hasAsterisk);
  const labelText = label.replace(/[\s*]*\*+[\s*]*$/, '').trim();
  return { labelText, isRequired };
}
