'use client';
/**
 * EnrollmentChart — Horizontal grouped bar chart: boys vs girls per class
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = {
  boys:  'hsl(var(--chart-1))',
  girls: 'hsl(var(--chart-2))',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm space-y-1 min-w-[150px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t flex justify-between text-xs font-semibold">
        <span className="text-muted-foreground">Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
}

export default function EnrollmentChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="class" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="boys"  name="Boys"  fill={COLORS.boys}  radius={[0, 4, 4, 0]} maxBarSize={18} />
        <Bar dataKey="girls" name="Girls" fill={COLORS.girls} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
