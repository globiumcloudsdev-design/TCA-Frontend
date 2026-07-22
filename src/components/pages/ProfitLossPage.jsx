"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Briefcase, Calculator, Download, RefreshCw, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { reportService } from "@/services/reportService";
import { toast } from "sonner";
import { downloadBlob } from "@/lib/download";
import { generateProfitLossPdfBlob } from "@/lib/pdf/profitLossPdf";

// UI Components
import { PageHeader, StatsCard, SelectField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"]; // Emerald, Red, Amber

export default function ProfitLossPage({ type }) {
  const { user } = useAuth();
  const instituteId = user?.school_id || user?.institute_id;
  const currentYear = new Date().getFullYear();

  // Filters State
  const [filters, setFilters] = useState({
    year: currentYear.toString(),
    month: "all",
  });

  // Query to Fetch Profit & Loss Report
  const { data: reportResp, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["profit-loss-report", instituteId, filters],
    queryFn: () => reportService.getProfitLossReport({
      institute_id: instituteId,
      year: filters.year !== "all" ? filters.year : null,
      month: filters.month !== "all" ? filters.month : null,
    }),
    enabled: !!instituteId,
  });

  const reportData = reportResp?.data || { summary: {}, monthly_trends: [] };
  const { summary, monthly_trends: monthlyTrends } = reportData;

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!reportData?.summary) return;
    setIsExporting(true);
    try {
      const instituteName = user?.institute?.name || user?.school_name || user?.institute_name || "The Clouds Academy";
      const logoUrl = user?.institute?.logo_url || user?.logo_url || user?.institute_logo || null;

      const blob = await generateProfitLossPdfBlob({
        summary: reportData.summary,
        monthlyTrends: reportData.monthly_trends,
        filters,
        instituteName,
        logoUrl
      });
      downloadBlob(blob, `Profit_Loss_Report_${filters.year}_${filters.month}.pdf`);
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  // Derived Data for Pie Chart
  const breakdownData = [
    { name: "Income (Fee)", value: summary.total_income_raw || 0, color: COLORS[0] },
    { name: "Expenses", value: summary.total_expense_raw || 0, color: COLORS[1] },
    { name: "Payroll", value: summary.total_payroll_raw || 0, color: COLORS[2] },
  ].filter(d => d.value > 0);

  const yearOptions = [
    { value: "all", label: "All Time" },
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
  ];

  const monthOptions = [
    { value: "all", label: "All Months" },
    ...Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
      value: m.toString(),
      label: format(new Date(2000, m - 1, 1), 'MMMM')
    }))
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title="Profit & Loss" 
        description="Comprehensive financial health and breakdown"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="default" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={handleExport} disabled={isExporting || isLoading}>
              <Download className={cn("mr-2 h-4 w-4", isExporting && "animate-bounce")} />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-500" />
            <div className="w-full">
              <SelectField
                name="year"
                value={filters.year}
                onChange={(val) => setFilters(prev => ({ ...prev, year: val }))}
                options={yearOptions}
                placeholder="Select Year"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <div className="w-full">
              <SelectField
                name="month"
                value={filters.month}
                onChange={(val) => setFilters(prev => ({ ...prev, month: val }))}
                options={monthOptions}
                placeholder="Select Month"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          label="Total Income" 
          value={summary.total_income || "Rs 0.00"} 
          icon={<DollarSign size={20} />} 
          description="From Fee Vouchers"
          variant="emerald" 
          loading={isLoading} 
        />
        <StatsCard 
          label="Total Expenses" 
          value={summary.total_expense || "Rs 0.00"} 
          icon={<Wallet size={20} />} 
          description="Operating costs"
          variant="rose" 
          loading={isLoading} 
        />
        <StatsCard 
          label="Total Payroll" 
          value={summary.total_payroll || "Rs 0.00"} 
          icon={<Briefcase size={20} />} 
          description="Staff salaries"
          variant="amber" 
          loading={isLoading} 
        />
        <StatsCard 
          label="Net Profit" 
          value={summary.net_profit || "Rs 0.00"} 
          icon={<Calculator size={20} />} 
          description="Income - (Expenses + Payroll)"
          variant={summary.is_profitable ? "emerald" : "rose"} 
          loading={isLoading} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="md:col-span-4 border-none shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Financial Trends</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {isLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : monthlyTrends.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center text-slate-500">
                No financial data found for the selected period
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#64748b", fontSize: 12 }} 
                      tickFormatter={(val) => {
                        const [y, m] = val.split("-");
                        return `${format(new Date(2000, parseInt(m) - 1, 1), 'MMM')} ${y}`;
                      }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(val) => `Rs ${(val / 1000)}k`}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`Rs ${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => {
                        const [y, m] = label.split("-");
                        return `${format(new Date(2000, parseInt(m) - 1, 1), 'MMMM yyyy')}`;
                      }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="payroll" name="Payroll" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="md:col-span-3 border-none shadow-sm dark:bg-slate-900 flex flex-col">
          <CardHeader>
            <CardTitle>Cash Flow Breakdown</CardTitle>
            <CardDescription>Overall distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
            {isLoading ? (
              <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
            ) : breakdownData.length === 0 ? (
              <span className="text-slate-500">No data</span>
            ) : (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, undefined]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-4 space-y-2">
                  {breakdownData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">Rs {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


