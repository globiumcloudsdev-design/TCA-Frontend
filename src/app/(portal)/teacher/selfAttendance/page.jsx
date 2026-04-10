"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  MapPin,
  AlertCircle,
  History,
  TrendingUp,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/common/DataTable";
import useAuthStore from "@/store/authStore";
import teacherPortalService from "@/services/teacherPortalService";

export default function TeacherSelfAttendancePage() {
  const user = useAuthStore((state) => state.user);
  const [time, setTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [reportStats, setReportStats] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [selectedMonth, setSelectedMonth] = useState(() =>
    format(new Date(), "yyyy-MM"),
  );
  const [reportLoading, setReportLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date & Day",
        cell: ({ row }) => {
          if (!row.original.date) return null;
          const d = new Date(row.original.date);
          return (
            <div className="font-semibold text-xs py-1">
              <span className="text-slate-900">
                {format(d, "MMM dd, yyyy")}
              </span>
              <span className="text-slate-400 ml-2 font-medium">
                {format(d, "EEE")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const status = (row.original.status || "UNKNOWN").toLowerCase();
          return (
            <div className="text-center">
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                  status === "present"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "late"
                      ? "bg-amber-100 text-amber-700"
                      : status === "leave"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-rose-100 text-rose-700"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "check_in",
        header: () => <div className="text-center">Check IN</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono opacity-80 text-xs">
            {row.original.check_in
              ? format(new Date(row.original.check_in), "hh:mm a")
              : "—"}
          </div>
        ),
      },
      {
        accessorKey: "check_out",
        header: () => <div className="text-center">Check OUT</div>,
        cell: ({ row }) => (
          <div className="text-center font-mono opacity-80 text-xs">
            {row.original.check_out
              ? format(new Date(row.original.check_out), "hh:mm a")
              : "—"}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: () => <div className="text-center">Hours</div>,
        cell: ({ row }) => (
          <div className="text-center font-bold text-slate-600 tracking-tight text-xs">
            {row.original.duration_display || "—"}
          </div>
        ),
      },
      {
        id: "action",
        header: () => <div className="text-right">Action</div>,
        cell: () => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-slate-400 hover:text-blue-600"
            >
              <Info className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

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

  const fetchHistory = async (page = 1, fetchMonth = null) => {
    try {
      setHistoryLoading(true);
      const today = new Date();
      const month = fetchMonth || selectedMonth;

      // We parse the exact year and month from 'yyyy-MM' to construct correct boundary dates
      const [year, monthNum] = month.split("-");
      const targetDate = new Date(year, monthNum - 1, 1);

      const from_date = format(startOfMonth(targetDate), "yyyy-MM-dd");
      const to_date = format(endOfMonth(targetDate), "yyyy-MM-dd");
      const res = await teacherPortalService.getSelfAttendanceHistory({
        page,
        limit: 20,
        month,
        from_date,
        to_date,
      });
      setHistoryData(res.data || []);
      if (res.pagination) setHistoryPagination(res.pagination);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchReport = async (fetchMonth = null) => {
    try {
      setReportLoading(true);
      const month = fetchMonth || selectedMonth;
      const [year, monthNum] = month.split("-");
      const targetDate = new Date(year, monthNum - 1, 1);
      const from_date = format(startOfMonth(targetDate), "yyyy-MM-dd");
      const to_date = format(endOfMonth(targetDate), "yyyy-MM-dd");

      const res = await teacherPortalService.getSelfAttendanceReport({
        month,
        from_date,
        to_date,
      });
      if (res.stats) {
        setReportStats(res.stats);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleGenerateReport = () => {
    fetchReport(selectedMonth);
    fetchHistory(1, selectedMonth);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchTodayAttendance();
    fetchHistory();
    fetchReport();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await teacherPortalService.selfCheckIn({ remarks: "On time" });
      toast.success("Checked in successfully!");
      fetchTodayAttendance();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Check-in failed";
      toast.error(msg);
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
      const msg = error?.response?.data?.message || "Check-out failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = attendanceData?.is_checked_in;
  const isCheckedOut = attendanceData?.is_checked_out;
  const canCheckIn = attendanceData?.can_check_in;
  const canCheckOut = attendanceData?.can_check_out;
  const onDuty = isCheckedIn && !isCheckedOut;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Welcome & Time Banner - Project Style */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100">
        <div className="absolute right-4 top-4 opacity-10">
          <Clock className="w-32 h-32" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 backdrop-blur-sm">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/70 text-xs mb-0.5 tracking-wider uppercase font-bold">
                My Attendance
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Daily Presence & Duty
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold">
                  {isMounted
                    ? format(time, "EEEE, dd MMMM")
                    : "Loading date..."}
                </Badge>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
                  Live Tracking Active
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center min-w-[180px]">
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">
              Current Server Time
            </p>
            <p className="text-3xl font-black text-white font-mono tracking-tighter">
              {isMounted ? format(time, "hh:mm:ss a") : "--:--:--"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Punctuality",
            value: reportStats
              ? `${reportStats.attendance_percentage}%`
              : "--%",
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Monthly Presence",
            value: reportStats
              ? `${reportStats.present}/${reportStats.total_days}`
              : "--/--",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Late Comings",
            value: reportStats
              ? String(reportStats.late).padStart(2, "0")
              : "--",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Absences",
            value: reportStats
              ? String(reportStats.absent).padStart(2, "0")
              : "--",
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}
            >
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-bold">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Action */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">
                  Attendance Log
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium tracking-tight">
                    Main Campus Gate · Designated Area
                  </span>
                </div>
              </div>
              <Badge
                className={`uppercase text-[10px] font-black px-2.5 py-1 tracking-wider ${onDuty ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
              >
                {onDuty ? "On Duty" : "Off Duty"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-10 text-center">
            <AnimatePresence mode="wait">
              {loadingInitial ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : (
                <motion.div
                  key={onDuty ? "in" : "out"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div
                    className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all shadow-inner ${onDuty ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}
                  >
                    {onDuty ? (
                      <CheckCircle2 className="w-14 h-14" />
                    ) : (
                      <Clock className="w-14 h-14" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">
                      {onDuty
                        ? "You are currently Checked In"
                        : isCheckedOut
                          ? "You have Checked Out for today"
                          : "Mark your Check-In"}
                    </h3>
                    {onDuty && attendanceData?.check_in ? (
                      <p className="text-sm text-slate-500 font-medium">
                        Session started at{" "}
                        <span className="text-emerald-600 font-bold">
                          {format(new Date(attendanceData.check_in), "hh:mm a")}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 font-medium tracking-tight">
                        {isCheckedOut
                          ? "Have a great rest of your day!"
                          : "Capture your presence for the morning shift"}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {(!isCheckedIn || canCheckIn) && (
                      <Button
                        onClick={handleCheckIn}
                        disabled={loading || !canCheckIn}
                        className={`h-14 px-10 rounded-xl text-sm font-bold tracking-tight transition-all active:scale-95 shadow-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}
                      >
                        <LogIn className="w-4 h-4 mr-2" /> MARK CHECK IN
                      </Button>
                    )}
                    {(onDuty || canCheckOut) && (
                      <Button
                        onClick={handleCheckOut}
                        disabled={loading || !canCheckOut}
                        className={`h-14 px-10 rounded-xl text-sm font-bold tracking-tight transition-all active:scale-95 shadow-md bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50`}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> MARK CHECK OUT
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Schedule Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Today&apos;s Schedule
            </h3>
            <div className="space-y-3">
              {[
                {
                  time: "08:30 AM",
                  task: "Class 9 Math (A)",
                  room: "L-01",
                  active: true,
                },
                {
                  time: "11:15 AM",
                  task: "Physics Lab (B)",
                  room: "Lab-3",
                  active: false,
                },
                {
                  time: "01:45 PM",
                  task: "Staff Meeting",
                  room: "Conf. Hall",
                  active: false,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border border-transparent transition-all ${item.active ? "bg-blue-50 border-blue-100" : "bg-slate-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <p
                      className={`text-[10px] font-bold ${item.active ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {item.time} · {item.room}
                    </p>
                    {item.active && (
                      <Badge className="bg-blue-600 text-[8px] h-4">NOW</Badge>
                    )}
                  </div>
                  <p
                    className={`text-sm font-bold tracking-tight mt-0.5 ${item.active ? "text-blue-900" : "text-slate-700"}`}
                  >
                    {item.task}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-amber-800 leading-relaxed italic">
              Remember to Check Out before leaving the premises. Late comings
              will be tracked automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Monthly Report Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Monthly Performance Report
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white font-bold outline-none focus:ring-2 focus:ring-blue-100"
            />
            <Button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm font-bold transition-all"
            >
              {reportLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="px-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Avg Check-In
            </p>
            <p className="text-xl font-black text-slate-700 font-mono">
              {reportStats?.avg_check_in || "--:--"}
            </p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Avg Check-Out
            </p>
            <p className="text-xl font-black text-slate-700 font-mono">
              {reportStats?.avg_check_out || "--:--"}
            </p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Avg Work Hours
            </p>
            <p className="text-xl font-black text-blue-600 font-mono">
              {reportStats?.avg_working_hours || "--"}
            </p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Total Late (Mins)
            </p>
            <p className="text-xl font-black text-amber-600 font-mono">
              {reportStats?.total_late_minutes || "0"}
            </p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Total Overtime
            </p>
            <p className="text-xl font-black text-emerald-600 font-mono">
              {reportStats?.total_overtime_minutes || "0"}
              <span className="text-xs ml-1 text-slate-400">m</span>
            </p>
          </div>
        </div>
      </div>

      {/* History - Professional Table Style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" /> Recent Logbook
          </h2>
          <button className="text-[11px] font-bold text-blue-600 hover:underline">
            Download Report
          </button>
        </div>
        {historyLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={historyData}
            emptyMessage="No recent check-ins found."
          />
        )}
      </div>
    </div>
  );
}
