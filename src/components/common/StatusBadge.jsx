/**
 * StatusBadge — Colored badge for status values
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   status    string   the raw status value (e.g. 'paid', 'present', 'active')
 *   label     string   optional override label (defaults to capitalized status)
 *
 * Built-in status → variant mappings (can add more):
 *   paid, present, active, published, success, approved → success (green)
 *   unpaid, absent, inactive, draft, pending            → warning/danger
 *   partial, late                                        → warning (yellow)
 *   waived, info                                         → info (blue)
 *   default                                              → secondary (grey)
 *
 * Usage:
 *   <StatusBadge status="paid" />
 *   <StatusBadge status="absent" label="Not Present" />
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_MAP = {
  // success (green)
  paid:       'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  present:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  active:     'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  published:  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  approved:   'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  success:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  current:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',

  // danger (red)
  unpaid:     'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  absent:     'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  failed:     'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  rejected:   'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  cancelled:  'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  inactive:   'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300',

  // warning (yellow)
  partial:    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  late:       'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  leave:      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',

  // info (blue)
  waived:     'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  info:       'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',

  // draft (grey)
  draft:      'bg-muted text-muted-foreground border-border',
};

export default function StatusBadge({ status = '', label }) {
  const key   = String(status).toLowerCase();
  const style = STATUS_MAP[key] ?? 'bg-muted text-muted-foreground border-border';
  const text  = label ?? (key.charAt(0).toUpperCase() + key.slice(1));

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap font-medium', style)}
    >
      {text}
    </Badge>
  );
}
