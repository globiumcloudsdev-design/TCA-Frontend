import React, { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  MoreHorizontal,
  Calendar,
  ChevronRight,
  Users,
  CreditCard,
  Receipt,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Elegant Light-Modern Theme ---
const MOCK_STATS = [
  {
    label: "Annual Revenue",
    value: "$1.24M",
    icon: DollarSign,
    trend: "+12.5%",
    trendUp: true,
    color: "text-indigo-600",
    bg: "bg-gradient-to-br from-indigo-50/80 to-indigo-100/20",
    border: "border-indigo-100/50",
    dot: "bg-indigo-400"
  },
  {
    label: "Total Collected",
    value: "$880.2k",
    icon: Receipt,
    trend: "+5.2%",
    trendUp: true,
    color: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/20",
    border: "border-emerald-100/50",
    dot: "bg-emerald-400"
  },
  {
    label: "Pending Dues",
    value: "$360.3k",
    icon: AlertCircle,
    trend: "-2.1%",
    trendUp: false,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50/80 to-amber-100/20",
    border: "border-amber-100/50",
    dot: "bg-amber-400"
  },
  {
    label: "Daily Collection",
    value: "$12.4k",
    icon: CreditCard,
    trend: "+14.2%",
    trendUp: true,
    color: "text-violet-600",
    bg: "bg-gradient-to-br from-violet-50/80 to-violet-100/20",
    border: "border-violet-100/50",
    dot: "bg-violet-400"
  },
];

const MOCK_CHART_DATA = [
  { month: "Jan", collected: 120, expected: 150 },
  { month: "Feb", collected: 135, expected: 150 },
  { month: "Mar", collected: 142, expected: 150 },
  { month: "Apr", collected: 148, expected: 150 },
  { month: "May", collected: 155, expected: 150 },
  { month: "Jun", collected: 180, expected: 150 },
  { month: "Jul", collected: 170, expected: 150 },
];

const generateMockData = () => {
  const names = ["Alex Johnson", "Sarah Smith", "Michael Brown", "Emma Davis", "James Wilson", "Sophia Taylor", "David Miller", "Olivia Garcia", "Robert Lee", "Isabella Chen"];
  const classes = ["Grade 10-A", "Grade 9-B", "Grade 11-Science", "Grade 8-C", "Grade 12-Arts"];
  const statuses = ["Paid", "Overdue", "Partial"];

  return Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    regNo: `REG-2023-${(i + 1).toString().padStart(3, "0")}`,
    class: classes[i % classes.length],
    amount: `$${(800 + i * 10).toLocaleString()}`,
    status: statuses[i % 3],
    date: "2026-04-10",
  }));
};

const MOCK_TABLE_DATA = generateMockData();

export default function FeeCollectionDummyApp() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const filteredData = useMemo(() => {
    return MOCK_TABLE_DATA.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regNo.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  if (!mounted) return null;

  const columns = [
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50/50 text-indigo-600 font-semibold text-[10px] border border-indigo-100 shadow-sm">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">{row.original.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase leading-none mt-1">{row.original.regNo}</span>
          </div>
        </div>
      ),
    },
    { accessorKey: "class", header: "Class" },
    { accessorKey: "amount", header: "Amount" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue();
        const config = {
          Paid: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
          Overdue: "bg-rose-50 text-rose-600 border-rose-100/50",
          Partial: "bg-amber-50 text-amber-600 border-amber-100/50",
        };
        return (
          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider shadow-sm", config[val] || "bg-slate-50")}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => <span className="text-slate-400 text-xs font-medium block text-center">{getValue()}</span>,
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-full">
          <MoreHorizontal size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* --- ELEGANT SOFT COLORFUL HEADER --- */}
      <div className="relative rounded-2xl p-8 overflow-hidden bg-white border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50 opacity-40 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase tracking-wider border border-indigo-100 shadow-sm">
              <Sparkles size={12} /> Live Financial Analytics
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Fee Collection Dashboard
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-xl">
              Visualize your institute's collection efficiency with precision and modern analytics.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-10 border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} className="mr-2" /> Export Excel
            </Button>
            <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 text-xs font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95">
              <FileText size={14} className="mr-2" /> Daily Report
            </Button>
          </div>
        </div>
      </div>

      {/* --- SOFT GRADIENT STATS --- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={cn("group rounded-2xl border p-5 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden", stat.bg, stat.border)}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={cn("p-2.5 rounded-xl bg-white shadow-sm transition-all group-hover:scale-110", stat.color)}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className={cn("flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border-2 shadow-sm", stat.trendUp ? "bg-emerald-50 text-emerald-600 border-white/50" : "bg-rose-50 text-rose-600 border-white/50")}>
                  {stat.trendUp ? "+" : ""}{stat.trend}
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</h3>
              </div>
              {/* Decorative Dot */}
              <div className={cn("absolute bottom-4 right-4 w-4 h-4 rounded-full blur-sm opacity-20", stat.dot)} />
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* --- LIGHT ELEGANT CHART --- */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Collection Velocity</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Real-time payments vs targets</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 border border-slate-100 rounded-lg px-2 py-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" /> REVENUE
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 border border-slate-100 rounded-lg px-2 py-1">
                <div className="w-2 h-2 rounded-full bg-slate-200 shadow-sm" /> TARGET
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="softWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `$${v}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", padding: "10px", fontSize: "11px", fontWeight: 800, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(5px)" }}
                  cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#softWave)" animationDuration={1000} />
                <Area type="monotone" dataKey="expected" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- PERFORMANCE INSIGHTS --- */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/30 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">Payment Channels</h3>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-8">Efficiency Breakdown</p>
            
            <div className="space-y-7">
              {[
                { l: "Digital Banking", p: 82, c: "bg-indigo-500", b: "bg-indigo-100" },
                { l: "Cash Desk", p: 15, c: "bg-emerald-500", b: "bg-emerald-100" },
                { l: "Cheques", p: 3, c: "bg-amber-500", b: "bg-amber-100" },
              ].map((it, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{it.l}</span>
                    <span className="text-slate-900">{it.p}%</span>
                  </div>
                  <div className={cn("h-1.5 w-full rounded-full", it.b)}>
                    <div className={cn("h-full rounded-full transition-all duration-1000")} style={{ width: `${it.p}%`, backgroundColor: it.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full blur-2xl opacity-40 pointer-events-none" />
            <div className="flex items-center gap-2.5 text-amber-500 mb-2 relative z-10">
              <AlertCircle size={16} strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Action Required</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
              There are <span className="text-indigo-600 font-semibold">12 high-priority</span> invoices pending. We recommend sending automated reminders.
            </p>
          </div>
        </div>
      </div>

      {/* --- CLEAN LEDGER TABLE --- */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden border-b-2">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recent Transactions</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Updated 2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search students or vouchers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="sm" className="h-[40px] border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl px-3 shadow-sm transition-all">
              <Filter size={16} />
            </Button>
          </div>
        </div>

        <div className="p-0 compact-table border-none">
          <DataTable
            columns={columns}
            data={paginatedData}
            pagination={{
              page: currentPage,
              totalPages: totalPages,
              total: filteredData.length,
              onPageChange: (p) => setCurrentPage(p),
              onPageSizeChange: (s) => {
                setPageSize(s);
                setCurrentPage(1);
              },
              pageSize: pageSize,
            }}
          />
        </div>
        <div className="p-3 bg-slate-50/50 flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
           End of Recent Records
        </div>
      </div>
    </div>
  );
}
