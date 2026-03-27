/**
 * The Clouds Academy — Utility helpers
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance } from 'date-fns';

// ── Tailwind class merge ──────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ───────────────────────────────────────────────────────
export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '—';
  return format(new Date(date), pattern);
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
