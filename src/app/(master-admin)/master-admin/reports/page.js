'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, DollarSign, Building2, Users, AlertTriangle, RefreshCw, BarChart3, Inbox, Layers, Award
} from 'lucide-react';

import { PageHeader, DataTable } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { masterAdminService } from '@/services/masterAdminService';
import { Badge } from '@/components/ui/badge';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate   = (v) => v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCcy    = (v) => `PKR ${Number(v).toLocaleString()}`;

const STATUS_COLORS = {
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  unpaid:    'bg-red-50 text-red-650 border-red-100',
  pending:   'bg-amber-50 text-amber-700 border-amber-100',
  active:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  expired:   'bg-slate-50 text-slate-500 border-slate-100',
  trial:     'bg-blue-50 text-blue-700 border-blue-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
  inactive:  'bg-slate-50 text-slate-400 border-slate-100',
};

function StatusChip({ value }) {
  const cls = STATUS_COLORS[value?.toLowerCase()] ?? 'bg-slate-50 text-slate-600 border-slate-100';
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black capitalize border tracking-wide', cls)}>
      {value}
    </span>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────
const REVENUE_COLUMNS = [
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-extrabold text-slate-800 text-[11px] tracking-tight">{getValue()}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <span className="text-[10px] text-slate-500 font-extrabold capitalize bg-slate-50 px-2 py-0.5 rounded border border-slate-100 tracking-wider">{getValue()}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 text-[9px] font-black tracking-wide uppercase">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="font-black text-emerald-700 text-[11px]">{fmtCcy(getValue())}</span>
    ),
  },
  {
    accessorKey: 'month',
    header: 'Month',
    cell: ({ getValue }) => <span className="text-[10px] font-bold text-slate-600">{getValue()}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
  {
    accessorKey: 'paid_on',
    header: 'Paid On',
    cell: ({ getValue }) => <span className="text-[10px] text-slate-450 font-semibold">{fmtDate(getValue())}</span>,
  },
];

const SUBSCRIPTION_COLUMNS = [
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-extrabold text-slate-800 text-[11px] tracking-tight">{getValue()}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 text-[9px] font-black tracking-wide uppercase">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'start',
    header: 'Start Date',
    cell: ({ getValue }) => <span className="text-[10px] font-bold text-slate-600">{fmtDate(getValue())}</span>,
  },
  {
    accessorKey: 'expires',
    header: 'Expiry',
    cell: ({ getValue }) => {
      const d = new Date(getValue());
      const diff = Math.ceil((d - Date.now()) / 86400000);
      return (
        <div>
          <p className="text-[10px] font-bold text-slate-600">{fmtDate(getValue())}</p>
          {diff > 0 && diff <= 30 && (
            <p className="text-[9px] text-amber-600 font-black tracking-wide">⚠ {diff}d left</p>
          )}
          {diff <= 0 && (
            <p className="text-[9px] text-red-500 font-black tracking-wide uppercase">Expired</p>
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
      <span className="font-black text-emerald-700 text-[11px]">{fmtCcy(getValue())}</span>
    ),
  },
];

const INSTITUTES_COLUMNS = [
  {
    accessorKey: 'name',
    header: 'Institute',
    cell: ({ getValue }) => <span className="font-extrabold text-slate-800 text-[11px] tracking-tight">{getValue()}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => (
      <span className="text-[9px] font-black capitalize text-slate-600 bg-slate-100 rounded-full px-2 py-0.5 border border-slate-200 tracking-wider">
        {getValue()}
      </span>
    ),
  },
  { accessorKey: 'city',      header: 'City',     cell: ({ getValue }) => <span className="text-[10px] font-bold text-slate-600">{getValue()}</span> },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 text-[9px] font-black tracking-wide uppercase">
        {getValue()}
      </span>
    ),
  },
  { accessorKey: 'students',  header: 'Students', cell: ({ getValue }) => <span className="font-extrabold text-slate-700 text-[10px]">{getValue().toLocaleString()}</span> },
  { accessorKey: 'teachers',  header: 'Teachers', cell: ({ getValue }) => <span className="font-extrabold text-slate-700 text-[10px]">{getValue().toLocaleString()}</span> },
  { accessorKey: 'branches',  header: 'Branches', cell: ({ getValue }) => <span className="font-extrabold text-slate-700 text-[10px]">{getValue().toLocaleString()}</span> },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    cell: ({ getValue }) => <span className="text-[10px] text-slate-450 font-bold">{fmtDate(getValue())}</span>,
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
          <p className="font-extrabold text-slate-800 text-[11px] leading-tight">{u.name}</p>
          <p className="text-[9px] text-slate-400 font-mono tracking-tight">{u.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => (
      <span className="text-[9px] bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-black uppercase tracking-wider">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'institute',
    header: 'Institute',
    cell: ({ getValue }) => <span className="text-[10px] font-bold text-slate-700">{getValue()}</span>,
  },
  {
    accessorKey: 'logins',
    header: 'Logins',
    cell: ({ getValue }) => <span className="font-black text-slate-800 text-[10px]">{getValue()}</span>,
  },
  {
    accessorKey: 'last_login',
    header: 'Last Login',
    cell: ({ getValue }) => <span className="text-[10px] text-slate-450 font-bold">{fmtDate(getValue())}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip value={getValue()} />,
  },
];

// ─── Minimal Empty State Block ───────────────────────────────────────────────
function EmptyState({ title = 'No Data Available', desc = 'No real-time records are matching your active databases currently.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center animate-in fade-in duration-300">
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-3 text-slate-400">
        <Inbox className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">{title}</h5>
      <p className="text-[10px] text-slate-400 mt-1 max-w-sm leading-relaxed font-bold">{desc}</p>
    </div>
  );
}

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
function RevenueTab({ data = [], reportsData }) {
  const finalData = data.length ? data : [];
  const tbl = usePaginatedTable(finalData, ['institute', 'plan', 'status', 'month']);

  const chartData = reportsData?.revenueGrowth || [];

  return (
    <div className="space-y-6">
      {/* Premium Gradient Chart */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Earnings Tracker</p>
            <h4 className="text-sm font-bold text-slate-800">
              Monthly Revenue Performance
            </h4>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 border font-bold text-[10px] rounded-lg">Realtime Database Sync</Badge>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <BarChart3 className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No revenue entries captured yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={32}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: 11, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`PKR ${v.toLocaleString()}`, 'Revenue']} 
              />
              <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {finalData.length === 0 ? (
        <EmptyState title="No Revenue Records Found" desc="Your platform has not received any invoice payments so far." />
      ) : (
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
      )}
    </div>
  );
}

function SubscriptionsTab({ data = [] }) {
  const tbl = usePaginatedTable(data, ['institute', 'plan', 'status']);
  
  if (data.length === 0) {
    return <EmptyState title="No Subscriptions Found" desc="There are no active school subscription plans in the database." />;
  }

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
  const tbl = usePaginatedTable(data, ['name', 'city', 'plan', 'type', 'status']);

  if (data.length === 0) {
    return <EmptyState title="No Institutes Found" desc="No educational campuses have registered on the platform yet." />;
  }

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
  const tbl = usePaginatedTable(data, ['name', 'role', 'institute', 'status']);

  if (data.length === 0) {
    return <EmptyState title="No User Activity Found" desc="No user sessions or login triggers have occurred on the system." />;
  }

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
    label: 'Revenue (Prev)',
    icon:  TrendingUp,
    bg:    'bg-blue-50',
    color: 'text-blue-600',
    fmt:   fmtCcy,
  },
  {
    key:   'active_institutes',
    label: 'Active Institiute',
    icon:  Building2,
    bg:    'bg-violet-50',
    color: 'text-violet-600',
    fmt:   (v) => v,
  },
  {
    key:   'overdue_payments',
    label: 'Overdue Vouchers',
    icon:  AlertTriangle,
    bg:    'bg-red-50',
    color: 'text-red-500',
    fmt:   (v) => v,
  },
  {
    key:   'new_institutes_mtd',
    label: 'New Signups',
    icon:  RefreshCw,
    bg:    'bg-teal-50',
    color: 'text-teal-600',
    fmt:   (v) => v,
  },
  {
    key:   'mrr',
    label: 'MRR',
    icon:  TrendingUp,
    bg:    'bg-indigo-50',
    color: 'text-indigo-600',
    fmt:   fmtCcy,
  },
  {
    key:   'churnRate',
    label: 'Churn Rate',
    icon:  AlertTriangle,
    bg:    'bg-orange-50',
    color: 'text-orange-500',
    fmt:   (v) => `${v}%`,
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
        // 1. Invoices (100% Realtime, no fallbacks)
        let invRows = [];
        try {
          const invRes = await masterAdminService.getAllInvoices({ limit: 100 });
          invRows = invRes?.data?.rows ?? invRes?.rows ?? invRes?.data ?? invRes ?? [];
        } catch (e) {
          console.error("Failed to query live invoices:", e);
        }
        
        if (Array.isArray(invRows) && invRows.length > 0) {
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
        } else {
          setRevenueList([]);
          setSubscriptionsList([]);
        }

        // 2. Institutes (105% Realtime)
        let instRows = [];
        try {
          const instRes = await masterAdminService.getSchools({ limit: 100 });
          instRows = instRes?.data?.rows ?? instRes?.rows ?? instRes?.data ?? instRes ?? [];
        } catch (e) {
          console.error("Failed to query live schools:", e);
        }

        if (Array.isArray(instRows) && instRows.length > 0) {
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
        } else {
          setInstitutesList([]);
        }

        // 3. Users (100% Realtime)
        let userRows = [];
        try {
          const userRes = await masterAdminService.getUsers({ limit: 100 });
          userRows = userRes?.data?.rows ?? userRes?.rows ?? userRes?.data ?? userRes ?? [];
        } catch (e) {
          console.error("Failed to query live users:", e);
        }

        if (Array.isArray(userRows) && userRows.length > 0) {
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
        } else {
          setUsersList([]);
        }
      } catch (e) {
        console.error('Failed to fetch real lists data', e);
      }
    };
    loadAllData();
  }, []);

  const liveSummary = useMemo(() => {
    return {
      total_revenue_mtd: reportsData?.thisMonthRevenue || 0,
      prev_month_revenue: reportsData?.prevMonthRevenue || 0,
      active_institutes: reportsData?.activeInstitutes || 0,
      overdue_payments: reportsData?.overduePayments || 0,
      new_institutes_mtd: reportsData?.newInstitutesMTD || 0,
      mrr: reportsData?.mrr || 0,
      churnRate: reportsData?.churnRate || 0,
    };
  }, [reportsData]);

  // Local breakdowns compiled reactively from active real list
  const localBreakdown = useMemo(() => {
    // 1. Plan breakdown from revenueList
    const plansMap = {};
    revenueList.forEach(item => {
      const planName = item.plan || 'Standard';
      if (!plansMap[planName]) plansMap[planName] = { plan_name: planName, count: 0, total: 0 };
      plansMap[planName].count += 1;
      plansMap[planName].total += item.amount;
    });
    const planBreakdown = Object.values(plansMap).sort((a,b) => b.total - a.total);

    // 2. Institute breakdown from revenueList
    const instsMap = {};
    revenueList.forEach(item => {
      const instName = item.institute || 'Unknown';
      if (!instsMap[instName]) instsMap[instName] = { institute_name: instName, count: 0, total: 0 };
      instsMap[instName].count += 1;
      instsMap[instName].total += item.amount;
    });
    const instituteBreakdown = Object.values(instsMap).sort((a,b) => b.total - a.total).slice(0, 5);

    return { planBreakdown, instituteBreakdown };
  }, [revenueList]);

  const activePlanBreakdown = reportsData?.planBreakdown || localBreakdown.planBreakdown;
  const activeInstituteBreakdown = reportsData?.instituteBreakdown || localBreakdown.instituteBreakdown;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="📊 Platform Reports"
        description="Comprehensive analytics detailing monthly platform revenue, index of school subscriptions, campus size ratios and master users log."
      />

      {/* Stunning Stat Cards Grid with Scale & Glow on Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 animate-in fade-in duration-300">
        {SUMMARY_CARDS.map((c) => {
          const rawVal = liveSummary[c.key] ?? 0;
          return (
            <div 
              key={c.key} 
              className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 group-hover:text-primary transition-colors">{c.label}</span>
                <div className={cn('rounded-2xl p-2.5 shrink-0 transition-transform duration-300 group-hover:rotate-6', c.bg)}>
                  <c.icon className={cn('w-4 h-4', c.color)} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                  {c.fmt(rawVal)}
                </h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live platform sync
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Analytics Breakdown Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Plan Breakdown */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="p-2 bg-violet-50 rounded-xl">
              <Layers className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Plans Breakdown</h3>
          </div>
          {(!activePlanBreakdown || activePlanBreakdown.length === 0) ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-[10px] uppercase tracking-widest font-black">No Active Invoices</p>
              <p className="text-[9px] font-bold text-slate-400/80 mt-0.5">No subscription breakdown compile is active.</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {activePlanBreakdown.map((p, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-none last:pb-0">
                  <div>
                    <p className="text-xs font-extrabold text-slate-750">{p.plan_name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">{p.count} Active Invoices</p>
                  </div>
                  <span className="font-black text-xs text-slate-800">{fmtCcy(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Institute Breakdown */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Top Campus Contributions</h3>
          </div>
          {(!activeInstituteBreakdown || activeInstituteBreakdown.length === 0) ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-[10px] uppercase tracking-widest font-black">No Contribution Log</p>
              <p className="text-[9px] font-bold text-slate-400/80 mt-0.5">No real-time contribution metrics compile is active.</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {activeInstituteBreakdown.map((inst, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-none last:pb-0">
                  <div>
                    <p className="text-xs font-extrabold text-slate-750">{inst.institute_name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">{inst.count} Paid Vouchers</p>
                  </div>
                  <span className="font-black text-xs text-emerald-600">{fmtCcy(inst.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="revenue" className="font-extrabold text-[10.5px] rounded-lg tracking-wide">💰 Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions" className="font-extrabold text-[10.5px] rounded-lg tracking-wide">📋 Active Subs</TabsTrigger>
          <TabsTrigger value="institutes" className="font-extrabold text-[10.5px] rounded-lg tracking-wide">🏫 Campus Index</TabsTrigger>
          <TabsTrigger value="users" className="font-extrabold text-[10.5px] rounded-lg tracking-wide">👥 Platform Users</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="animate-in fade-in duration-200">
          <RevenueTab data={revenueList} reportsData={reportsData} />
        </TabsContent>

        <TabsContent value="subscriptions" className="animate-in fade-in duration-200">
          <SubscriptionsTab data={subscriptionsList} />
        </TabsContent>

        <TabsContent value="institutes" className="animate-in fade-in duration-200">
          <InstitutesTab data={institutesList} />
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in duration-200">
          <UserActivityTab data={usersList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
