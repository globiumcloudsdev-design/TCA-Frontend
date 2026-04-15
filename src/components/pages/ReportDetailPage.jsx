"use client";
/**
 * ReportDetailPage — Interactive Report with Filters & DataTable
 *
 * Includes Student, Attendance, Exam, Fee, and Payroll reports (API based)
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Loader2,
  ChevronLeft,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  FileText,
  MoreHorizontal,
  Receipt,
  Wallet,
  Printer,
  FileDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import useAuthStore from "@/store/authStore";
import useInstituteStore from "@/store/instituteStore";
import {
  reportService,
  classService,
  examService,
  academicYearService,
  sectionService,
  studentService,
} from "@/services";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectField, DatePickerField } from "@/components/common";
import ExportModal from "@/components/common/ExportModal";

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPE CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COLUMN DEFINITIONS (A to Z)
// ─────────────────────────────────────────────────────────────────────────────

const STUDENT_REPORT_COLUMNS = [
  // SECTION: PERSONAL
  {
    id: "name",
    header: "Full Name",
    accessorFn: (s) =>
      `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || "—",
  },
  {
    id: "roll_no",
    header: "Roll Number",
    accessorFn: (s) => s.roll_no || s.registration_no || s.roll_number || "—",
  },
  {
    id: "reg_no",
    header: "Registration ID",
    accessorFn: (s) => s.registration_no || "—",
  },
  { id: "gender", header: "Gender", accessorFn: (s) => s.gender || "—" },
  {
    id: "dob",
    header: "Date of Birth",
    accessorFn: (s) => s.dob || s.date_of_birth || "—",
  },
  {
    id: "admission_date",
    header: "Admission Date",
    accessorFn: (s) => s.admission_date || s.enrollment_date || "—",
  },
  { id: "cnic", header: "CNIC / B-Form", accessorFn: (s) => s.cnic || "—" },
  {
    id: "blood_group",
    header: "Blood Group",
    accessorFn: (s) => s.blood_group || "—",
  },
  { id: "religion", header: "Religion", accessorFn: (s) => s.religion || "—" },
  {
    id: "nationality",
    header: "Nationality",
    accessorFn: (s) => s.nationality || "—",
  },

  // SECTION: ACADEMIC
  {
    id: "academic_year",
    header: "Academic Year",
    accessorFn: (s) => s.academic_year_name || s.academic_year?.name || "—",
  },
  {
    id: "class",
    header: "Class / Program",
    accessorFn: (s) =>
      s.class_name ||
      s.class?.name ||
      s.Class?.name ||
      s.student?.class?.name ||
      s.student?.Class?.name ||
      "—",
  },
  {
    id: "section",
    header: "Section / Batch",
    accessorFn: (s) =>
      s.section_name ||
      s.section?.name ||
      s.Section?.name ||
      s.student?.section?.name ||
      s.student?.Section?.name ||
      "—",
  },
  {
    id: "previous_school",
    header: "Previous School",
    accessorFn: (s) => s.previous_school || "—",
  },
  {
    id: "previous_class",
    header: "Previous Class",
    accessorFn: (s) => s.previous_class || "—",
  },

  // SECTION: CONTACT
  { id: "phone", header: "Phone Number", accessorFn: (s) => s.phone || "—" },
  { id: "email", header: "Email Address", accessorFn: (s) => s.email || "—" },
  { id: "city", header: "City", accessorFn: (s) => s.city || "—" },
  {
    id: "address",
    header: "Present Address",
    accessorFn: (s) => s.present_address || s.address || "—",
  },
  {
    id: "permanent_address",
    header: "Permanent Address",
    accessorFn: (s) => s.permanent_address || "—",
  },

  // SECTION: GUARDIAN
  {
    id: "primary_guardian",
    header: "Primary Guardian",
    accessorFn: (s) => {
      const g =
        (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(
          (x) => x.type === "father" || x.type === "guardian",
        ) ||
        (s.guardians && s.guardians[0]);
      return g?.name || s.father_name || s.guardian_name || "—";
    },
  },
  {
    id: "guardian_relation",
    header: "Relation",
    accessorFn: (s) => {
      const g =
        (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(
          (x) => x.type === "father" || x.type === "guardian",
        ) ||
        (s.guardians && s.guardians[0]);
      return g?.relation || g?.type || (s.father_name ? "Father" : "—");
    },
  },
  {
    id: "guardian_phone",
    header: "Guardian Phone",
    accessorFn: (s) => {
      const g =
        (s.guardians && Array.isArray(s.guardians) ? s.guardians : []).find(
          (x) => x.type === "father" || x.type === "guardian",
        ) ||
        (s.guardians && s.guardians[0]);
      return g?.phone || s.father_phone || "—";
    },
  },
  {
    id: "guardian_email",
    header: "Guardian Email",
    accessorFn: (s) =>
      s.guardians?.find((x) => x.email)?.email || s.guardian_email || "—",
  },
  {
    id: "mother_name",
    header: "Mother Name",
    accessorFn: (s) =>
      s.mother_name ||
      s.guardians?.find((x) => x.type === "mother")?.name ||
      "—",
  },

  // SECTION: HEALTH
  {
    id: "medical_conditions",
    header: "Medical Conditions",
    accessorFn: (s) => s.medical_conditions || "—",
  },
  {
    id: "allergies",
    header: "Allergies",
    accessorFn: (s) => s.allergies || "—",
  },

  // SECTION: FINANCE
  {
    id: "monthly_fee",
    header: "Monthly Fee",
    accessorFn: (s) => s.monthly_fee || "—",
  },
  {
    id: "admission_fee",
    header: "Admission Fee",
    accessorFn: (s) => s.admission_fee || "—",
  },
  {
    id: "concession_type",
    header: "Concession Type",
    accessorFn: (s) => s.concession_type || "—",
  },
  {
    id: "concession_p",
    header: "Concession (%)",
    accessorFn: (s) => s.concession_percentage || "—",
  },

  {
    id: "status",
    header: "Status",
    accessorFn: (s) => (s.is_active ? "Active" : "Inactive"),
  },
];

const EXAM_REPORT_COLUMNS = [
  {
    id: "name",
    header: "Student Name",
    accessorFn: (r) => {
      const s = r.student || r.Student || r;
      return (
        `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
        r.student_name ||
        "—"
      );
    },
  },
  {
    id: "roll_no",
    header: "Roll Number",
    accessorFn: (r) => r.roll_no || r.student?.roll_no || r.roll_number || "—",
  },
  {
    id: "class",
    header: "Class (Section)",
    accessorFn: (r) => `${r.class_name || "—"} (${r.section_name || "—"})`,
  },
  {
    id: "exam",
    header: "Examination",
    accessorFn: (r) => r._injectedExamTitle || r.exam_title || "—",
  },
  {
    id: "marks",
    header: "Marks Obtained",
    accessorFn: (r) => r.total_marks_obtained || r.marks_obtained || "—",
  },
  {
    id: "percentage",
    header: "Percentage",
    accessorFn: (r) =>
      r.percentage ? `${parseFloat(r.percentage).toFixed(1)}%` : "—",
  },
  {
    id: "grade",
    header: "Grade",
    accessorFn: (r) => r.grade || "—",
  },
  {
    id: "status",
    header: "Result Status",
    accessorFn: (r) => (r.status || "—").toUpperCase(),
  },
];

const REPORT_CONFIGS = {
  student: {
    title: "Student Report",
    filters: ["search", "class", "section", "status"],
    columns: [
      STUDENT_REPORT_COLUMNS.find((c) => c.id === "name"),
      {
        id: "ids",
        header: "Roll / Reg No",
        cell: ({ row }) => {
          const s = row.original;
          const roll =
            s.roll_no ||
            s.roll_number ||
            s.Student?.roll_no ||
            s.Student?.roll_number ||
            s.student?.roll_no ||
            s.student?.roll_number ||
            s.Student?.details?.studentDetails?.roll_no ||
            s.student?.details?.studentDetails?.roll_no ||
            s.details?.studentDetails?.roll_no;
          const reg =
            s.registration_no ||
            s.reg_no ||
            s.Student?.registration_no ||
            s.student?.registration_no ||
            s.Student?.details?.studentDetails?.registration_no ||
            s.student?.details?.studentDetails?.registration_no ||
            s.details?.studentDetails?.registration_no;
          return (
            <div className="flex flex-col py-1">
              <span className="text-slate-700 font-bold text-[11px] leading-none mb-1">
                {roll || "—"}
              </span>
              <span className="text-slate-400 text-[10px] leading-tight font-medium uppercase tracking-wider">
                {reg || "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "academic",
        header: "Class (Section)",
        accessorFn: (s) => {
          const cls = s.class_name || s.class?.name || s.Class?.name || "—";
          const sec =
            s.section_name || s.section?.name || s.Section?.name || "—";
          return `${cls} (${sec})`;
        },
      },
      {
        id: "guardian_contact",
        header: "Guardian / Phone",
        accessorFn: (s) => {
          const guardians =
            s.guardians || s.Student?.guardians || s.student?.guardians || [];
          const g =
            (Array.isArray(guardians) ? guardians : []).find(
              (x) => x.type === "father" || x.type === "guardian",
            ) ||
            (guardians && guardians[0]);
          const name =
            g?.name ||
            s.father_name ||
            s.guardian_name ||
            s.details?.studentDetails?.father_name ||
            s.details?.studentDetails?.guardian_name ||
            "—";
          const phone = g?.phone || s.phone || s.guardian_phone || "—";
          return `${name} | ${phone}`;
        },
      },
      STUDENT_REPORT_COLUMNS.find((c) => c.id === "status"),
      {
        id: "actions",
        header: "Action",
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-[10px] font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm bg-white"
            onClick={(e) => {
              e.stopPropagation();
              window.__handleIndividualDownload?.(row.original);
            }}
          >
            <FileDown size={11} /> REPORT
          </Button>
        ),
      },
    ],
    permission: "reports.student",
    theme: "indigo",
    icon: Users,
  },
  attendance: {
    title: "Attendance Report",
    filters: ["search", "dateRange", "class", "section", "type"],
    columns: [
      {
        id: "date",
        header: "Date",
        accessorFn: (s) => s.date || s.attendance_date || "—",
      },
      {
        id: "name",
        header: "Student",
        accessorFn: (s) =>
          s.student_name ||
          s.name ||
          s.Student?.name ||
          `${s.Student?.first_name || ""} ${s.Student?.last_name || ""}`.trim() ||
          s.first_name ||
          "—",
      },
      {
        id: "ids",
        header: "Roll / Reg No",
        cell: ({ row }) => {
          const s = row.original;
          const roll =
            s.roll_no ||
            s.roll_number ||
            s.Student?.roll_no ||
            s.Student?.roll_number ||
            s.student?.roll_no ||
            s.student?.roll_number ||
            s.Student?.details?.studentDetails?.roll_no ||
            s.student?.details?.studentDetails?.roll_no ||
            s.details?.studentDetails?.roll_no;
          const reg =
            s.registration_no ||
            s.reg_no ||
            s.Student?.registration_no ||
            s.student?.registration_no ||
            s.Student?.details?.studentDetails?.registration_no ||
            s.student?.details?.studentDetails?.registration_no ||
            s.details?.studentDetails?.registration_no;
          return (
            <div className="flex flex-col py-1">
              <span className="text-emerald-700 font-bold text-[11px] leading-none mb-1">
                {roll || "—"}
              </span>
              <span className="text-emerald-400/80 text-[10px] leading-tight font-medium uppercase tracking-wider">
                {reg || "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "academic",
        header: "Class (Section)",
        accessorFn: (s) => {
          const cls =
            s.class_name ||
            s.class?.name ||
            s.Class?.name ||
            s.current_class ||
            s.Student?.class?.name ||
            s.Student?.Class?.name ||
            "—";
          const sec =
            s.section_name ||
            s.section?.name ||
            s.Section?.name ||
            s.section ||
            s.Student?.section?.name ||
            s.Student?.Section?.name ||
            "—";
          return `${cls} (${sec})`;
        },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (s) => (s.status || "—").toUpperCase(),
      },
      {
        id: "guardian_contact",
        header: "Guardian / Phone",
        accessorFn: (s) => {
          const student = s.Student || s.student || {};
          const guardians =
            student.guardians ||
            student.details?.studentDetails?.guardians ||
            [];
          const g =
            (Array.isArray(guardians) ? guardians : []).find(
              (x) => x.type === "father" || x.type === "guardian",
            ) ||
            (guardians && guardians[0]);
          const name =
            g?.name ||
            student.father_name ||
            student.guardian_name ||
            student.details?.studentDetails?.father_name ||
            "—";
          const phone =
            g?.phone ||
            student.phone ||
            student.details?.studentDetails?.phone ||
            "—";
          return `${name} | ${phone}`;
        },
      },
    ],
    permission: "reports.attendance",
    theme: "emerald",
    icon: CheckCircle2,
  },
  fee: {
    title: "Fee Collection Report",
    filters: ["search", "class", "section", "status", "dateRange"],
    columns: [
      {
        id: "voucher_number",
        header: "Voucher #",
        accessorFn: (s) => s.voucher_number || "—",
      },
      {
        id: "student_name",
        header: "Student Name",
        accessorFn: (s) => s.student?.name || s.student_name || s.name || "—",
      },
      {
        id: "roll_reg",
        header: "Roll / Reg No",
        accessorFn: (s) => {
          const roll = s.student?.roll_number || s.student?.roll_no || s.roll_no || "—";
          const reg = s.student?.registration_no || s.registration_no || "—";
          return `${roll} / ${reg}`;
        },
      },
      {
        id: "month",
        header: "Month",
        accessorFn: (s) => s.month || "—",
      },
      {
        id: "year",
        header: "Year",
        accessorFn: (s) => s.year || "—",
      },
      {
        id: "issued_date",
        header: "Issued Date",
        accessorFn: (s) => s.issued_date || "—",
      },
      {
        id: "due_date",
        header: "Due Date",
        accessorFn: (s) => s.due_date || "—",
      },
      {
        id: "amount",
        header: "Amount",
        accessorFn: (s) => s.amount || "—",
      },
      {
        id: "discount",
        header: "Discount",
        accessorFn: (s) => s.discount || "—",
      },
      {
        id: "fine",
        header: "Fine",
        accessorFn: (s) => s.fine || "—",
      },
      {
        id: "net_amount",
        header: "Net Amount",
        accessorFn: (s) => s.net_amount || "—",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (s) => (s.status || "—").toUpperCase(),
      },
      // {
      //   id: "fee_breakdown",
      //   header: "Fee Breakdown",
      //   accessorFn: (s) => {
      //     if (!s.fee_breakdown) return "—";
      //     try {
      //       return Object.entries(s.fee_breakdown)
      //         .map(([k, v]) => `${k}: ${v}`)
      //         .join(", ");
      //     } catch {
      //       return "—";
      //     }
      //   },
      // },
      // {
      //   id: "notes",
      //   header: "Notes",
      //   accessorFn: (s) => s.notes || "—",
      // },
      {
        id: "archived",
        header: "Archived",
        accessorFn: (s) => s.archived ? "Yes" : "No",
      },
    ],
    permission: "reports.fee",
    theme: "amber",
    icon: Receipt,
  },
  exam: {
    title: "Exam Result Report",
    filters: ["search", "exam", "class", "section", "status"],
    columns: [
      {
        id: "name",
        header: "Student",
        accessorFn: (s) => {
          const student = s.student || s.Student || {};
          const details =
            student.details?.studentDetails || s.details?.studentDetails || {};
          const first =
            student.first_name ||
            s.first_name ||
            details.first_name ||
            s.student_name ||
            student.student_name ||
            "";
          const last =
            student.last_name || s.last_name || details.last_name || "";
          const full =
            s.full_name ||
            student.full_name ||
            s.name ||
            student.name ||
            `${first} ${last}`.trim();
          return full || "—";
        },
      },
      {
        id: "ids",
        header: "Roll / Reg No",
        cell: ({ row }) => {
          const s = row.original;
          const student = s.student || s.Student || {};
          const roll =
            student.roll_no ||
            student.roll_number ||
            s.roll_no ||
            s.roll_number ||
            student.details?.studentDetails?.roll_no ||
            s.details?.studentDetails?.roll_no ||
            "—";
          const reg =
            student.registration_no ||
            student.reg_no ||
            s.registration_no ||
            s.reg_no ||
            student.details?.studentDetails?.registration_no ||
            s.details?.studentDetails?.registration_no ||
            "—";
          return (
            <div className="flex flex-col py-1">
              <span className="text-violet-700 font-bold text-[11px] leading-none mb-1">
                {roll || "—"}
              </span>
              <span className="text-violet-400/80 text-[10px] leading-tight font-medium uppercase tracking-wider">
                {reg || "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "academic",
        header: "Class (Section)",
        accessorFn: (s) => {
          const student = s.student || s.Student || {};
          const cls =
            s.class_name ||
            s.class?.name ||
            s.Class?.name ||
            s.current_class ||
            student.class_name ||
            student.class?.name ||
            student.Class?.name ||
            s.exam_schedule?.class?.name ||
            s.exam_schedule?.Class?.name ||
            "—";
          const sec =
            s.section_name ||
            s.section?.name ||
            s.Section?.name ||
            s.section ||
            student.section_name ||
            student.section?.name ||
            student.Section?.name ||
            s.exam_schedule?.section?.name ||
            s.exam_schedule?.Section?.name ||
            "—";
          return `${cls} (${sec})`;
        },
      },
      {
        id: "exam",
        header: "Exam",
        accessorFn: (s) =>
          s._injectedExamTitle ||
          s.exam_title ||
          s.exam_name ||
          s.Exam?.title ||
          s.Exam?.name ||
          s.exam?.title ||
          s.exam?.name ||
          s.exam ||
          s.ExamTitle ||
          s.ExamName ||
          s.exam_schedule?.exam?.title ||
          s.exam_schedule?.exam?.name ||
          s.exam_schedule?.Exam?.Title ||
          "—",
      },
      {
        id: "result",
        header: "Marks (Obt/Total)",
        accessorFn: (s) => {
          const obt =
            s.total_marks_obtained ??
            s.total_obtained ??
            s.marks_obtained ??
            s.marks ??
            s.obtained_marks ??
            s.score ??
            s.marks_obt ??
            s.result_marks ??
            s.obtained;
          const total =
            s.total_marks ??
            s.max_marks ??
            s.total ??
            s.max_score ??
            s.total_score ??
            s.exam_total_marks;
          return obt !== undefined && total !== undefined
            ? `${obt} / ${total}`
            : obt || "—";
        },
      },
      {
        id: "percentage",
        header: "%",
        accessorFn: (s) =>
          s.percentage ||
          s.pct ||
          (s.marks_obtained && s.total_marks
            ? `${((s.marks_obtained / s.total_marks) * 100).toFixed(2)}%`
            : "—"),
      },
      {
        id: "grade",
        header: "Grade",
        accessorFn: (s) => s.grade || s.result_grade || "—",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (s) => {
          const status = s.status || s.result_status || s.outcome;
          if (status) return status.toUpperCase();
          const perc = parseFloat(
            s.percentage || (s.marks_obtained / s.total_marks) * 100 || 0,
          );
          if (!s.percentage && s.marks_obtained === undefined) return "—";
          return perc >= 33 ? "PASS" : "FAIL";
        },
      },
      {
        id: "position",
        header: "Pos.",
        accessorFn: (s) => s.position || s.rank || s.class_position || "—",
      },
      {
        id: "actions",
        header: "Action",
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 gap-1.5 text-[10px] font-bold border-violet-100 text-violet-600 hover:bg-violet-50 rounded-lg shadow-sm bg-white"
            onClick={(e) => {
              e.stopPropagation();
              window.__handleIndividualDownload?.(row.original);
            }}
          >
            <FileDown size={11} /> REPORT
          </Button>
        ),
      },
    ],
    permission: "reports.exam",
    theme: "violet",
    icon: Sparkles,
  },
  payroll: {
    title: "Payroll Report",
    filters: ["search", "dateRange", "status"],
    columns: [
      {
        id: "name",
        header: "Staff Name",
        accessorFn: (s) => s.staff_name || s.name || s.user?.name || "—",
      },
      {
        id: "role",
        header: "Role",
        accessorFn: (s) => s.role || s.user?.role || "—",
      },
      {
        id: "month",
        header: "Month",
        accessorFn: (s) => s.month || "—",
      },
      {
        id: "basic",
        header: "Basic",
        accessorFn: (s) => (s.basic_salary ? `$${s.basic_salary}` : "—"),
      },
      {
        id: "net",
        header: "Net Salary",
        accessorFn: (s) => (s.net_salary ? `$${s.net_salary}` : "—"),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (s) => (s.status || "—").toUpperCase(),
      },
    ],
    permission: "reports.payroll",
    theme: "rose",
    icon: Wallet,
  },
};

const THEMES = {
  indigo: {
    main: "text-indigo-600",
    bg: "bg-indigo-50/50",
    grad: "from-indigo-500/10 to-transparent",
    border: "border-indigo-100/50",
  },
  emerald: {
    main: "text-emerald-600",
    bg: "bg-emerald-50/50",
    grad: "from-emerald-500/10 to-transparent",
    border: "border-emerald-100/50",
  },
  amber: {
    main: "text-amber-600",
    bg: "bg-amber-50/50",
    grad: "from-amber-500/10 to-transparent",
    border: "border-amber-100/50",
  },
  rose: {
    main: "text-rose-600",
    bg: "bg-rose-50/50",
    grad: "from-rose-500/10 to-transparent",
    border: "border-rose-100/50",
  },
  violet: {
    main: "text-violet-600",
    bg: "bg-violet-50/50",
    grad: "from-violet-500/10 to-transparent",
    border: "border-violet-100/50",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ReportFilters({
  reportType,
  filters,
  onFilterChange,
  options,
  loading,
  sections = [],
  exams = [],
  onExport,
  isExporting,
  canExport,
}) {
  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;
  const showFilter = (name) => config.filters?.includes(name);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
            <Filter size={14} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
            Search & Filters
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <Loader2 size={12} className="animate-spin" /> Fetching...
            </div>
          )}

          {showFilter("search") && (
            <div className="relative w-48 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                defaultValue={filters.search}
                onChange={(e) => {
                  const val = e.target.value;
                  const timer = setTimeout(() => {
                    onFilterChange("search", val);
                  }, 500);
                  // Clean up previous timer would require state/ref,
                  // but simplest way is to handle it in parent or use a dedicated hook.
                  // Actually, let's keep it simple and just ensure it filters.
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter")
                    onFilterChange("search", e.target.value);
                }}
                placeholder="Search students..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[11px] focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all outline-none"
              />
            </div>
          )}

          <Button
            onClick={onExport}
            disabled={!canExport || isExporting}
            size="sm"
            className="h-9 px-4 rounded-xl bg-slate-900 border-none hover:bg-slate-800 text-white font-bold text-[11px] shadow-lg shadow-slate-200 transition-all active:scale-95 whitespace-nowrap"
          >
            {isExporting ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Download size={14} className="mr-2" />
            )}
            {isExporting ? "PREPARING..." : "EXPORT RECORDS"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
        {/* Academic Year Filter */}
        <SelectField
          label="Academic Year"
          placeholder="Select Year"
          value={filters.academic_year_id}
          onChange={(v) => {
            onFilterChange("academic_year_id", v);
            onFilterChange("exam_id", "");
            onFilterChange("class_id", "");
            onFilterChange("section_id", "");
          }}
          options={options.years || []}
          className="w-full"
        />

        {showFilter("exam") && (
          <SelectField
            label="Select Exam"
            placeholder="Choose Exam"
            value={filters.exam_id}
            onChange={(v) => {
              onFilterChange("exam_id", v);
              onFilterChange("class_id", "");
              onFilterChange("section_id", "");
            }}
            options={(exams || []).map((ex) => ({
              value: ex.id,
              label: ex.title || ex.name,
            }))}
            className="w-full"
            disabled={!filters.academic_year_id}
          />
        )}

        {showFilter("class") &&
          (reportType !== "exam" || !!filters.exam_id) && (
            <SelectField
              label="Class / Course"
              placeholder="Select Class"
              value={filters.class_id}
              onChange={(v) => {
                onFilterChange("class_id", v);
                onFilterChange("section_id", "");
              }}
              options={(options.classes || []).map((c) => ({
                value: String(c.value || c.id || ""),
                label: c.label || c.name || "Unknown",
              }))}
              className="w-full"
              disabled={!filters.academic_year_id}
            />
          )}

        {showFilter("section") &&
          (reportType !== "exam" || !!filters.exam_id) && (
            <SelectField
              label="Section / Batch"
              placeholder="Select Section"
              value={filters.section_id}
              onChange={(v) => onFilterChange("section_id", v)}
              options={(sections || []).map((s) => ({
                value: String(s.value || s.id || ""),
                label: s.label || s.name || s.section_name || "—",
              }))}
              className="w-full"
              disabled={!filters.class_id}
            />
          )}

        {showFilter("dateRange") && (
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <DatePickerField
              label="From"
              placeholder="From Date"
              value={filters.from_date}
              onChange={(val) => {
                onFilterChange("from_date", val);
                // Reset 'To' date if it's before the new 'From' date
                if (filters.to_date && val && val > filters.to_date) {
                  onFilterChange("to_date", "");
                }
              }}
              className="w-full"
              disableFutureDates
            />
            <DatePickerField
              label="To"
              placeholder="To Date"
              value={filters.to_date}
              onChange={(val) => onFilterChange("to_date", val)}
              className="w-full"
              minDate={filters.from_date}
              disableFutureDates
            />
          </div>
        )}

        {showFilter("search") && reportType === "fee" && (
          <SelectField
            label="Month"
            placeholder="Select Month"
            value={filters.month}
            onChange={(v) => onFilterChange("month", v)}
            options={[
              { value: "", label: "All Months" },
              { value: "1", label: "January" },
              { value: "2", label: "February" },
              { value: "3", label: "March" },
              { value: "4", label: "April" },
              { value: "5", label: "May" },
              { value: "6", label: "June" },
              { value: "7", label: "July" },
              { value: "8", label: "August" },
              { value: "9", label: "September" },
              { value: "10", label: "October" },
              { value: "11", label: "November" },
              { value: "12", label: "December" },
            ]}
            className="w-full"
          />
        )}

        {showFilter("status") && (
          <SelectField
            label="Status"
            placeholder="All Status"
            value={filters.status}
            onChange={(v) => onFilterChange("status", v)}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "partial", label: "Partial" },
              { value: "overdue", label: "Overdue" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportType = searchParams.get("report") || "student";
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const canDo = useAuthStore((s) => s.canDo);

  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;

  // State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: "",
    class_id: "",
    section_id: "",
    from_date: "",
    to_date: "",
    exam_id: "",
    status: "",
    academic_year_id: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const [exporting, setExporting] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // FETCH: Helper data
  const { data: yearsData } = useQuery({
    queryKey: ["academic-years", currentInstitute?.id],
    queryFn: () => academicYearService.getOptions(currentInstitute?.id),
    enabled: !!currentInstitute?.id,
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes", currentInstitute?.id, filters.academic_year_id],
    queryFn: () =>
      classService.getAll({
        institute_id: currentInstitute?.id,
        academic_year_id: filters.academic_year_id,
        limit: 100,
      }),
    enabled: !!currentInstitute?.id && !!filters.academic_year_id,
  });

  const { data: examsData } = useQuery({
    queryKey: ["exams", currentInstitute?.id, filters.academic_year_id],
    queryFn: () =>
      examService.getAll({
        academic_year_id: filters.academic_year_id,
        limit: 100,
      }),
    enabled: !!filters.academic_year_id && reportType === "exam",
  });

  // Sections
  const { data: sectionsData } = useQuery({
    queryKey: ["sections", filters.class_id],
    queryFn: () =>
      sectionService.getAll({ class_id: filters.class_id, limit: 100 }),
    enabled: !!filters.class_id,
  });

  // Exam Details (for GradeSheet generation fallback)
  const { data: currentExamDetails } = useQuery({
    queryKey: ["exam-details", filters.exam_id],
    queryFn: () => examService.getById(filters.exam_id),
    enabled: reportType === "exam" && !!filters.exam_id,
  });

  // Default Year Effect
  useEffect(() => {
    if (yearsData?.data?.length && !filters.academic_year_id) {
      const current =
        yearsData.data.find((y) => y.is_current) || yearsData.data[0];
      setFilters((prev) => ({
        ...prev,
        academic_year_id: String(current.value || current.id),
      }));
    }
  }, [yearsData, filters.academic_year_id]);

  const examList = (() => {
    const raw = examsData?.data || examsData;
    if (Array.isArray(raw)) return raw;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  })();

  // Extract actual arrays with deep nesting support
  const classList = (() => {
    let list = [];
    const raw = classesData?.data || classesData;
    if (Array.isArray(raw)) list = raw;
    else if (raw?.items && Array.isArray(raw.items)) list = raw.items;

    // FOR EXAM REPORT: Filter classes to only show those assigned to the selected exam
    if (reportType === "exam" && filters.exam_id) {
      const selectedExam = examList.find(
        (ex) => String(ex.id) === String(filters.exam_id),
      );
      if (selectedExam) {
        const targetClassId =
          selectedExam.class_id ||
          selectedExam.Class?.id ||
          selectedExam.ClassId ||
          selectedExam.exam_schedule?.class_id;

        if (targetClassId) {
          return list.filter(
            (c) => String(c.id || c.value) === String(targetClassId),
          );
        }
      }
    }

    return list;
  })();

  const sectionList = (() => {
    // Priority 1: From dedicated sectionsData
    const rawSections = sectionsData?.data || sectionsData;
    if (Array.isArray(rawSections)) return rawSections;
    if (rawSections?.items && Array.isArray(rawSections.items))
      return rawSections.items;

    // Priority 2: From selected Class object
    const selectedClass = classList.find(
      (c) => String(c.id) === String(filters.class_id),
    );
    const nested =
      selectedClass?.Sections ||
      selectedClass?.sections ||
      selectedClass?.data?.sections;
    if (Array.isArray(nested)) return nested;

    return [];
  })();

  const options = {
    years: yearsData?.data || [],
    classes: classList,
    sections: sectionList,
  };

  // FETCH: Report data
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["report", reportType, filters],
    queryFn: async () => {
      let res;
      const apiParams = {
        ...filters,
        institute_id: currentInstitute?.id,
        institute_type: currentInstitute?.type,
        limit: filters.limit || 500,
      };

      // SIMPLE DIRECT INTEGRATION: Student Report
      if (reportType === "student") {
        const apiRes = await studentService.getAll({
          ...filters, // Pass all selected filters (class_id, section_id, status, academic_year_id)
          institute_id: currentInstitute?.id,
          limit: filters.limit || 500,
          page: filters.page || 1,
        }, currentInstitute?.type || "school");

        const rawArray = Array.isArray(apiRes?.data) ? apiRes.data : 
                        (Array.isArray(apiRes) ? apiRes : []);

        res = {
          success: true,
          data: {
            records: rawArray.map(s => {
              const sd = s.details?.studentDetails || s.details || {};
              return {
                ...s,
                ...sd,
                display_name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || sd.first_name || "—",
                class_name: sd.class_name || s.class_name || "—",
                section_name: sd.section_name || s.section_name || "—",
                roll_no: sd.roll_no || s.roll_no || s.registration_no || "—"
              };
            }),
            pagination: apiRes?.pagination || {
              total: rawArray.length,
              page: filters.page,
              limit: filters.limit,
              totalPages: Math.ceil(rawArray.length / filters.limit)
            }
          }
        };
      }
      else if (reportType === "attendance")
        res = await reportService.getAttendanceReport(apiParams);
      else if (reportType === "fee")
        res = await reportService.getFeeReport(apiParams);
      else if (reportType === "exam")
        res = await reportService.getExamReport(apiParams);
      else return null;

      // ─── Inject Mapping and Metadata for Exam Reports ───
      if (reportType === "exam" && res?.data?.records) {
        const records = res?.data?.records || [];
        const selectedExam = examList.find(
          (ex) => String(ex.id) === String(filters.exam_id),
        );

        res.data.records = records.map((r) => {
          const student = r.student || r.Student || {};
          const sDetails = student.details?.studentDetails || {};
          const guardians = sDetails.guardians || student.guardians || [];
          const primaryG = Array.isArray(guardians)
            ? guardians.find(
                (g) => g.type === "father" || g.type === "guardian",
              ) || guardians[0]
            : null;

          return {
            ...r,
            ...student,
            ...sDetails,
            _injectedExamTitle:
              selectedExam?.title || selectedExam?.name || "Exam Result",
            // Explicit extraction for the columns
            roll_no: sDetails.roll_no || student.roll_no || r.roll_no,
            class_name: sDetails.class_name || student.class_name,
            section_name: sDetails.section_name || student.section_name,
            father_name:
              sDetails.father_name ||
              student.father_name ||
              primaryG?.name ||
              "—",
            phone: student.phone || sDetails.phone || primaryG?.phone || "—",
            display_name:
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              student.email ||
              "—",
          };
        });
      }

      return res;
    },
    enabled:
      !!currentInstitute?.id &&
      (reportType !== "exam" || (!!filters.exam_id && !!filters.class_id)),
  });

  const [individualExportData, setIndividualExportData] = useState(null);
  const [hydratingBulk, setHydratingBulk] = useState(false);
  const [hydratedBulkData, setHydratedBulkData] = useState([]);

  // Bulk Profile Download (Parallel Hydration)
  const handleBulkProfileDownload = async () => {
    const rawRecords = reportData?.data?.records || [];
    if (!rawRecords.length) return;

    setHydratingBulk(true);
    const loadingToast = toast.loading(
      `Preparing high-detail profiles for ${rawRecords.length} students...`,
    );

    try {
      // Fetch all full records in parallel
      const fullyLoaded = await Promise.all(
        rawRecords.map(async (s) => {
          try {
            const res = await studentService.getById(s.id);
            const full = res.data || s;
            const details = full.details?.studentDetails || {};
            return { ...full, ...details };
          } catch {
            return s; // Fallback to basic if fetch fails
          }
        }),
      );

      setHydratedBulkData(fullyLoaded);
      setExporting(true); // Open the modal
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Bulk hydration error:", error);
      toast.error("Failed to prepare full profiles", { id: loadingToast });
    } finally {
      setHydratingBulk(false);
    }
  };

  const handleExamDownload = async (record) => {
    if (!filters.exam_id) {
      toast.error("Please select an exam first");
      return;
    }
    const studentId = record?.student_id || record?.student?.id || record?.id;
    if (!studentId) {
      toast.error("Student ID not found for this record");
      return;
    }

    const loadingToast = toast.loading("Preparing report card...");
    try {
      let data = null;
      try {
        const res = await examService.generateGradeSheet(filters.exam_id, {
          student_id: studentId,
          class_id: filters.class_id,
          section_id: filters.section_id,
        });
        data = res?.data || res;
      } catch (apiError) {
        console.warn(
          "Grade sheet API failed, using table record fallback",
          apiError,
        );
        data = {
          student: record.student || record.Student || record,
          result: record,
          exam: currentExamDetails?.data || currentExamDetails || {},
        };
      }

      if (!data || (!data.student && !data.id)) {
        throw new Error("Could not prepare report data");
      }

      const student = data.student || record.student || record.Student || {};
      const result = data.result || record || {};
      const exam =
        data.exam || currentExamDetails?.data || currentExamDetails || {};

      const flattened = {
        ...student,
        ...result,
        ...exam,
        _isGradeSheet: true,
        student: {
          ...student,
          // Ensure these are directly on student for the PDF
          roll_number: student.roll_number || student.roll_no || result.roll_no,
          registration_no: student.registration_no || result.registration_no,
        },
        exam: {
          ...exam,
          name:
            exam.name ||
            exam.title ||
            record._injectedExamTitle ||
            record.exam_title ||
            "Examination Result",
          title:
            exam.title ||
            exam.name ||
            record._injectedExamTitle ||
            record.exam_title ||
            "Examination Result",
          class_name:
            student.class_name || result.class_name || exam.class_name,
          section_name:
            student.section_name || result.section_name || exam.section_name,
        },
        result: {
          ...result,
          subject_marks: result.subject_marks || [],
        },
        first_name: student.first_name || "Student",
        last_name: student.last_name || "",
      };

      setIndividualExportData([flattened]);
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Grade sheet prep error:", error);
      toast.error(error.message || "Failed to prepare report", {
        id: loadingToast,
      });
    }
  };

  const handleBulkGradeSheetDownload = async () => {
    const rawRecords = reportData?.data?.records || [];
    if (!rawRecords.length) return;

    setHydratingBulk(true);
    const loadingToast = toast.loading(
      `Preparing ${rawRecords.length} grade sheets for class export...`,
    );

    try {
      const allGradeSheets = await Promise.all(
        rawRecords.map(async (r) => {
          try {
            const studentId = r?.student_id || r?.student?.id || r?.id;
            if (!studentId) return null;

            let data = null;
            try {
              const res = await examService.generateGradeSheet(
                filters.exam_id,
                {
                  student_id: studentId,
                  class_id: filters.class_id,
                  section_id: filters.section_id,
                },
              );
              data = res?.data || res;
            } catch (apiError) {
              data = {
                student: r.student || r.Student || r,
                result: r,
                exam: currentExamDetails?.data || currentExamDetails || {},
              };
            }

            const student = data.student || data || {};
            const result = data.result || r || {};
            const exam =
              data.exam || currentExamDetails?.data || currentExamDetails || {};

            return {
              ...student,
              ...result,
              ...exam,
              _isGradeSheet: true,
              student,
              exam,
              result,
              first_name: student.first_name || student.name || "Student",
            };
          } catch (e) {
            console.warn("Failed to prepare grade sheet for record", r, e);
            return null;
          }
        }),
      );

      const filtered = allGradeSheets.filter(Boolean);
      if (filtered.length === 0) throw new Error("No data could be prepared");

      setHydratedBulkData(filtered);
      setExporting(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Bulk grade sheet error:", error);
      toast.error("Failed to prepare bulk reports", { id: loadingToast });
    } finally {
      setHydratingBulk(false);
    }
  };

  // Expose individual download to window for the cell button
  useEffect(() => {
    window.__handleIndividualDownload = async (record) => {
      if (reportType === "exam") {
        handleExamDownload(record);
        return;
      }

      const student = record; // record is treated as student in other reports
      if (!student?.id) return;

      const loadingToast = toast.loading("Fetching full student profile...");
      try {
        const res = await studentService.getById(student.id);
        const fullData = res.data || student;

        // Ensure flattening matches ExportModal expectations
        const details = fullData.details?.studentDetails || {};
        const flattened = {
          ...fullData,
          ...details,
        };

        setIndividualExportData([flattened]);
        toast.dismiss(loadingToast);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Using basic data as fetch failed", { id: loadingToast });
        setIndividualExportData([student]);
      }
    };
    return () => delete window.__handleIndividualDownload;
  }, [reportType, filters.exam_id]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportReport({
        report_type: reportType,
        filters,
        format: "excel",
      });
      toast.success("Excel Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const displayRecords = useMemo(() => {
    const raw = reportData?.data?.records || [];
    if (!filters.search) return raw;

    const searchTerm = filters.search.toLowerCase();
    return raw.filter((r) => {
      const student = r.student || r.Student || {};
      const fullName =
        `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
      const rollNo = String(
        r.roll_no ||
          r.roll_number ||
          student.roll_no ||
          student.roll_number ||
          "",
      ).toLowerCase();
      const studentName = String(r.student_name || "").toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        rollNo.includes(searchTerm) ||
        studentName.includes(searchTerm)
      );
    });
  }, [reportData, filters.search]);

  // Build Columns
  const columns = useMemo(() => {
    if (!config.columns) return [];
    return config.columns.map((col) => {
      // Base column object
      const tableCol = {
        id: col.id || col.key,
        header: col.header || col.label,
        size: col.size,
      };

      if (col.key) tableCol.accessorKey = col.key;
      if (col.accessorFn) tableCol.accessorFn = col.accessorFn;

      // Custom formatting
      tableCol.cell = ({ getValue, row }) => {
        // If config has its own cell, use it
        if (col.cell) return col.cell({ getValue, row });

        const value = col.accessorFn
          ? col.accessorFn(row.original)
          : getValue();
        const key = col.key || col.id;

        if (key === "status") {
          const colors = {
            active: "bg-emerald-50 text-emerald-600 border-emerald-100",
            paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
            present: "bg-emerald-50 text-emerald-600 border-emerald-100",
            absent: "bg-rose-50 text-rose-600 border-rose-100",
            unpaid: "bg-rose-50 text-rose-600 border-rose-100",
            inactive: "bg-slate-50 text-slate-400 border-slate-200",
          };
          return (
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border tracking-tight",
                colors[String(value).toLowerCase()] ||
                  "bg-slate-50 border-slate-200",
              )}
            >
              {value}
            </span>
          );
        }

        if (key === "name")
          return (
            <span className="font-semibold text-slate-800 text-sm">
              {value}
            </span>
          );

        return (
          <span className="text-slate-500 text-xs font-medium">{value}</span>
        );
      };

      return tableCol;
    });
  }, [config.columns]);

  if (!hasHydrated) return <div className="min-h-screen bg-white" />;

  if (!canDo(config.permission)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-100 border border-rose-100">
          <AlertCircle size={38} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report Restricted
          </h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
            You don't have the necessary administrative privileges to view the{" "}
            {config.title}.
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="h-10 rounded-xl border-slate-200 px-6 font-semibold"
        >
          Return Back
        </Button>
      </div>
    );
  }

  // Derived Pagination Info
  const totalRecords =
    reportData?.data?.pagination?.total ||
    reportData?.pagination?.total ||
    reportData?.data?.records?.length ||
    0;

  const totalPages =
    reportData?.data?.pagination?.totalPages ||
    reportData?.pagination?.totalPages ||
    Math.ceil(totalRecords / (filters.limit || 50)) ||
    1;
  const theme = THEMES[config.theme] || THEMES.indigo;
  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 max-w-[1600px] mx-auto pb-10 px-2 sm:px-0">
      {/* HEADER OVERHAUL */}
      {reportType !== "payroll" && (
        <div className="relative rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50/50 pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="h-11 w-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={22} className="text-slate-600" />
            </button>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <Icon size={12} /> Detailed Insights System
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {config.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {true ? (
        <>
          {/* STATS OVERHAUL */}
          {reportData?.data?.summary && (
            <div className="space-y-5">
              {/* Main totals */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {reportType === "fee" ? (
                  <>
                    <div className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200")}>
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.grad)} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Records</p>
                      <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">{reportData.data.summary.total_records}</h3>
                    </div>
                    <div className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200")}>
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.grad)} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Amount</p>
                      <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">{reportData.data.summary.total_amount}</h3>
                    </div>
                    <div className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-emerald-200")}>
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", "from-emerald-50 to-emerald-100")} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Net Amount</p>
                      <h3 className="text-2xl font-bold text-emerald-700 tabular-nums relative z-10 mt-1">{reportData.data.summary.total_net_amount}</h3>
                    </div>
                    <div className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-rose-200")}>
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", "from-rose-50 to-rose-100")} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Discount</p>
                      <h3 className="text-2xl font-bold text-rose-700 tabular-nums relative z-10 mt-1">{reportData.data.summary.total_discount}</h3>
                    </div>
                  </>
                ) : (
                  Object.entries(reportData.data.summary)
                    .filter(([key]) => !key.startsWith("status_") && !key.includes("breakdown"))
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key} className={cn("rounded-2xl border bg-white p-5 transition-all hover:shadow-xl relative overflow-hidden group border-slate-200")}>
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", theme.grad)} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{key.replace(/_/g, " ")}</p>
                        <h3 className="text-2xl font-bold text-slate-900 tabular-nums relative z-10 mt-1">{value}</h3>
                      </div>
                    ))
                )}
              </div>

              {/* Status breakdown for fee report */}
              {reportType === "fee" && reportData.data.summary.status_breakdown && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  {Object.entries(reportData.data.summary.status_breakdown).map(([status, count]) => {
                    const statusColor = {
                      pending: "text-amber-700 bg-amber-50 border-amber-200",
                      paid: "text-emerald-700 bg-emerald-50 border-emerald-200",
                      partial: "text-blue-700 bg-blue-50 border-blue-200",
                      overdue: "text-rose-700 bg-rose-50 border-rose-200",
                      cancelled: "text-slate-700 bg-slate-50 border-slate-200",
                    };
                    return (
                      <div key={status} className={cn("rounded-xl border p-4 transition-all", statusColor[status] || "border-slate-200")}>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">{status}</p>
                        <p className="text-xl font-bold mt-2">{count}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Filters Bar */}
          <ReportFilters
            filters={filters}
            onFilterChange={onFilterChange}
            reportType={reportType}
            options={options}
            sections={options.sections}
            loading={reportLoading}
            exams={examList}
            onExport={
              reportType === "exam"
                ? () =>
                    handleBulkGradeSheetDownload(
                      reportData?.data?.records || [],
                    )
                : () => setExporting(true)
            }
            isExporting={exporting || hydratingBulk}
            canExport={!!reportData?.data?.records?.length}
          />

          {/* TABLE OVERHAUL */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
            {reportType === "exam" &&
            (!filters.exam_id || !filters.class_id) ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 min-h-[300px]">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                  <Filter size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {reportType === "exam"
                      ? "Examination Results"
                      : "No Data to Display"}
                  </h3>
                  <p className="text-sm text-slate-400 max-w-[280px]">
                    {reportType === "exam"
                      ? "Please select an Exam and Class to view the performance report."
                      : "Please select Class and Section to load the report data."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-0 pb-6 compact-table border-none">
                <DataTable
                  columns={columns}
                  data={displayRecords || []}
                  loading={reportLoading}
                  emptyMessage={
                    reportLoading
                      ? "Loading data..."
                      : `No records found (${yearsData?.data?.find((y) => String(y.id || y.value) === String(filters.academic_year_id))?.label || "Selected Year"})`
                  }
                  pagination={{
                    page: filters.page,
                    totalPages: totalPages,
                    total: totalRecords,
                    onPageChange: (p) => handleFilterChange("page", p),
                    onPageSizeChange: (s) => handleFilterChange("limit", s),
                    pageSize: filters.limit,
                  }}
                />
              </div>
            )}
          </div>

          {/* Export Modals Overlay */}
          <ExportModal
            open={exporting}
            onClose={() => {
              setExporting(false);
              setHydratedBulkData([]); // Clear after use
            }}
            columns={
              reportType === "exam"
                ? EXAM_REPORT_COLUMNS
                : reportType === "fee"
                  ? config.columns
                  : STUDENT_REPORT_COLUMNS
            }
            rows={
              hydratedBulkData.length > 0
                ? hydratedBulkData
                : reportData?.data?.records || []
            }
            fileName={
              reportType === "exam"
                ? `${config.title}-GradeSheets`
                : reportType === "fee"
                  ? `${config.title}-${new Date().toISOString().split('T')[0]}`
                  : `${config.title}-Profiles-Class`
            }
          />

          <ExportModal
            open={!!individualExportData}
            onClose={() => setIndividualExportData(null)}
            columns={
              reportType === "exam"
                ? EXAM_REPORT_COLUMNS
                : STUDENT_REPORT_COLUMNS
            }
            rows={individualExportData || []}
            fileName={
              reportType === "exam"
                ? `GradeSheet-${individualExportData?.[0]?.first_name || "Student"}`
                : `Full-Profile-${individualExportData?.[0]?.first_name || "Student"}`
            }
          />
        </>
      ) : null}
    </div>
  );
}
