"use client";
/**
 * AttendancePage — Adaptive for all institute types
 * School → Subject-wise | Coaching → Session-wise | etc.
 */
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  X,
  Minus,
  QrCode,
  Search,
  Filter,
  FileText,
  Users,
  UserSquare,
  Eye,
  PieChart,
  ArrowLeft,
} from "lucide-react";
import useInstituteConfig from "@/hooks/useInstituteConfig";
import useAuthStore from "@/store/authStore";
import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import AppModal from "@/components/common/AppModal";
import { cn } from "@/lib/utils";
import MarkAttendanceModal from "@/components/attendance/MarkAttendanceModal";
import AttendanceReport from "@/components/attendance/AttendanceReport";
import {
  studentAttendanceService,
  classService,
  academicYearService,
  studentService,
} from "@/services";
import { SelectField, DatePickerField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  holiday: "bg-slate-100 text-slate-700",
  not_marked: "bg-slate-100 text-slate-400",
};

const STATUS_ICONS = {
  present: <CheckSquare size={13} />,
  absent: <X size={13} />,
  late: <Minus size={13} />,
  holiday: <Minus size={13} />,
  not_marked: <Minus size={13} />,
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "holiday", label: "Holiday" },
];

export default function AttendancePage({ type }) {
  const canDo = useAuthStore((s) => s.canDo);
  const { terms, attendanceConfig } = useInstituteConfig();

  const [view, setView] = useState("list"); // 'list' or 'report'
  const [isMarkOpen, setIsMarkOpen] = useState({ open: false, mode: "class" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters State
  const [filters, setFilters] = useState({
    academic_year_id: "",
    class_id: "",
    section_id: "",
    status: "",
    date: format(new Date(), "yyyy-MM-dd"),
    search: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearService.getAll({ is_active: true }),
  });

  // Set default current academic year
  useEffect(() => {
    if (yearsData?.data && !filters.academic_year_id) {
      const currentYear =
        yearsData.data.find((y) => {
          const isCurrent = y.is_current;
          return (
            isCurrent === true ||
            isCurrent === 1 ||
            String(isCurrent) === "true" ||
            String(isCurrent) === "1"
          );
        }) || yearsData.data[0];

      if (currentYear) {
        setFilters((prev) => ({ ...prev, academic_year_id: currentYear.id }));
      }
    }
  }, [yearsData?.data, filters.academic_year_id]);

  // Fetch Classes
  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.getAll(),
  });

  // Extract Sections from selected class
  const sections = useMemo(() => {
    if (!filters.class_id || filters.class_id === "all" || !classesData?.data)
      return [];
    const selectedClass = classesData.data.find(
      (c) => String(c.id) === String(filters.class_id),
    );
    return selectedClass?.sections || [];
  }, [filters.class_id, classesData]);

  // Fetch ALL students for selected class+section AND active academic year
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students-attendance-view", filters.class_id, filters.section_id, filters.academic_year_id],
    queryFn: async () => {
      const params = { limit: 1000 };
      if (filters.academic_year_id) params.academic_year_id = filters.academic_year_id;
      if (filters.class_id && filters.class_id !== "all") params.class_id = filters.class_id;
      if (filters.section_id) params.section_id = filters.section_id;
      
      const res = await studentService.getAll(params, type);
      return res?.data?.rows ?? res?.data ?? [];
    },
    enabled: !!filters.class_id,
  });

  // Fetch attendance records for date+class+section
  const { data: attendanceData, isLoading: isLoadingAttendance, refetch } = useQuery({
    queryKey: ["attendance", filters.class_id, filters.section_id, filters.date, filters.academic_year_id],
    queryFn: () =>
      studentAttendanceService.getAttendance({
        class_id: filters.class_id === "all" ? undefined : filters.class_id,
        section_id: filters.section_id || undefined,
        date: filters.date,
        academic_year_id: filters.academic_year_id || undefined,
        limit: 1000,
      }),
    enabled: !!filters.class_id && !!filters.date,
  });

  const isLoading = isLoadingStudents || isLoadingAttendance;
  const attendanceRecords = attendanceData?.data || [];

  // Merge: all students + their attendance status for the selected date
  const rows = useMemo(() => {
    const students = studentsData || [];
    if (!students.length) return [];

    const attendanceMap = {};
    attendanceRecords.forEach((rec) => {
      attendanceMap[String(rec.student_id)] = rec;
    });

    return students
      .map((s) => {
        const details = s.details?.studentDetails || {};
        const activeSession =
          details.academicSessions?.find((sess) => sess.status === "active") || {};
        const attRec = attendanceMap[String(s.id)];
        return {
          ...s,
          student_id: s.id,
          Student: {
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            registration_no: s.registration_no,
          },
          Class: attRec?.Class || { name: activeSession.class_name || "" },
          Section: attRec?.Section || { name: activeSession.section_name || "" },
          date: attRec?.date || filters.date,
          status: attRec?.status || "not_marked",
          type: attRec?.type || null,
        };
      })
      .filter((s) => {
        if (filters.status && filters.status !== "") {
          if (filters.status === "not_marked") return s.status === "not_marked";
          return s.status === filters.status;
        }
        if (filters.search) {
          const name = `${s.first_name} ${s.last_name}`.toLowerCase();
          const reg = (s.registration_no || "").toLowerCase();
          const q = filters.search.toLowerCase();
          return name.includes(q) || reg.includes(q);
        }
        return true;
      });
  }, [studentsData, attendanceRecords, filters.status, filters.search, filters.date]);

  const stats = useMemo(() => {
    if (!rows.length) return { present: 0, absent: 0, late: 0, not_marked: 0, rate: 0 };
    const p = rows.filter((r) => r.status === "present").length;
    const a = rows.filter((r) => r.status === "absent").length;
    const l = rows.filter((r) => r.status === "late").length;
    const nm = rows.filter((r) => r.status === "not_marked").length;
    const marked = p + a + l;
    return {
      present: p,
      absent: a,
      late: l,
      not_marked: nm,
      rate: marked ? Math.round((p / marked) * 100) : 0,
    };
  }, [rows]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      // Reset section if class changes
      if (name === "class_id") {
        newFilters.section_id = "";
      }
      return newFilters;
    });
    setPage(1);
  };

  // Refetch data when filters change
  const columns = useMemo(
    () => [
      {
        accessorKey: "student.registration_no",
        header: "Roll / Reg No",
        cell: ({ row }) => {
          const student = row.original.Student || row.original.student;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                {student?.roll_no || student?.roll_number || student?.details?.studentDetails?.roll_no || "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {student?.registration_no || "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "student.full_name",
        header: `${terms.student} Name`,
        cell: ({ row }) => {
          const student = row.original.Student;
          return (
            <span className="font-medium">
              {student?.first_name || ""} {student?.last_name || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "class.name",
        header: "Class/Section",
        cell: ({ row }) => {
          const classData = row.original.Class;
          const sectionData = row.original.Section;
          return `${classData?.name || ""} - ${sectionData?.name || ""}`;
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => {
          const date = getValue();
          return date ? new Date(date).toLocaleDateString("en-PK") : "N/A";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const s = getValue();
          if (!s) return <span className="text-slate-400">N/A</span>;
          return (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit capitalize",
                STATUS_COLORS[s],
              )}
            >
              {STATUS_ICONS[s]} {s}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Marking Type",
        cell: ({ getValue }) => {
          const type = getValue();
          return (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {type || "Manual"}
            </span>
          );
        },
      },
    ],
    [terms],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Attendance"
        description="Track and manage student daily attendance"
        action={
          <div className="flex gap-2">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className={cn(
                  "px-4 py-1.5 h-auto text-xs font-bold transition-all",
                  view === "list"
                    ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Daily Log
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("report")}
                className={cn(
                  "px-4 py-1.5 h-auto text-xs font-bold transition-all",
                  view === "report"
                    ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Report Mode
              </Button>
            </div>
            <Button
              variant="emerald"
              onClick={() => setIsMarkOpen({ open: true, mode: "scan" })}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR
            </Button>
            {mounted && canDo("attendance.mark") && (
              <Button
                onClick={() => setIsMarkOpen({ open: true, mode: "class" })}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Bulk Mark
              </Button>
            )}
          </div>
        }
      />

      {view === "list" ? (
        <>
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
            <DatePickerField
              label="Attendance Date"
              value={filters.date}
              onChange={(val) => handleFilterChange("date", val)}
              disableFutureDates
            />

            <SelectField
              label="Academic Year"
              options={
                yearsData?.data?.map((y) => ({ value: y.id, label: y.name })) ||
                []
              }
              value={filters.academic_year_id}
              onChange={(val) => handleFilterChange("academic_year_id", val)}
              placeholder="Select Year"
            />

            <SelectField
              label="Class"
              options={[
                { value: "all", label: `All ${terms.class || "Classes"}s` },
                ...(classesData?.data?.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })) || []),
              ]}
              value={String(filters.class_id)}
              onChange={(val) => handleFilterChange("class_id", val)}
              placeholder={`Select ${terms.class || "Class"}`}
            />

            <SelectField
              label="Section"
              options={
                sections.map((s) => ({ value: String(s.id), label: s.name })) ||
                []
              }
              value={String(filters.section_id)}
              onChange={(val) => handleFilterChange("section_id", val)}
              placeholder="All Sections"
              disabled={!filters.class_id || filters.class_id === "all"}
            />

            <SelectField
              label="Status"
              options={[
                ...STATUS_OPTIONS,
                { value: "not_marked", label: "Not Marked" },
              ]}
              value={filters.status}
              onChange={(val) => handleFilterChange("status", val)}
              placeholder="All Status"
            />
          </div>

          {!filters.class_id ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 mt-10 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Select a Class
              </h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Please select a specific Class or "All Classes" from the filters
                above to view attendance records.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              <div className="grid gap-4 sm:grid-cols-5">
                <StatsCard
                  label="Attendance Rate"
                  value={`${stats.rate}%`}
                  icon={<CheckSquare size={18} />}
                  trend={stats.rate >= 75 ? 1 : -1}
                  description="Based on marked students"
                />
                <StatsCard
                  label="Present"
                  value={stats.present}
                  icon={<CheckSquare size={18} />}
                  color="emerald"
                />
                <StatsCard
                  label="Absent"
                  value={stats.absent}
                  icon={<X size={18} />}
                  color="red"
                />
                <StatsCard
                  label="Late"
                  value={stats.late}
                  icon={<Minus size={18} />}
                  color="amber"
                />
                <StatsCard
                  label="Not Marked"
                  value={stats.not_marked}
                  icon={<Minus size={18} />}
                />
              </div>

              <DataTable
                columns={columns}
                data={rows}
                loading={isLoading}
                emptyMessage="No students found for selected class"
                search={filters.search}
                onSearch={(v) => handleFilterChange("search", v)}
                searchPlaceholder="Search student name or reg no..."
                enableColumnVisibility
                exportConfig={{ fileName: `attendance_${filters.date}` }}
                pagination={{
                  page,
                  totalPages: Math.ceil(rows.length / pageSize) || 1,
                  onPageChange: setPage,
                  total: rows.length,
                  pageSize,
                  onPageSizeChange: (s) => {
                    setPageSize(s);
                    setPage(1);
                  },
                }}
              />
            </div>
          )}
        </>
      ) : (
        <AttendanceReport terms={terms} />
      )}

      <AppModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Generate Attendance Reports"
        size="lg"
      >
        <AttendanceReportGenerator
          terms={terms}
          yearsData={yearsData}
          classesData={classesData}
          currentYearId={filters.academic_year_id}
          onClose={() => setIsReportModalOpen(false)}
        />
      </AppModal>

      <MarkAttendanceModal
        open={isMarkOpen.open}
        onClose={() => setIsMarkOpen({ open: false, mode: "class" })}
        defaultMode={isMarkOpen.mode}
        type={type}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Generator Component (Modal Content)
// ─────────────────────────────────────────────────────────────────────────────
function AttendanceReportGenerator({
  terms,
  yearsData,
  classesData,
  currentYearId,
  onClose,
}) {
  const [reportType, setReportType] = useState("class"); // 'class', 'student'
  const [timeframe, setTimeframe] = useState("monthly"); // 'monthly', 'yearly', 'custom'

  const [reportFilters, setReportFilters] = useState({
    academic_year_id: currentYearId,
    class_id: "",
    section_id: "",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    student_id: "", // Used for student search mock
  });

  const sections = useMemo(() => {
    if (!reportFilters.class_id || !classesData?.data) return [];
    const selectedClass = classesData.data.find(
      (c) => c.id === reportFilters.class_id,
    );
    return selectedClass?.sections || [];
  }, [reportFilters.class_id, classesData]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation delay for PDF download
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report successfully generated and downloaded!");
      onClose();
    }, 1500);
  };

  const handleView = async () => {
    setIsViewing(true);
    try {
      let params = {};

      if (timeframe === "monthly") {
        const [yyyy, mm] = reportFilters.month.split("-");
        params.year = yyyy;
        params.month = mm;
      } else {
        const selectedYear = yearsData?.data?.find(
          (y) => y.id === reportFilters.academic_year_id,
        );
        const yStr =
          selectedYear?.name?.split("-")[0] ||
          new Date().getFullYear().toString();
        params.year = yStr;
      }

      if (reportType === "class") {
        if (!reportFilters.class_id) {
          toast.error("Please select a class to view the report.");
          setIsViewing(false);
          return;
        }
        params.class_id = reportFilters.class_id;
        if (reportFilters.section_id)
          params.section_id = reportFilters.section_id;
      } else {
        if (!reportFilters.student_id) {
          toast.error(
            "Please select a student first. (Search integration pending)",
          );
          setIsViewing(false);
          return;
        }
        params.student_id = reportFilters.student_id;
      }

      const res = await studentAttendanceService.getAttendanceReport(params);

      // Backend returns either { class_summary: {...}, student_wise: [...] } or just [...]
      const payload = res?.data || res;
      let studentsList = Array.isArray(payload)
        ? payload
        : payload.student_wise;

      if (!studentsList || studentsList.length === 0) {
        toast.warning("No attendance records found for the selected criteria.");
        setIsViewing(false);
        return;
      }

      let present = 0,
        absent = 0,
        late = 0,
        holiday = 0,
        leave = 0,
        total = 0;
      studentsList.forEach((s) => {
        present += parseInt(s.present || 0);
        absent += parseInt(s.absent || 0);
        late += parseInt(s.late || 0);
        holiday += parseInt(s.holiday || 0);
        leave += parseInt(s.leave || 0);
        total += parseInt(s.total || 0);
      });

      let performance = "0.0";
      if (!Array.isArray(payload) && payload.class_summary) {
        performance = Number(
          payload.class_summary.overall_present_percentage || 0,
        ).toFixed(1);
      } else if (total > 0) {
        performance = ((present / total) * 100).toFixed(1);
      }

      setReportData({
        present,
        absent,
        late,
        holiday,
        leave,
        performance_percentage: performance,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch report data");
    } finally {
      setIsViewing(false);
    }
  };

  if (reportData) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 py-2">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PieChart className="text-indigo-500 w-5 h-5" />
              Report Overview
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {reportType === "class" ? "Class-wide" : "Individual"} Attendance
              Summary
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReportData(null)}
            className="h-9 shrink-0 shadow-sm rounded-xl px-4 font-semibold text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Present */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col justify-center items-center hover:scale-[1.02] transition-transform">
            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {reportData.present}
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-700/60 dark:text-emerald-400/60 tracking-wider mt-1">
              Present
            </span>
          </div>
          {/* Absent */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex flex-col justify-center items-center hover:scale-[1.02] transition-transform">
            <span className="text-4xl font-black text-red-600 dark:text-red-400">
              {reportData.absent}
            </span>
            <span className="text-[10px] uppercase font-bold text-red-700/60 dark:text-red-400/60 tracking-wider mt-1">
              Absent
            </span>
          </div>
          {/* Late */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col justify-center items-center hover:scale-[1.02] transition-transform">
            <span className="text-4xl font-black text-amber-600 dark:text-amber-400">
              {reportData.late}
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-700/60 dark:text-amber-400/60 tracking-wider mt-1">
              Late
            </span>
          </div>
          {/* Holiday */}
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex flex-col justify-center items-center hover:scale-[1.02] transition-transform">
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {reportData.holiday}
            </span>
            <span className="text-[10px] uppercase font-bold text-indigo-700/60 dark:text-indigo-400/60 tracking-wider mt-1">
              Holiday
            </span>
          </div>
        </div>

        <div className="relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-teal-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
              <PieChart className="w-4 h-4" />
              <h4 className="font-bold uppercase tracking-widest text-xs">
                Performance Rate
              </h4>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                {reportData.performance_percentage}
              </p>
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-2 uppercase tracking-wide">
              Calculated System Accuracy
            </p>
          </div>

          <div className="relative z-10 w-full sm:max-w-xs flex-shrink-0 pt-2 sm:pt-0">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Target 100%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Current: {reportData.performance_percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 shadow-inner overflow-hidden border border-slate-200 dark:border-slate-700/50">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full shadow-sm relative transition-all duration-1000 ease-in-out"
                style={{ width: `${reportData.performance_percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end pt-4 gap-3 border-t border-slate-100 dark:border-slate-800/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-semibold"
          >
            Close
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl font-bold"
          >
            {isGenerating ? "Prepping PDF..." : "Download Full PDF Report"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* 1. Report Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setReportType("class")}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
            reportType === "class"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
          }`}
        >
          <div
            className={`p-3 rounded-full ${reportType === "class" ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-slate-100 dark:bg-slate-900"}`}
          >
            <Users
              className={`w-6 h-6 ${reportType === "class" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
            />
          </div>
          <div>
            <h4 className="font-bold text-sm">Class-wise Report</h4>
            <p className="text-xs opacity-70 mt-0.5">
              Summary of attendance for an entire class
            </p>
          </div>
        </div>

        <div
          onClick={() => setReportType("student")}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center ${
            reportType === "student"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
          }`}
        >
          <div
            className={`p-3 rounded-full ${reportType === "student" ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-slate-100 dark:bg-slate-900"}`}
          >
            <UserSquare
              className={`w-6 h-6 ${reportType === "student" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
            />
          </div>
          <div>
            <h4 className="font-bold text-sm">Student-wise Report</h4>
            <p className="text-xs opacity-70 mt-0.5">
              Detailed attendance history of a student
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-base">Configure Report Parameters</h3>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeframe === "monthly" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe("yearly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeframe === "yearly" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Academic Year"
            options={
              yearsData?.data?.map((y) => ({ value: y.id, label: y.name })) ||
              []
            }
            value={reportFilters.academic_year_id}
            onChange={(val) =>
              setReportFilters((p) => ({ ...p, academic_year_id: val }))
            }
            placeholder="Select Year"
          />

          {timeframe === "monthly" && (
            <div className="space-y-1.5 focus-within:text-primary">
              <label className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">
                Reporting Month
              </label>
              <Input
                type="month"
                value={reportFilters.month}
                onChange={(e) =>
                  setReportFilters((p) => ({ ...p, month: e.target.value }))
                }
                className="h-[42px] bg-slate-50/50"
              />
            </div>
          )}

          {reportType === "class" ? (
            <>
              <SelectField
                label={terms?.class || "Class"}
                options={
                  classesData?.data?.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })) || []
                }
                value={reportFilters.class_id}
                onChange={(val) =>
                  setReportFilters((p) => ({
                    ...p,
                    class_id: val,
                    section_id: "",
                  }))
                }
                placeholder={`Select ${terms?.class || "Class"}`}
              />
              <SelectField
                label={terms?.section || "Section"}
                options={
                  sections.map((s) => ({ value: s.id, label: s.name })) || []
                }
                value={reportFilters.section_id}
                onChange={(val) =>
                  setReportFilters((p) => ({ ...p, section_id: val }))
                }
                placeholder="All Sections"
                disabled={!reportFilters.class_id}
              />
            </>
          ) : (
            <div className="md:col-span-2 space-y-1.5 focus-within:text-primary">
              <label className="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300">
                Search {terms?.student || "Student"}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Type name or registration number..."
                  className="pl-9 h-[42px] bg-slate-50/50"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Search to select a specific student for this report.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Select criteria to preview or generate the attendance report.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Button
            variant="ghost"
            className="rounded-xl font-semibold h-11"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleView}
            disabled={isViewing || isGenerating}
            variant="outline"
            className="px-6 h-11 rounded-xl shadow-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            {isViewing ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />{" "}
                Loading...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2 text-indigo-500" /> View Report
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isViewing}
            className="px-6 h-11 rounded-xl shadow-lg shadow-primary/20 font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />{" "}
                Preparing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" /> Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
