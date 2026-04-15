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
  MoreHorizontal,
  ChevronLeft,
  Receipt,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DataTable from "@/components/common/DataTable";
import SelectField from "@/components/common/SelectField";
import { useRouter } from "next/navigation";

// --- Elegant Light-Modern Theme ---
const MOCK_STATS = [
  { label: "Annual Revenue", value: "$1.24M", icon: DollarSign, trend: "+12.5%", trendUp: true, color: "text-indigo-600", bg: "bg-indigo-500", grad: "from-indigo-500/10 to-transparent", border: "border-indigo-100" },
  { label: "Total Collected", value: "$880.2k", icon: Receipt, trend: "+5.2%", trendUp: true, color: "text-emerald-600", bg: "bg-emerald-500", grad: "from-emerald-500/10 to-transparent", border: "border-emerald-100" },
  { label: "Pending Dues", value: "$360.3k", icon: AlertCircle, trend: "-2.1%", trendUp: false, color: "text-amber-600", bg: "bg-amber-500", grad: "from-amber-500/10 to-transparent", border: "border-amber-100" },
  { label: "Other Income", value: "$12.4k", icon: Sparkles, trend: "+14.2%", trendUp: true, color: "text-violet-600", bg: "bg-violet-500", grad: "from-violet-500/10 to-transparent", border: "border-violet-100" },
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
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [classFilter, setClassFilter] = useState("");

  const filteredData = useMemo(() => {
    return MOCK_TABLE_DATA.filter((item) =>
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.regNo.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (classFilter === "" || item.class === classFilter)
    );
  }, [searchTerm, classFilter]);

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
            <span className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase mt-1">{row.original.regNo}</span>
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
          Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
          Overdue: "bg-rose-50 text-rose-600 border-rose-100",
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
    <div className="space-y-6">
      
      {/* HEADER OVERHAUL */}
      <div className="relative rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-50/50 pointer-events-none" />
         <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <button onClick={() => router.back()} className="h-11 w-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <ChevronLeft size={22} className="text-slate-600" />
            </button>
            <div className="space-y-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                 <Receipt size={12} /> Live Financial Analytics
               </div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fee Collection Report</h1>
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
                  contentStyle={{ borderRadius: "12px", border: "none", padding: "10px", fontSize: "11px", fontWeight: 700, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#softWave)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE ACTIONS */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/10 p-6 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="space-y-1">
                 <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                   <Filter size={14} className="text-slate-400" /> Quick Filters
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">Narrow down results</p>
              </div>
              
              <div className="space-y-4">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Search student..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                   />
                 </div>
                 
                 <SelectField
                   label="Class Filter"
                   placeholder="All Classes"
                   value={classFilter}
                   onChange={setClassFilter}
                   options={[
                     { value: "Grade 10-A", label: "Grade 10-A" },
                     { value: "Grade 9-B", label: "Grade 9-B" },
                     { value: "Grade 11-Science", label: "Grade 11-Science" },
                   ]}
                 />
              </div>
           </div>
           
           <div className="mt-8 p-4 rounded-xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-2 text-amber-500 mb-2 font-bold text-xs uppercase tracking-tight">
                <AlertCircle size={14} /> Attention
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collection rate is <span className="text-indigo-600 font-bold">12% lower</span> than last month. Consider review.
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
