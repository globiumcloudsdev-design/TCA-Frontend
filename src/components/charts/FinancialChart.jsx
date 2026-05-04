'use client';
/**
 * FinancialChart — Line + Bar chart showing monthly income vs expenses
 */
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area,
} from 'recharts';

const COLORS = {
  income: 'hsl(var(--chart-1))',
  expense: 'hsl(var(--chart-4))',
};

function fmt(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
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
            <span className="h-2 w-2 rounded-full" style={{ background: p.stroke || p.fill }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">PKR {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function FinancialChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        
        <Bar 
          dataKey="income" 
          name="Total Income" 
          fill={COLORS.income} 
          radius={[4, 4, 0, 0]} 
          maxBarSize={35}
          fillOpacity={0.8}
        />
        
        <Line 
          type="monotone" 
          dataKey="expense" 
          name="Expenses" 
          stroke={COLORS.expense} 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
