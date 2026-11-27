'use client';

import { Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TEST_STATUS } from '@/services/testRecordService';
import { todayPK } from '@/lib/dateUtils';

export const extractList = (d) => {
  if (Array.isArray(d)) return d;
  const x = d?.data;
  if (Array.isArray(x)) return x;
  return x?.rows ?? x?.classes ?? x?.sections ?? d?.rows ?? [];
};

export const fmtDate = (ymd) => {
  if (!ymd) return '—';
  const m = String(ymd).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(ymd);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtNum = (n, digits = 1) =>
  n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : Number(Number(n).toFixed(digits)).toString();

export const SELECT_CLS =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-tca-primary focus:outline-none focus:ring-2 focus:ring-tca-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';

export function FieldLabel({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-tca-dark">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function NativeSelect({ value, onChange, options = [], placeholder = 'Select…', disabled, className }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(SELECT_CLS, className)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function StatusPill({ status }) {
  const s = TEST_STATUS[status] || TEST_STATUS.draft;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold', s.cls)}>
      {s.label}
    </span>
  );
}

export function ResultBadge({ result }) {
  if (!result) return <span className="text-xs text-slate-400">—</span>;
  const map = {
    pass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    fail: 'bg-red-100 text-red-700 border-red-200',
    absent: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize', map[result])}>
      {result}
    </span>
  );
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-tca-primary" /> {label}
    </div>
  );
}

export function ErrorBlock({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle className="mx-auto mb-2 h-7 w-7 text-red-500" />
      <p className="text-sm font-bold text-red-800">{title}</p>
      {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyBlock({ title = 'No test records yet', hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <ClipboardList className="mx-auto mb-2 h-9 w-9 text-slate-300" />
      <p className="text-sm font-semibold text-tca-dark">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function InlineBanner({ tone = 'info', children }) {
  const tones = {
    info: 'border-tca-primary/30 bg-tca-primary/10 text-tca-dark',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    lock: 'border-slate-300 bg-slate-100 text-slate-700',
  };
  return <div className={cn('rounded-lg border px-3 py-2 text-xs font-medium', tones[tone])}>{children}</div>;
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_OPTIONS = MONTH_NAMES.map((n, i) => ({ value: String(i + 1), label: n }));
export const yearOptions = (span = 3) => {
  const y = Number(todayPK().slice(0, 4));
  return Array.from({ length: span + 2 }, (_, i) => String(y - span + i + 1)).map((v) => ({ value: v, label: v })); // past years .. next year
};
/** First/last day (YYYY-MM-DD) of a month, for from_date/to_date list filters. */
export const monthRange = (month, year) => {
  const m = String(month).padStart(2, '0');
  const last = new Date(Number(year), Number(month), 0).getDate();
  return { from_date: `${year}-${m}-01`, to_date: `${year}-${m}-${String(last).padStart(2, '0')}` };
};
export const currentMonthYear = () => {
  const [y, m] = todayPK().split('-');
  return { month: String(Number(m)), year: y };
};
