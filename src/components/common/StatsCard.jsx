/**
 * StatsCard
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string          required
 *   value       string|number   required
 *   icon        ReactNode        optional icon
 *   description string          optional sub-text
 *   trend       number          optional %  (positive = green, negative = red)
 *   loading     boolean
 *
 * Usage:
 *   <StatsCard
 *     label="Total Students"
 *     value={420}
 *     icon={<Users size={20} />}
 *     trend={+5.2}
 *     description="vs last month"
 *   />
 */
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsCard({ label, value, icon, description, trend, loading }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-2 space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value ?? '—'}
          </p>

          <div className="mt-1 flex items-center gap-2">
            {trend != null && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  trend >= 0 ? 'text-green-600' : 'text-red-500',
                )}
              >
                {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(trend)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
