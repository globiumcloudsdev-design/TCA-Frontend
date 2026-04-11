import React, { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Download,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  Sparkles,
  MoreHorizontal,
  Wallet,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/DataTable";

// --- Elegant Payroll Theme ---
const MOCK_STATS = [
  {
    label: "Total Payroll",
    value: "$42.5k",
    icon: Wallet,
    trend: "+3.2%",
    trendUp: true,
    color: "text-indigo-600",
    bg: "bg-gradient-to-br from-indigo-50/80 to-indigo-100/20",
    border: "border-indigo-100/50",
  },
  {
    label: "Paid Salaries",
    value: "$38.2k",
    icon: CheckCircle2,
    trend: "90% Disbursed",
    trendUp: true,
    color: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/20",
    border: "border-emerald-100/50",
  },
  {
    label: "Pending Dues",
    value: "$4.3k",
    icon: AlertCircle,
    trend: "12 Staff Left",
    trendUp: false,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50/80 to-amber-100/20",
    border: "border-amber-100/50",
  },
  {
    label: "Avg. Net Pay",
    value: "$2,850",
    icon: DollarSign,
    trend: "+1.5%",
    trendUp: true,
    color: "text-violet-600",
    bg: "bg-gradient-to-br from-violet-50/80 to-violet-100/20",
    border: "border-violet-100/50",
  },
];

const MOCK_CHART_DATA = [
  { dept: "Teaching", salary: 28000, color: "#6366f1" },
  { dept: "Admin", salary: 8500, color: "#10b981" },
  { dept: "Security", salary: 3200, color: "#f59e0b" },
  { dept: "Cleaning", salary: 2800, color: "#8b5cf6" },
];

const generateMockData = () => {
  const names = ["John Doe", "Jane Smith", "Robert Wilson", "Emily Brown", "Michael Lee", "Sarah Davis", "David Miller", "Emma Wilson", "James Taylor", "Olivia Moore"];
  const roles = ["Senior Teacher", "Admin Officer", "Security Guard", "Coordinator", "Principal"];
  const statuses = ["Paid", "Pending", "Partial"];
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    staffId: `STF-${(i + 1).toString().padStart(3, "0")}`,
    role: roles[i % roles.length],
    basicSalary: `$${(2000 + (i * 100)).toLocaleString()}`,
    allowance: `$${(200 + (i * 20)).toLocaleString()}`,
    netPay: `$${(2200 + (i * 120)).toLocaleString()}`,
    status: statuses[i % 3],
    date: "2026-04-05",
  }));
};

const MOCK_TABLE_DATA = generateMockData();

export default function PayrollDummyApp() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const filteredData = useMemo(() => {
    return MOCK_TABLE_DATA.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staffId.toLowerCase().includes(searchTerm.toLowerCase())
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
      header: "Staff Member",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50/50 text-indigo-600 font-semibold text-[10px] border border-indigo-100">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">{row.original.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase leading-none mt-1">{row.original.staffId}</span>
          </div>
        </div>
      ),
    },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "netPay", header: "Net Salary" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue();
        const config = {
          Paid: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
          Pending: "bg-rose-50 text-rose-600 border-rose-100/50",
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
      header: "Salary Date",
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
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50 opacity-40 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider border border-emerald-100 shadow-sm">
              <Sparkles size={12} /> Payroll Management System
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Staff Payroll Report
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-xl">
              Track staff compensation, allowances, and payment status with automated reporting.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-10 border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm">
              <Download size={14} className="mr-2" /> Export PDF
            </Button>
            <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 text-xs font-semibold shadow-lg shadow-emerald-100 transition-all active:scale-95">
              <CheckCircle2 size={14} className="mr-2" /> Disburse Salaries
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
              </div>
              <div className="space-y-0.5 relative z-10">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</h3>
                <p className={cn("text-[10px] font-bold mt-1", stat.trendUp ? "text-emerald-500" : "text-amber-500")}>
                  {stat.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* --- DEPARTMENT BREAKDOWN CHART --- */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Department-wise Expenditure</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Salary allocation by role group</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", padding: "10px", fontSize: "11px", fontWeight: 800, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                />
                <Bar dataKey="salary" radius={[8, 8, 0, 0]} barSize={40}>
                  {MOCK_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/30 p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight uppercase mb-6 flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-600" /> Recent Activities
          </h3>
          
          <div className="space-y-6 flex-1">
            {[
              { t: "Salaries Disbursed", d: "10 April 2026", s: "Success" },
              { t: "Tax Report Generated", d: "08 April 2026", s: "Pending" },
              { t: "New Staff Added", d: "05 April 2026", s: "Notice" },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shadow-sm shadow-indigo-200" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{act.t}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{act.d}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
             <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">Upcoming Milestone</p>
             <p className="text-sm font-semibold">Advance Salary Window opens in 2 days.</p>
          </div>
        </div>
      </div>

      {/* --- STAFF LEDGER TABLE --- */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden border-b-2">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Staff Salary Ledger</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Showing all active staff members</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-400 transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="sm" className="h-[40px] border-slate-200 text-slate-400 hover:text-emerald-600 rounded-xl px-3 transition-all">
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
      </div>
    </div>
  );
}
