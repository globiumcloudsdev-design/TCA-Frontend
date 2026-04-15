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
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  Wallet,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/DataTable";
import SelectField from "@/components/common/SelectField";
import { useRouter } from "next/navigation";

// --- Elegant Payroll Theme ---
const MOCK_STATS = [
  { label: "Total Payroll", value: "$42.5k", icon: Wallet, trend: "+3.2%", trendUp: true, color: "text-indigo-600", bg: "bg-indigo-500", grad: "from-indigo-500/10 to-transparent" },
  { label: "Paid Salaries", value: "$38.2k", icon: CheckCircle2, trend: "90% Disbursed", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-500", grad: "from-emerald-500/10 to-transparent" },
  { label: "Pending Dues", value: "$4.3k", icon: AlertCircle, trend: "12 Staff Left", trendUp: false, color: "text-amber-600", bg: "bg-amber-500", grad: "from-amber-500/10 to-transparent" },
  { label: "Avg. Net Pay", value: "$2,850", icon: DollarSign, trend: "+1.5%", trendUp: true, color: "text-rose-600", bg: "bg-rose-500", grad: "from-rose-500/10 to-transparent" },
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
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [roleFilter, setRoleFilter] = useState("");

  const filteredData = useMemo(() => {
    return MOCK_TABLE_DATA.filter((item) =>
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.staffId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || item.role === roleFilter)
    );
  }, [searchTerm, roleFilter]);

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
          Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
          Pending: "bg-rose-50 text-rose-600 border-rose-100",
          Partial: "bg-amber-50 text-amber-600 border-amber-100",
        };
        return (
          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-semibold border uppercase tracking-wider shadow-sm", config[val] || "bg-slate-50")}>
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
    <div className="space-y-6">
      
      {/* HEADER OVERHAUL */}
      <div className="relative rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-50/50 pointer-events-none" />
         <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <button onClick={() => router.back()} className="h-11 w-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <ChevronLeft size={22} className="text-slate-600" />
            </button>
            <div className="space-y-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                 <Wallet size={12} /> Payroll Management System
               </div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Payroll Report</h1>
            </div>
         </div>

         <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
           <Button variant="outline" className="flex-1 sm:flex-none h-11 border-slate-200 rounded-2xl px-5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
             <Download size={16} className="mr-2" /> Export Excel
           </Button>
           <Button className="flex-1 sm:flex-none h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 text-[13px] font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
             Print PDF
           </Button>
         </div>
      </div>

      {/* STATS OVERHAUL */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={cn("group rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200")}>
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.grad)} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">{stat.value}</h3>
              <div className={cn("absolute bottom-4 right-4 h-1 w-8 rounded-full opacity-50 transition-all group-hover:w-12", stat.bg)} />
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* CHART AREA */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Payroll Expenditure</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Salary allocation by role</p>
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
                  contentStyle={{ borderRadius: "12px", border: "none", padding: "10px", fontSize: "11px", fontWeight: 700, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                />
                <Bar dataKey="salary" radius={[8, 8, 0, 0]} barSize={40}>
                  {MOCK_CHART_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE ACTIONS */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/10 p-6 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                   <Filter size={14} className="text-slate-400" /> Salary Filters
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">Filter by staff details</p>
              </div>
              
              <div className="space-y-4">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Search staff..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                   />
                 </div>
                 
                 <SelectField
                   label="Role Filter"
                   placeholder="All Roles"
                   value={roleFilter}
                   onChange={setRoleFilter}
                   options={[
                     { value: "Senior Teacher", label: "Senior Teacher" },
                     { value: "Admin Officer", label: "Admin Officer" },
                     { value: "Coordinator", label: "Coordinator" },
                   ]}
                 />
              </div>
           </div>
           
           <div className="mt-8 p-4 rounded-xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-2 text-rose-500 mb-2 font-bold text-xs uppercase tracking-tight">
                <Briefcase size={14} /> Upcoming
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Advance salary window opens in <span className="text-rose-600 font-bold">2 days</span>. Notifications sent.
              </p>
           </div>
        </div>
      </div>

      {/* REUSABLE DATA TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
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
