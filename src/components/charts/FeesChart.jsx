'use client';
/**
 * FeesChart — Grouped bar chart showing monthly collected vs pending fees
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  collected: 'hsl(var(--chart-1))',
  pending:   'hsl(var(--chart-4))',
};

function fmt(v) {
  if (v >= 100000) return `${(v / 1000).toFixed(0)}k`;
  return v.toLocaleString();
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm space-y-1 min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">PKR {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function FeesChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="collected" name="Collected" fill={COLORS.collected} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="pending"   name="Pending"   fill={COLORS.pending}   radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
