'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, DollarSign, Building2, Users, AlertTriangle, CalendarDays, RefreshCw,
} from 'lucide-react';

import {
  REPORT_SUMMARY,
} from '@/data/masterAdminDummyData';
import { PageHeader, DataTable } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { masterAdminService } from '@/services/masterAdminService';

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
function RevenueTab({ data = [] }) {
  const finalData = data.length ? data : [];
  const tbl = usePaginatedTable(finalData, ['institute', 'plan', 'status', 'month']);

  // Build chart data from full dataset
  const chartData = useMemo(() => {
    const map = {};
    finalData.forEach(({ month, amount }) => {
      if (!map[month]) map[month] = { month, Revenue: 0 };
      map[month].Revenue += amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [finalData]);

  return (
    <div className="space-y-4">
      {/* Mini chart */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          {data.length ? 'Monthly Revenue Breakdown' : 'Monthly Revenue (Dummy Preview)'}
        </p>
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

function SubscriptionsTab({ data = [] }) {
  const finalData = data.length ? data : [];
  const tbl = usePaginatedTable(finalData, ['institute', 'plan', 'status']);
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

function InstitutesTab({ data = [] }) {
  const finalData = data.length ? data : [];
  const tbl = usePaginatedTable(finalData, ['name', 'city', 'plan', 'type', 'status']);
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

function UserActivityTab({ data = [] }) {
  const finalData = data.length ? data : [];
  const tbl = usePaginatedTable(finalData, ['name', 'role', 'institute', 'status']);
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
    key:   'prev_month_revenue',
    label: 'Revenue (Prev Month)',
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
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [revenueList, setRevenueList] = useState([]);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [institutesList, setInstitutesList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await masterAdminService.getReports();
        setReportsData(data);
      } catch (e) {
        console.error('Failed to load master admin reports:', e);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Invoices
        const invRes = await masterAdminService.getAllInvoices({ limit: 100 });
        const invRows = invRes?.data?.rows ?? invRes?.rows ?? invRes?.data ?? invRes ?? [];
        
        if (Array.isArray(invRows)) {
          const revData = invRows.map(inv => ({
            id: inv.id,
            institute: inv.institute?.institute_name || 'Unknown',
            type: inv.institute?.type?.name || 'School',
            plan: inv.plan?.name || 'Standard',
            amount: parseFloat(inv.total_amount) || 0,
            month: new Date(inv.period_start || inv.created_at).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
            status: inv.status,
            paid_on: inv.paid_at || inv.created_at,
          }));
          setRevenueList(revData);

          const subData = invRows.map(inv => ({
            id: inv.id,
            institute: inv.institute?.institute_name || 'Unknown',
            plan: inv.plan?.name || 'Standard',
            start: inv.period_start,
            expires: inv.period_end,
            status: inv.status === 'PAID' ? 'active' : inv.status === 'OVERDUE' ? 'expired' : 'trial',
            amount: parseFloat(inv.total_amount) || 0
          }));
          setSubscriptionsList(subData);
        }

        // 2. Institutes
        const instRes = await masterAdminService.getSchools({ limit: 100 });
        const instRows = instRes?.data?.rows ?? instRes?.rows ?? instRes?.data ?? instRes ?? [];
        if (Array.isArray(instRows)) {
          const mappedInst = instRows.map(inst => ({
            id: inst.id,
            name: inst.institute_name || 'Unknown',
            type: inst.type?.name || 'School',
            city: inst.institute_city || '—',
            plan: inst.plan?.name || 'Standard',
            students: inst.student_count || 0,
            teachers: inst.teacher_count || 0,
            branches: inst.branch_count || 1,
            status: inst.is_active ? 'active' : 'inactive',
            joined: inst.created_at
          }));
          setInstitutesList(mappedInst);
        }

        // 3. Users
        const userRes = await masterAdminService.getUsers({ limit: 100 });
        const userRows = userRes?.data?.rows ?? userRes?.rows ?? userRes?.data ?? userRes ?? [];
        if (Array.isArray(userRows)) {
          const mappedUsers = userRows.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name || ''}`,
            email: u.email,
            role: u.user_type,
            institute: u.institute?.institute_name || 'Platform Admin',
            logins: u.login_count || 1,
            last_login: u.last_login_at || u.created_at,
            status: u.is_active ? 'active' : 'inactive'
          }));
          setUsersList(mappedUsers);
        }
      } catch (e) {
        console.error('Failed to fetch real lists data', e);
      }
    };
    loadAllData();
  }, []);

  const liveSummary = useMemo(() => {
    if (!reportsData) return REPORT_SUMMARY;
    return {
      total_revenue_mtd: reportsData.thisMonthRevenue || 0,
      prev_month_revenue: reportsData.prevMonthRevenue || 0,
      active_institutes: reportsData.activeInstitutes || 0,
      overdue_payments: reportsData.overduePayments || 0,
      new_institutes_mtd: reportsData.newInstitutesMTD || 0
    };
  }, [reportsData]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="📊 Reports"
        description="Platform-wide analytics: revenue, subscriptions, institutes, and user activity"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY_CARDS.map((c) => (
          <div key={c.key} className="flex items-center gap-2 rounded-xl border bg-white p-3 shadow-sm">
            <div className={cn('rounded-lg p-2 shrink-0', c.bg)}>
              <c.icon size={14} className={c.color} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold leading-none text-slate-800 truncate">
                {c.fmt(liveSummary[c.key] ?? 0)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                {c.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Analytics Block (When Real Data Loaded) */}
      {reportsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Revenue by Plan Breakdown */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Revenue Breakdown by Plan</h3>
            {reportsData.planBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No breakdown available</p>
            ) : (
              <div className="space-y-3">
                {reportsData.planBreakdown.map((p, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-none last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{p.plan_name}</p>
                      <p className="text-[10px] text-slate-400">{p.count} Transactions</p>
                    </div>
                    <span className="font-extrabold text-sm text-slate-800">{fmtCcy(p.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue by Institute Breakdown */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Revenue by Institute</h3>
            {reportsData.instituteBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No breakdown available</p>
            ) : (
              <div className="space-y-3">
                {reportsData.instituteBreakdown.map((inst, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-none last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{inst.institute_name}</p>
                      <p className="text-[10px] text-slate-400">{inst.count} Transactions</p>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-600">{fmtCcy(inst.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="revenue">💰 Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">📋 Subscriptions</TabsTrigger>
          <TabsTrigger value="institutes">🏫 Institutes</TabsTrigger>
          <TabsTrigger value="users">👥 User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueTab data={revenueList} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsTab data={subscriptionsList} />
        </TabsContent>

        <TabsContent value="institutes">
          <InstitutesTab data={institutesList} />
        </TabsContent>

        <TabsContent value="users">
          <UserActivityTab data={usersList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
