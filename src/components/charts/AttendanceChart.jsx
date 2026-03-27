'use client';
/**
 * AttendanceChart — Area chart showing monthly attendance %, absences & late
 * Uses recharts AreaChart
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  present: 'hsl(var(--chart-1))',
  absent:  'hsl(var(--chart-4))',
  late:    'hsl(var(--chart-3))',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm space-y-1 min-w-[150px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function AttendanceChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.present} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.present} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.absent} stopOpacity={0.20} />
            <stop offset="95%" stopColor={COLORS.absent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Area type="monotone" dataKey="present" name="Present" stroke={COLORS.present} strokeWidth={2} fill="url(#gradPresent)" dot={false} activeDot={{ r: 5 }} />
        <Area type="monotone" dataKey="absent"  name="Absent"  stroke={COLORS.absent}  strokeWidth={2} fill="url(#gradAbsent)"  dot={false} activeDot={{ r: 5 }} />
        <Area type="monotone" dataKey="late"    name="Late"    stroke={COLORS.late}    strokeWidth={2} fill="none"              dot={false} activeDot={{ r: 5 }} strokeDasharray="4 3" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
