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

export default function StatsCard({ 
  label, value, icon, description, trend, loading, 
  variant = 'default', className 
}) {
  const variants = {
    default: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose:    'bg-rose-100 text-rose-600',
    amber:   'bg-amber-100 text-amber-600',
    indigo:  'bg-indigo-100 text-indigo-600',
    cyan:    'bg-cyan-100 text-cyan-600',
    violet:  'bg-violet-100 text-violet-600',
  };

  const cardVariants = {
    default: 'border-slate-200',
    emerald: 'border-emerald-100 bg-emerald-50/30',
    rose:    'border-rose-100 bg-rose-50/30',
    amber:   'border-amber-100 bg-amber-50/30',
    indigo:  'border-indigo-100 bg-indigo-50/30',
    cyan:    'border-cyan-100 bg-cyan-50/30',
    violet:  'border-violet-100 bg-violet-50/30',
  };

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md", cardVariants[variant], className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", variants[variant])}>
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
