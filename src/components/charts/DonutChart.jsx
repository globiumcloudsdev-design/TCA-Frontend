'use client';
/**
 * DonutChart — Recharts PieChart with center label (used for gender & fee status)
 */
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total = payload[0].payload?.total ?? 0;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm min-w-[130px]">
      <p className="font-semibold mb-1">{name}</p>
      <p>{value}{total ? ` (${Math.round((value / total) * 100)}%)` : ''}</p>
    </div>
  );
}

export default function DonutChart({ data = [], innerRadius = 55, outerRadius = 85, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  // inject total so tooltip can show %
  const enriched = data.map((d) => ({ ...d, total }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {enriched.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
          {/* Center label via label prop is tricky — we use a custom label instead */}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value, entry) => (
            <span style={{ color: 'hsl(var(--foreground))' }}>
              {value} ({entry.payload.value})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
