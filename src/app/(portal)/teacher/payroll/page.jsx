"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, Download, CreditCard, TrendingUp, 
  ArrowUpRight, ArrowDownRight, FileText, 
  Wallet, Calendar, Building, Landmark, ReceiptText,
  History, Clock, RefreshCw, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { teacherPortalService } from "@/services/teacherPortalService";
import useAuthStore from "@/store/authStore";

export default function TeacherPayrollPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [stats, setStats] = useState({
    currentNet: 0,
    tax: 0,
    benefits: 0,
    annual: 0
  });

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const res = await teacherPortalService.getMyPayslips({ limit: 12 });
      const data = res.data || [];
      setPayslips(data);

      if (data.length > 0) {
        const latest = data[0];
        const grossEarnings = parseFloat(latest.basic_salary || 0) + parseFloat(latest.total_allowances || 0);
        const netSal = parseFloat(latest.net_salary || 0);
        const totalTax = latest.deductions?.reduce((acc, d) => acc + (d.name.toLowerCase().includes('tax') ? parseFloat(d.amount || 0) : 0), 0) || 0;
        const totalBenefits = parseFloat(latest.total_allowances || 0);
        
        // Calculate annual total roughly from history
        const annualSum = data.reduce((acc, curr) => acc + parseFloat(curr.net_salary || 0), 0);

        setStats({
          currentNet: netSal,
          tax: totalTax,
          benefits: totalBenefits,
          annual: annualSum
        });
      }
    } catch (error) {
      console.error("Failed to fetch payroll:", error);
      toast.error("Could not load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const latestSlip = payslips[0] || null;

  const chartData = useMemo(() => {
    return [...payslips].reverse().map(s => ({
      month: s.month ? format(new Date(2000, s.month - 1), 'MMM') : 'N/A',
      amount: parseFloat(s.net_salary || 0)
    }));
  }, [payslips]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-slate-900 font-bold">
      {/* Header Banner - Project Style */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-emerald-100">
        <div className="absolute right-4 top-4 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 backdrop-blur-sm">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/70 text-xs mb-0.5 tracking-wider uppercase font-bold">Payroll & Earnings</p>
              <h1 className="text-2xl font-extrabold tracking-tight">Financial Overview</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold">Session 2025-26</Badge>
                {latestSlip && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> 
                    Salary Disbursed ({format(parseISO(latestSlip.generated_at), 'MMM')})
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <Button 
               onClick={fetchPayrollData}
               variant="ghost" 
               className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 text-xs"
             >
                <RefreshCw className="w-4 h-4 mr-2" /> Sync Data
             </Button>
             <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-lg text-xs">
                <Download className="w-4 h-4 mr-2" /> All Payslips
             </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
           { label: 'Current Net Pay', val: `PKR ${stats.currentNet.toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Tax Deductions', val: `PKR ${stats.tax.toLocaleString()}`, icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Total Benefits', val: `PKR ${stats.benefits.toLocaleString()}`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Annual Total', val: `PKR ${(stats.annual / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-bold uppercase tracking-tight">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Breakdown - Real Data */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
           <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-lg font-bold text-slate-800">Monthly Breakdown</CardTitle>
                 <CardDescription className="text-xs font-semibold">
                   {latestSlip ? `Processed for ${format(new Date(latestSlip.year, latestSlip.month - 1), 'MMMM yyyy')}` : 'No data available'}
                 </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] tracking-widest uppercase">
                {latestSlip?.status || 'PAID'}
              </Badge>
           </CardHeader>
           <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 font-bold">
                 <div className="p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                       <ArrowUpRight className="w-3.5 h-3.5" /> Gross Earnings
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Basic Fix Pay</span>
                          <span className="text-slate-900">PKR {parseFloat(latestSlip?.basic_salary || 0).toLocaleString()}</span>
                       </div>
                       {latestSlip?.allowances?.map((allow, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{allow.name}</span>
                            <span className="text-slate-900">PKR {parseFloat(allow.amount).toLocaleString()}</span>
                         </div>
                       ))}
                       {latestSlip?.overtime_amount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Overtime</span>
                            <span className="text-slate-900">PKR {parseFloat(latestSlip.overtime_amount).toLocaleString()}</span>
                          </div>
                       )}
                    </div>
                 </div>
                 <div className="p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                       <ArrowDownRight className="w-3.5 h-3.5" /> Deductions
                    </h4>
                    <div className="space-y-4">
                       {latestSlip?.deductions?.length > 0 ? latestSlip.deductions.map((ded, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{ded.name}</span>
                            <span className="text-rose-600">- PKR {parseFloat(ded.amount).toLocaleString()}</span>
                         </div>
                       )) : (
                         <p className="text-xs text-slate-400 font-normal italic text-center py-4">No deductions for this period</p>
                       )}
                    </div>
                 </div>
              </div>
              <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable Amount</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      PKR {parseFloat(latestSlip?.net_salary || 0).toLocaleString()}
                    </p>
                 </div>
                 <Button 
                   onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/portal/teacher/payroll/${latestSlip?.id}/pdf`, '_blank')}
                   className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl h-12 shadow-inner px-6 text-xs uppercase tracking-tight"
                 >
                    <ReceiptText className="w-4 h-4 mr-2" /> Get Payslip PDF
                 </Button>
              </div>
           </CardContent>
        </Card>

        {/* Info Column */}
        <div className="space-y-4">
           {/* Chart - Real Data */}
           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Earnings History</h4>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.length > 0 ? chartData : [{month: 'N/A', amount: 0}]}>
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#f1f5f9'} />
                      ))}
                    </Bar>
                    <XAxis dataKey="month" hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold mt-2 text-center tracking-tight">Earnings trend for last 12 months</p>
           </div>

           {/* Bank Info - Real Data fallback */}
           <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <Landmark className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10" />
              <div className="flex justify-between mb-4">
                 <Building className="w-6 h-6 opacity-60" />
                 <CreditCard className="w-5 h-5 text-indigo-200" />
              </div>
              <p className="text-[10px] font-bold text-indigo-200/60 uppercase tracking-widest">Deposit Account</p>
              <p className="font-bold tracking-tight">{user?.details?.teacherDetails?.bank_name || 'Bank Details Not Set'}</p>
              <p className="text-sm font-mono tracking-widest mt-1">
                {user?.details?.teacherDetails?.bank_account_no ? `**** ${user.details.teacherDetails.bank_account_no.slice(-4)}` : '**** ****'}
              </p>
           </div>
        </div>
      </div>

      {/* History Table - Real Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
               <History className="w-4 h-4 text-emerald-600" /> Payment Logbook
            </h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-bold">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                     <th className="px-6 py-3 text-left">Period</th>
                     <th className="px-6 py-3 text-center">Net Amount</th>
                     <th className="px-6 py-3 text-center">Date</th>
                     <th className="px-6 py-3 text-center text-slate-400">Status</th>
                     <th className="px-6 py-3 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-slate-600">
                  {payslips.length > 0 ? payslips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-emerald-50/20 transition-colors">
                       <td className="px-6 py-4 text-slate-900">{format(new Date(slip.year, slip.month - 1), 'MMMM yyyy')}</td>
                       <td className="px-6 py-4 text-center text-emerald-600 font-black">PKR {parseFloat(slip.net_salary).toLocaleString()}</td>
                       <td className="px-6 py-4 text-center font-normal">{slip.paid_on || '—'}</td>
                       <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className={`text-[9px] uppercase ${slip.status === 'paid' ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'}`}>
                            {slip.status}
                          </Badge>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <Button 
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/portal/teacher/payroll/${slip.id}/pdf`, '_blank')}
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-emerald-600"
                          >
                             <Download className="w-3.5 h-3.5" />
                          </Button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No payment history found</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
