'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, DollarSign, Building2, Users, AlertTriangle, CalendarDays, RefreshCw,
} from 'lucide-react';

import {
  DUMMY_REVENUE_REPORT,
  DUMMY_SUBSCRIPTION_REPORT,
  DUMMY_INSTITUTES_REPORT,
  DUMMY_USER_ACTIVITY,
  REPORT_SUMMARY,
} from '@/data/masterAdminDummyData';
import { PageHeader, DataTable } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate   = (v) => v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCcy    = (v) => `PKR ${Number(v).toLocaleString()}`;

const STATUS_COLORS = {
  paid:      'bg-emerald-100 text-emerald-700',
  unpaid:    'bg-red-100 text-red-600',
  pending:   'bg-amber-100 text-amber-700',
  active:    'bg-emerald-100 text-emerald-700',
  expired:   'bg-slate-100 text-slate-500',
  trial:     'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  inactive:  'bg-slate-100 text-slate-500',
};

function StatusChip({ value }) {
  const cls = STATUS_COLORS[value?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', cls)}>
      {value}
    </span>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────
const REVENUE_COLUMNS = [
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <span className="text-sm text-slate-600 capitalize">{getValue()}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-semibold">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="font-semibold text-emerald-700">{fmtCcy(getValue())}</span>
    ),
  },
  {
    accessorKey: 'month',
    header: 'Month',
    cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
  {
    accessorKey: 'paid_on',
    header: 'Paid On',
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
  },
];

const SUBSCRIPTION_COLUMNS = [
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-semibold">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'start',
    header: 'Start Date',
    cell: ({ getValue }) => <span className="text-xs text-slate-600">{fmtDate(getValue())}</span>,
  },
  {
    accessorKey: 'expires',
    header: 'Expiry',
    cell: ({ getValue }) => {
      const d = new Date(getValue());
      const diff = Math.ceil((d - Date.now()) / 86400000);
      return (
        <div>
          <p className="text-xs text-slate-600">{fmtDate(getValue())}</p>
          {diff > 0 && diff <= 30 && (
            <p className="text-[11px] text-amber-600 font-medium">⚠ {diff}d left</p>
          )}
          {diff <= 0 && (
            <p className="text-[11px] text-red-500 font-medium">Expired</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="font-semibold text-emerald-700">{fmtCcy(getValue())}</span>
    ),
  },
];

const INSTITUTES_COLUMNS = [
  {
    accessorKey: 'name',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => (
      <span className="text-xs capitalize text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">
        {getValue()}
      </span>
    ),
  },
  { accessorKey: 'city',      header: 'City',     cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span> },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-semibold">
        {getValue()}
      </span>
    ),
  },
  { accessorKey: 'students',  header: 'Students', cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span> },
  { accessorKey: 'teachers',  header: 'Teachers', cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span> },
  { accessorKey: 'branches',  header: 'Branches', cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span> },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
  },
];

const USER_ACTIVITY_COLUMNS = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div>
          <p className="font-medium text-slate-800">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => (
      <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
  },
  {
    accessorKey: 'logins',
    header: 'Logins',
    cell: ({ getValue }) => <span className="font-semibold text-slate-700">{getValue()}</span>,
  },
  {
    accessorKey: 'last_login',
    header: 'Last Login',
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
];

// ─── usePaginatedTable hook ───────────────────────────────────────────────────
function usePaginatedTable(data, searchFields = []) {
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search,   setSearch]   = useState('');

  const filtered = useMemo(() => {
    if (!search || !searchFields.length) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchFields.some((f) => String(row[f] ?? '').toLowerCase().includes(q)),
    );
  }, [data, search, searchFields]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch  = (v) => { setSearch(v); setPage(1); };
  const handleSize    = (s) => { setPageSize(s); setPage(1); };

  return {
    pageData, page, setPage, pageSize, handleSize, total, totalPages,
    search, handleSearch,
    pagination: {
      page, totalPages, total, pageSize,
      onPageChange:     (p) => setPage(p),
      onPageSizeChange: handleSize,
    },
  };
}

// ─── Tab components ───────────────────────────────────────────────────────────
function RevenueTab() {
  const tbl = usePaginatedTable(DUMMY_REVENUE_REPORT, ['institute', 'plan', 'status', 'month']);

  // Build chart data from full dataset
  const chartData = useMemo(() => {
    const map = {};
    DUMMY_REVENUE_REPORT.forEach(({ month, amount }) => {
      if (!map[month]) map[month] = { month, Revenue: 0 };
      map[month].Revenue += amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  return (
    <div className="space-y-4">
      {/* Mini chart */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Monthly Revenue (Dummy Preview)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={REVENUE_COLUMNS}
        data={tbl.pageData}
        emptyMessage="No revenue records found"
        search={tbl.search}
        onSearch={tbl.handleSearch}
        searchPlaceholder="Search institute, plan…"
        enableColumnVisibility
        exportConfig={{ fileName: 'revenue-report', dateField: 'paid_on' }}
        pagination={tbl.pagination}
      />
    </div>
  );
}

function SubscriptionsTab() {
  const tbl = usePaginatedTable(DUMMY_SUBSCRIPTION_REPORT, ['institute', 'plan', 'status']);
  return (
    <DataTable
      columns={SUBSCRIPTION_COLUMNS}
      data={tbl.pageData}
      emptyMessage="No subscription records found"
      search={tbl.search}
      onSearch={tbl.handleSearch}
      searchPlaceholder="Search institute, plan…"
      enableColumnVisibility
      exportConfig={{ fileName: 'subscription-report', dateField: 'expires' }}
      pagination={tbl.pagination}
    />
  );
}

function InstitutesTab() {
  const tbl = usePaginatedTable(DUMMY_INSTITUTES_REPORT, ['name', 'city', 'plan', 'type', 'status']);
  return (
    <DataTable
      columns={INSTITUTES_COLUMNS}
      data={tbl.pageData}
      emptyMessage="No institute records found"
      search={tbl.search}
      onSearch={tbl.handleSearch}
      searchPlaceholder="Search institute, city, plan…"
      enableColumnVisibility
      exportConfig={{ fileName: 'institutes-report', dateField: 'joined' }}
      pagination={tbl.pagination}
    />
  );
}

function UserActivityTab() {
  const tbl = usePaginatedTable(DUMMY_USER_ACTIVITY, ['name', 'role', 'institute', 'status']);
  return (
    <DataTable
      columns={USER_ACTIVITY_COLUMNS}
      data={tbl.pageData}
      emptyMessage="No user activity data found"
      search={tbl.search}
      onSearch={tbl.handleSearch}
      searchPlaceholder="Search name, role, institute…"
      enableColumnVisibility
      exportConfig={{ fileName: 'user-activity-report', dateField: 'last_login' }}
      pagination={tbl.pagination}
    />
  );
}

// ─── Summary Stats Strip ──────────────────────────────────────────────────────
const SUMMARY_CARDS = [
  {
    key:   'total_revenue_mtd',
    label: 'Revenue (MTD)',
    icon:  DollarSign,
    bg:    'bg-emerald-50',
    color: 'text-emerald-600',
    fmt:   fmtCcy,
  },
  {
    key:   'total_revenue_ytd',
    label: 'Revenue (YTD)',
    icon:  TrendingUp,
    bg:    'bg-blue-50',
    color: 'text-blue-600',
    fmt:   fmtCcy,
  },
  {
    key:   'active_institutes',
    label: 'Active Institutes',
    icon:  Building2,
    bg:    'bg-violet-50',
    color: 'text-violet-600',
    fmt:   (v) => v,
  },
  {
    key:   'expiring_subs',
    label: 'Expiring Soon',
    icon:  CalendarDays,
    bg:    'bg-amber-50',
    color: 'text-amber-600',
    fmt:   (v) => v,
  },
  {
    key:   'overdue_payments',
    label: 'Overdue Payments',
    icon:  AlertTriangle,
    bg:    'bg-red-50',
    color: 'text-red-500',
    fmt:   (v) => v,
  },
  {
    key:   'new_institutes_mtd',
    label: 'New Institutes (MTD)',
    icon:  RefreshCw,
    bg:    'bg-teal-50',
    color: 'text-teal-600',
    fmt:   (v) => v,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="📊 Reports"
        description="Platform-wide analytics: revenue, subscriptions, institutes, and user activity"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SUMMARY_CARDS.map((c) => (
          <div key={c.key} className="flex items-center gap-2 rounded-xl border bg-white p-3 shadow-sm">
            <div className={cn('rounded-lg p-2 shrink-0', c.bg)}>
              <c.icon size={14} className={c.color} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold leading-none text-slate-800 truncate">
                {c.fmt(REPORT_SUMMARY[c.key])}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                {c.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="revenue">💰 Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">📋 Subscriptions</TabsTrigger>
          <TabsTrigger value="institutes">🏫 Institutes</TabsTrigger>
          <TabsTrigger value="users">👥 User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsTab />
        </TabsContent>

        <TabsContent value="institutes">
          <InstitutesTab />
        </TabsContent>

        <TabsContent value="users">
          <UserActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
