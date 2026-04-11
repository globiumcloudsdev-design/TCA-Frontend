"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Calendar, Clock, LogIn, LogOut, CheckCircle2, 
  AlertCircle, History, TrendingUp, Info, Search, Filter, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DataTable from "@/components/common/DataTable";
import { MonthPicker } from "@/components/common/MonthPicker";
import { AttendanceHistoryTable } from "@/components/portal/teacher/AttendanceHistoryTable";
import useAuthStore from "@/store/authStore";
import teacherPortalService from "@/services/teacherPortalService";
import { generateSelfAttendanceReportPDF } from "@/lib/pdf/attendanceReport";

export default function TeacherSelfAttendancePage() {
  const user = useAuthStore((state) => state.user);
  const [time, setTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [reportStats, setReportStats] = useState(null);
  const [reportMonth, setReportMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [reportLoading, setReportLoading] = useState(false);
  

  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
  const [historyFilters, setHistoryFilters] = useState({
    month: format(new Date(), "yyyy-MM"),
    status: ""
  });
  
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);



  const fetchTodayAttendance = async () => {
    try {
      setLoadingInitial(true);
      const res = await teacherPortalService.getSelfAttendanceToday();
      setAttendanceData(res.data || res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const targetMonth = historyFilters.month || format(new Date(), "yyyy-MM");
      const [year, monthNum] = targetMonth.split('-');
      const targetDate = new Date(year, monthNum - 1, 1);
      
      const from_date = format(startOfMonth(targetDate), "yyyy-MM-dd");
      const to_date = format(endOfMonth(targetDate), "yyyy-MM-dd");
      const params = { page, limit: 20, month: targetMonth, from_date, to_date };
      if (historyFilters.status) {
        params.status = historyFilters.status;
      }
      
      const res = await teacherPortalService.getSelfAttendanceHistory(params);
      setHistoryData(res.data || []);
      if (res.pagination) setHistoryPagination(res.pagination);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      setReportLoading(true);
      const month = reportMonth;
      const [year, monthNum] = month.split('-');
      const targetDate = new Date(year, monthNum - 1, 1);
      const from_date = format(startOfMonth(targetDate), "yyyy-MM-dd");
      const to_date = format(endOfMonth(targetDate), "yyyy-MM-dd");
      
      const res = await teacherPortalService.getSelfAttendanceReport({ month, from_date, to_date });
      
      // Handle potential { success: true, data: { ... } } wrapper from backend
      const actualData = res?.data || res;

      if (actualData?.stats) {
        setReportStats(actualData.stats);
      }
      if (actualData?.daily) {
         setHistoryData(actualData.daily);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to fetch report stats");
    } finally {
      setReportLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await teacherPortalService.getLeaveBalance();
      setLeaveBalance(res.data || res);
    } catch (error) {
      console.error("Failed to fetch leave balance:", error);
    }
  };

  const handleDownloadPDF = () => {
    toast.success("Preparing ultra-premium PDF Report...");
    
    generateSelfAttendanceReportPDF({
      user,
      schoolName: user?.school?.name || localStorage.getItem("school_code") || "The Cloud Academy",
      reportMonth,
      reportStats,
      historyData
    });
  };

  // 1. Auto-fetch report when reportMonth changes (handles both initial current month & any newly selected month)
  useEffect(() => {
    fetchReport();
  }, [reportMonth]);

  useEffect(() => {
    fetchHistory();
  }, [historyFilters.month, historyFilters.status]);

  useEffect(() => {
    setIsMounted(true);
    fetchTodayAttendance();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PRESENT") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "LATE") return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "ABSENT") return "bg-rose-100 text-rose-700 border-rose-200";
    if (s === "LEAVE") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-500 border-slate-200";
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await teacherPortalService.selfCheckIn({ remarks: "On time" });
      toast.success("Checked in successfully!");
      fetchTodayAttendance();
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 409) {
        toast.error("Already checked in today");
      } else if (error?.response?.status === 403) {
        toast.error("You have an approved leave today");
      } else {
        toast.error(error?.response?.data?.message || "Check-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await teacherPortalService.selfCheckOut({ remarks: "Leaving" });
      toast.success("Checked out successfully!");
      fetchTodayAttendance();
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 409) {
        toast.error("Already checked out today");
      } else if (error?.response?.status === 400) {
        toast.error("Check-in not found for today. Cannot check out.");
      } else {
        toast.error(error?.response?.data?.message || "Check-out failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = attendanceData?.is_checked_in;
  const isCheckedOut = attendanceData?.is_checked_out;
  const canCheckIn = attendanceData?.can_check_in;
  const canCheckOut = attendanceData?.can_check_out;
  const dailyStatus = attendanceData?.status || "NOT_MARKED";

  // Compute countdown block for early check-in (40 min threshold) and strict End Time restriction
  const shiftStartTime = user?.institute?.settings?.start_time || user?.school?.settings?.start_time || "08:00";
  const shiftEndTime = user?.institute?.settings?.end_time || user?.school?.settings?.end_time || "15:00";
  
  const getCountdownInfo = () => {
    if (isCheckedIn || dailyStatus === "LEAVE" || !canCheckIn) return { isEarly: false, isClosed: false };
    
    try {
      const [sHrs, sMins] = shiftStartTime.split(":");
      const startShiftDate = new Date();
      startShiftDate.setHours(parseInt(sHrs, 10), parseInt(sMins || "0", 10), 0, 0);

      const [eHrs, eMins] = shiftEndTime.split(":");
      const endShiftDate = new Date();
      endShiftDate.setHours(parseInt(eHrs, 10), parseInt(eMins || "0", 10), 0, 0);
      
      const diffStartMs = startShiftDate - time;
      const thresholdMs = 40 * 60 * 1000; // 40 minutes before shift
      
      // Too early restraint
      if (diffStartMs > thresholdMs && diffStartMs > 0) {
        const remainingMs = diffStartMs - thresholdMs;
        const totalSecs = Math.floor(remainingMs / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        
        const timeStr = [
          h > 0 ? `${h}h` : null,
          m > 0 || h > 0 ? `${m}m` : null,
          `${s}s`
        ].filter(Boolean).join(" ");

        return { isEarly: true, isClosed: false, timeStr, shiftTime: shiftStartTime };
      }

      // School closing restraint
      if (time > endShiftDate) {
        return { isEarly: false, isClosed: true };
      }

    } catch (e) {
      console.error(e);
    }
    return { isEarly: false, isClosed: false };
  };

  const countdown = getCountdownInfo();

  const getDurationDisplay = () => {
    if (attendanceData?.duration_display) return attendanceData.duration_display;
    if (attendanceData?.check_in && attendanceData?.check_out) {
       const diff = new Date(attendanceData.check_out) - new Date(attendanceData.check_in);
       const m = Math.floor(diff / 60000);
       return `${Math.floor(m / 60)}h ${m % 60}m`;
    }
    // LIVE TIMER if currently checked in
    if (attendanceData?.check_in && !attendanceData?.check_out) {
       const diff = time - new Date(attendanceData.check_in);
       if (diff < 0) return '0h 0m';
       const m = Math.floor(diff / 60000);
       return `${Math.floor(m / 60)}h ${m % 60}m`;
    }
    return '--';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* SECTION 1 - Today's Card */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Today&apos;s Attendance</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium tracking-tight">
                  {isMounted ? format(time, "EEEE, MMMM do, yyyy") : "Loading date..."}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {isMounted ? format(time, "hh:mm:ss a") : "--:--:--"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`uppercase text-[10px] font-black px-2.5 py-1 tracking-wider ${getStatusColor(dailyStatus)}`}>
                {dailyStatus}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  fetchLeaveBalance();
                  setLeaveModalOpen(true);
                }}
                className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Apply Leave
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {attendanceData?.leave && (
            <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800 mb-1">Leave Applied</p>
                <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                  You are marked on leave for today. Remarks: {attendanceData.leave.remarks || 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Metric Displays */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4 border-r border-slate-100 pr-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Check In</p>
                <p className="font-mono font-black text-slate-700">
                   {attendanceData?.check_in ? format(new Date(attendanceData.check_in), "hh:mm a") : '--:--'}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Check Out</p>
                <p className="font-mono font-black text-slate-700">
                   {attendanceData?.check_out ? format(new Date(attendanceData.check_out), "hh:mm a") : '--:--'}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Duration</p>
                <div className="flex flex-col items-center">
                  <p className="font-mono font-black text-blue-700">
                     {getDurationDisplay()}
                  </p>
                  {attendanceData?.check_in && !attendanceData?.check_out && (
                    <span className="text-[9px] font-bold text-blue-500 animate-pulse mt-0.5 w-max">🔴 LIVE TIMER</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex flex-col gap-3 justify-center items-center">
              <AnimatePresence mode="wait">
                {loadingInitial ? (
                  <div className="py-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-3 w-full max-w-[200px]"
                  >
                    <div className="relative w-full">
                      {countdown.isEarly && (
                         <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 flex justify-center z-10 w-max">
                           <div className="bg-slate-800 text-white text-[10px] font-mono px-3 py-1 rounded-full shadow-lg border border-slate-700 animate-pulse">
                             ⏱️ Opens in {countdown.timeStr}
                           </div>
                         </div>
                      )}
                      {countdown.isClosed && (
                         <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 flex justify-center z-10 w-max">
                           <div className="bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-rose-200">
                             School Closed
                           </div>
                         </div>
                      )}
                      <Button 
                        onClick={handleCheckIn}
                        disabled={loading || !canCheckIn || countdown.isEarly || countdown.isClosed}
                        className="w-full h-10 rounded-lg text-xs font-bold tracking-tight shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-200 text-white disabled:opacity-50"
                      >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" /> MARK CHECK IN</>}
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCheckOut}
                      disabled={loading || !canCheckOut}
                      className="w-full h-10 rounded-lg text-xs font-bold tracking-tight shadow-sm bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-200 text-white disabled:opacity-50"
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogOut className="w-4 h-4 mr-2" /> MARK CHECK OUT</>}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 - Monthly Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-50">
           <div className="flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-blue-600" />
             <h2 className="text-sm font-bold text-slate-800">Monthly Stats Overview</h2>
           </div>
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
             <MonthPicker 
               value={reportMonth} 
               onChange={(val) => setReportMonth(val)} 
             />
             <Button 
                onClick={handleDownloadPDF} 
                disabled={reportLoading}
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 shadow-sm font-bold transition-all flex items-center gap-1.5"
             >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
             </Button>
           </div>
        </div>

        {reportLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100/50">
                <p className="text-xs font-bold text-slate-500 mb-1">Attendance %</p>
                <p className="text-2xl font-black text-blue-600">{reportStats?.attendance_percentage ?? '--'}%</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50">
                <p className="text-xs font-bold text-slate-500 mb-1">Present Days</p>
                <p className="text-2xl font-black text-emerald-600">
                  {reportStats?.present ?? '--'} <span className="text-xs text-slate-400 font-medium">/ {reportStats?.total_days ?? '--'}</span>
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50">
                <p className="text-xs font-bold text-slate-500 mb-1">Late Comings</p>
                <p className="text-2xl font-black text-amber-600">{reportStats?.late ?? '--'}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100/50">
                <p className="text-xs font-bold text-slate-500 mb-1">Absent Days</p>
                <p className="text-2xl font-black text-rose-600">{reportStats?.absent ?? '--'}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100/50">
                <p className="text-xs font-bold text-slate-500 mb-1">On Leave</p>
                <p className="text-2xl font-black text-indigo-600">{reportStats?.on_leave ?? '--'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 pt-2 border-t border-slate-50">
              <div className="px-2 text-center md:text-left">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Avg Check-In</p>
                 <p className="text-lg font-black text-slate-700 font-mono">{reportStats?.avg_check_in || '--:--'}</p>
              </div>
              <div className="px-2 text-center md:text-left">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Avg Check-Out</p>
                 <p className="text-lg font-black text-slate-700 font-mono">{reportStats?.avg_check_out || '--:--'}</p>
              </div>
              <div className="px-2 text-center md:text-left">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Avg Work Hours</p>
                 <p className="text-lg font-black text-blue-600 font-mono">{reportStats?.avg_working_hours || '--'}</p>
              </div>
              <div className="px-2 text-center md:text-left">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Late (Mins)</p>
                 <p className="text-lg font-black text-amber-600 font-mono">{reportStats?.total_late_minutes || '0'}</p>
              </div>
              <div className="px-2 text-center md:text-left">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Overtime</p>
                 <p className="text-lg font-black text-emerald-600 font-mono">{reportStats?.total_overtime_minutes || '0'}<span className="text-xs ml-1 text-slate-400">m</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3 - History Logbook Table (Extracted Component) */}
      <AttendanceHistoryTable 
        historyData={historyData}
        loading={historyLoading}
        filters={historyFilters}
        setFilters={setHistoryFilters}
      />

      {/* Basic Leave Application Dialog Placeholder */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Submit your day-off requests here across the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             {leaveBalance ? (
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mb-4">
                 <p className="text-xs font-bold text-slate-600">Available Balance:</p>
                 {Array.isArray(leaveBalance) ? (
                   leaveBalance.map((b, i) => (
                     <div key={i} className="flex justify-between items-center text-xs">
                       <span className="text-slate-500 font-medium">{b.leave_type || b.type || 'Leave'}</span>
                       <span className="font-bold">{b.remaining ?? b.balance ?? b.available ?? b} days left</span>
                     </div>
                   ))
                 ) : (
                   Object.entries(leaveBalance).map(([key, val], i) => {
                     // Ignore metadata keys if any
                     if (key === 'success' || key === 'message' || key === 'data') return null;
                     const name = typeof val === 'object' && val !== null ? (val.leave_type || key) : key;
                     const amount = typeof val === 'object' && val !== null ? (val.remaining ?? val.balance ?? val.available ?? 0) : val;
                     return (
                       <div key={i} className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-medium capitalize">{name.replace(/_/g, ' ')}</span>
                         <span className="font-bold flex items-center justify-end">{amount} days left</span>
                       </div>
                     );
                   })
                 )}
               </div>
             ) : (
               <div className="text-xs text-slate-500 p-4 text-center">Loading balances...</div>
             )}
             <p className="text-xs text-slate-400 italic">Form integration goes here based on your actual Leave Application component payload requirements.</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" size="sm" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

