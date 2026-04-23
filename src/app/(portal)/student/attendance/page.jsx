"use client";

import { useState, useMemo } from "react";
import { 
  CalendarDays, TrendingUp, Calendar, Info, 
  CheckCircle2, XCircle, Clock, Search, ChevronRight,
  Plus, History, RefreshCw, Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { 
  useStudentAttendance, 
  useStudentLeaveRequests, 
  useStudentLeaveBalance 
} from "@/hooks/useStudentPortal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppModal from "@/components/common/AppModal";
import StudentLeaveRequestForm from "@/components/portal/student/StudentLeaveRequestForm";

export default function StudentAttendancePage() {
  const { data: attendanceRes, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useStudentAttendance();
  const { data: leaveRes, isLoading: isLeavesLoading, refetch: refetchLeaves } = useStudentLeaveRequests();
  const { data: balanceRes, refetch: refetchBalance } = useStudentLeaveBalance();
  
  const [filterStatus, setFilterStatus] = useState("all");
  const [tab, setTab] = useState("attendance"); // "attendance" or "leaves"
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  
  const attendance = attendanceRes?.data || {};
  const summary = attendance.summary || {};
  const records = attendance.records || [];
  
  const leaveRequests = leaveRes?.data || [];

  const heatmapData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
       const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
       const record = records.find(r => r.date === dateStr);
       monthDays.push({
         day: i,
         date: dateStr,
         status: record ? record.status?.toLowerCase() : "no-data"
       });
    }
    return monthDays;
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (filterStatus === "all") return records;
    return records.filter(r => r.status?.toLowerCase() === filterStatus.toLowerCase());
  }, [records, filterStatus]);

  const handleLeaveSuccess = () => {
    setLeaveModalOpen(false);
    refetchLeaves();
    refetchBalance();
  };

  if (isAttendanceLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Building your attendance heatmap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-slate-900 font-bold">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 text-white">
              <CalendarDays className="w-7 h-7" />
            </div>
            Attendance & Absences
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Track your daily presence and manage leave requests
          </p>
        </div>
        <div className="flex gap-2">
           <Button 
             onClick={() => setLeaveModalOpen(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl px-6 h-12 shadow-lg shadow-emerald-100 uppercase tracking-tight text-xs"
           >
              <Plus className="w-4 h-4 mr-2" /> Request Leave
           </Button>
           <Button 
             variant="outline"
             onClick={() => {
                refetchAttendance();
                refetchLeaves();
             }}
             className="border-slate-200 text-slate-500 font-bold rounded-2xl h-12 px-4 shadow-sm"
           >
              <RefreshCw className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 px-2">
         <button 
           onClick={() => setTab("attendance")}
           className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${tab === "attendance" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
         >
           Attendance History
           {tab === "attendance" && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
         </button>
         <button 
           onClick={() => setTab("leaves")}
           className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${tab === "leaves" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
         >
           Leave Logs
           {tab === "leaves" && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
         </button>
      </div>

      {tab === "attendance" ? (
        <>
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
               <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                 <Calendar className="w-5 h-5 text-emerald-600" />
                 Monthly Activity
               </h2>
               <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 rounded-sm"></div> N/A</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Present</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Absent</span>
               </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3 justify-between">
              {heatmapData.map((item, idx) => {
                const statusColors = {
                  present: "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-105",
                  absent: "bg-rose-500 text-white shadow-md shadow-rose-100",
                  late: "bg-amber-500 text-white shadow-md shadow-amber-100",
                  "no-data": "bg-slate-50 text-slate-300 border border-slate-100 font-normal"
                };
                return (
                  <div key={idx} title={item.date} className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-help ${statusColors[item.status] || statusColors["no-data"]}`}>
                    {item.day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 px-2 uppercase tracking-tight">Quick Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <SummaryCard label="Total" value={summary.total ?? 0} icon={Calendar} iconColor="text-blue-600" bg="bg-blue-50" />
                <SummaryCard label="Present" value={summary.present ?? 0} icon={CheckCircle2} iconColor="text-emerald-600" bg="bg-emerald-50" />
                <SummaryCard label="Absent" value={summary.absent ?? 0} icon={XCircle} iconColor="text-rose-600" bg="bg-rose-50" />
                <SummaryCard label="Late" value={summary.late ?? 0} icon={Clock} iconColor="text-amber-600" bg="bg-amber-50" />
              </div>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 uppercase tracking-tight">Detailed Records</h2>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {["all", "present", "absent", "late"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === s ? "bg-slate-900 text-white" : "text-slate-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                {filteredRecords.length === 0 ? (
                  <div className="py-20 text-center"><Search className="w-12 h-12 text-slate-100 mx-auto" /></div>
                ) : (
                  filteredRecords.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all font-bold">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight">{item.subject || "Session"}</p>
                          <p className="text-[11px] text-zinc-400 font-bold">{item.date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${item.status?.toLowerCase() === "absent" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h2 className="font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                 <History className="w-4 h-4 text-emerald-600" />
                 Leave History
              </h2>
           </div>
           <div className="overflow-x-auto font-bold">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                       <th className="px-6 py-4 text-left">Leave Type</th>
                       <th className="px-6 py-4 text-center">Period</th>
                       <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {isLeavesLoading ? (
                      <tr><td colSpan={3} className="px-6 py-12 text-center">Loading...</td></tr>
                    ) : leaveRequests.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-20 text-center">No logs</td></tr>
                    ) : (
                      leaveRequests.map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50/80 transition-all font-bold">
                           <td className="px-6 py-4">
                              <p className="text-slate-900 font-black uppercase tracking-tight">{leave.leaveType?.leave_type_name || "Leave"}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{leave.reason}</p>
                           </td>
                           <td className="px-6 py-4 text-center text-slate-600 text-[11px]">
                              {format(parseISO(leave.from_date), "MMM dd")} - {format(parseISO(leave.to_date), "MMM dd")}
                           </td>
                           <td className="px-6 py-4 text-center">
                              <Badge className={`uppercase text-[9px] font-black ${leave.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                 {leave.status}
                              </Badge>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      <AppModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Apply for Leave"
        description="Fill details for school management approval."
      >
        <StudentLeaveRequestForm 
          leaveBalance={balanceRes} 
          onSuccess={handleLeaveSuccess}
          onCancel={() => setLeaveModalOpen(false)}
        />
      </AppModal>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, iconColor, bg }) {
  return (
    <div className={`${bg} rounded-[32px] p-5 border border-white shadow-sm flex flex-col items-center justify-center text-center`}>
      <div className={`p-2 rounded-xl bg-white mb-2 shadow-sm ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
