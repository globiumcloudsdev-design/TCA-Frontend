"use client";

import { 
  DollarSign, Download, CreditCard, TrendingUp, 
  ArrowUpRight, ArrowDownRight, FileText, 
  Wallet, Calendar, Building, Landmark, ReceiptText,
  History, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const DUMMY_PAYROLL_STATS = [
  { month: 'Oct', amount: 45000 },
  { month: 'Nov', amount: 45000 },
  { month: 'Dec', amount: 48000 },
  { month: 'Jan', amount: 48000 },
  { month: 'Feb', amount: 48000 },
  { month: 'Mar', amount: 52000 },
];

const DUMMY_SLIPS = [
  { id: 'SLP-006', month: 'March 2026', amount: 52000, date: '2026-03-31', status: 'paid', method: 'Bank Transfer' },
  { id: 'SLP-005', month: 'February 2026', amount: 48000, date: '2026-02-28', status: 'paid', method: 'Bank Transfer' },
  { id: 'SLP-004', month: 'January 2026', amount: 48000, date: '2026-01-31', status: 'paid', method: 'Bank Transfer' },
  { id: 'SLP-003', month: 'December 2025', amount: 48000, date: '2025-12-31', status: 'paid', method: 'Bank Transfer' },
];

export default function TeacherPayrollPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-slate-900">
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Salary Disbursed (Mar)
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 text-xs">
                <ReceiptText className="w-4 h-4 mr-2" /> Tax Form 16
             </Button>
             <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-lg text-xs">
                <Download className="w-4 h-4 mr-2" /> All Payslips
             </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Matching Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
           { label: 'Current Net Pay', val: 'PKR 52,000', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Tax Deductions', val: 'PKR 1,700', icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Total Benefits', val: 'PKR 8,200', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Annual Total', val: 'PKR 580K', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-bold uppercase tracking-tight">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Spreadsheet */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
           <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-lg font-bold text-slate-800">Monthly Breakdown</CardTitle>
                 <CardDescription className="text-xs font-semibold">Processed on March 31, 2026</CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] tracking-widest">PAID</Badge>
           </CardHeader>
           <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 font-bold">
                 <div className="p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                       <ArrowUpRight className="w-3.5 h-3.5" /> Gross Earnings
                    </h4>
                    <div className="space-y-4">
                       {[
                         { label: 'Basic Fix Pay', val: '45,000' },
                         { label: 'Medical Allowance', val: '4,500' },
                         { label: 'Travel Incentive', val: '3,700' },
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-slate-900">PKR {item.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                       <ArrowDownRight className="w-3.5 h-3.5" /> Standard Deductions
                    </h4>
                    <div className="space-y-4">
                       {[
                         { label: 'Security Tax (PF)', val: '500' },
                         { label: 'Income Tax', val: '1,200' },
                         { label: 'Leave Deductions', val: '—' },
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-rose-600">{item.val !== '—' ? `- ${item.val}` : item.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable Amount</p>
                    <p className="text-3xl font-black text-white tracking-tighter">PKR 52,000.00</p>
                 </div>
                 <Button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl h-12 shadow-inner px-6 text-xs uppercase tracking-tight">
                    <ReceiptText className="w-4 h-4 mr-2" /> Get Payslip PDF
                 </Button>
              </div>
           </CardContent>
        </Card>

        {/* Info Column */}
        <div className="space-y-4">
           {/* Chart */}
           <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Earnings History</h4>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DUMMY_PAYROLL_STATS}>
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {DUMMY_PAYROLL_STATS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#f1f5f9'} />
                      ))}
                    </Bar>
                    <XAxis dataKey="month" hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold mt-2 text-center">Consistent increment observed in Q1</p>
           </div>

           {/* Bank Card - Simplified */}
           <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <Landmark className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10" />
              <div className="flex justify-between mb-4">
                 <Building className="w-6 h-6 opacity-60" />
                 <CreditCard className="w-5 h-5 text-indigo-200" />
              </div>
              <p className="text-[10px] font-bold text-indigo-200/60 uppercase tracking-widest">Deposit Account</p>
              <p className="font-bold tracking-tight">HBL — Habib Bank Ltd</p>
              <p className="text-sm font-mono tracking-widest mt-1">**** 4592</p>
           </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
               <History className="w-4 h-4 text-emerald-600" /> Payment Logbook
            </h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-medium">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                     <th className="px-6 py-3 text-left">Period</th>
                     <th className="px-6 py-3 text-center">Net Amount</th>
                     <th className="px-6 py-3 text-center">Date</th>
                     <th className="px-6 py-3 text-center">Reference</th>
                     <th className="px-6 py-3 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-slate-600 font-bold">
                  {DUMMY_SLIPS.map((slip) => (
                    <tr key={slip.id} className="hover:bg-emerald-50/20 transition-colors">
                       <td className="px-6 py-4 text-slate-900">{slip.month}</td>
                       <td className="px-6 py-4 text-center text-emerald-600">PKR {slip.amount.toLocaleString()}</td>
                       <td className="px-6 py-4 text-center font-normal">{slip.date}</td>
                       <td className="px-6 py-4 text-center font-mono opacity-60">{slip.id}</td>
                       <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-emerald-600">
                             <Download className="w-3.5 h-3.5" />
                          </Button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
