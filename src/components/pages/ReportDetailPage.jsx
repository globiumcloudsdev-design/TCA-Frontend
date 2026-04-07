'use client';
/**
 * ReportDetailPage — Interactive Report with Filters & DataTable
 * 
 * Features:
 * - Dynamic filters based on report type
 * - Real-time DataTable with sorting/pagination
 * - Export with current filters
 * - Full permission support
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { reportService, classService, examService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPE CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

const REPORT_CONFIGS = {
  student: {
    title: 'Student Report',
    filters: ['search', 'class', 'section', 'status'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'registration_no', label: 'Registration No.' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'class_name', label: 'Class' },
      { key: 'section_name', label: 'Section' },
      { key: 'father_name', label: "Father's Name" },
      { key: 'joined_on', label: 'Joined' },
    ],
    permission: 'reports.student',
  },
  attendance: {
    title: 'Attendance Report',
    filters: ['dateRange', 'class', 'section', 'type'],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'name', label: 'Student Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'class_name', label: 'Class' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks' },
    ],
    permission: 'reports.attendance',
  },
  fee: {
    title: 'Fee Collection Report',
    filters: ['dateRange', 'class', 'section', 'status'],
    columns: [
      { key: 'name', label: 'Student Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'email', label: 'Email' },
      { key: 'amount', label: 'Amount' },
      { key: 'paid_amount', label: 'Paid' },
      { key: 'outstanding', label: 'Outstanding' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    permission: 'reports.fee',
  },
  exam: {
    title: 'Exam Results Report',
    filters: ['class', 'section', 'exam', 'type'],
    columns: [
      { key: 'name', label: 'Student Name' },
      { key: 'registration_no', label: 'Reg. No.' },
      { key: 'exam', label: 'Exam' },
      { key: 'total_marks', label: 'Total' },
      { key: 'marks_obtained', label: 'Obtained' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'grade', label: 'Grade' },
      { key: 'status', label: 'Status' },
    ],
    permission: 'reports.exam',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER COMPONENT (Using Reusable Components)
// ─────────────────────────────────────────────────────────────────────────────

function ReportFilters({ 
  reportType, 
  filters, 
  onFilterChange, 
  options, 
  loading,
  sections = [],
  exams = [],
  onClassChange
}) {
  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;

  // Debug incoming data
  useEffect(() => {
    console.log('🔍 ReportFilters received:', {
      classesCount: options?.classes?.length || 0,
      sectionsCount: sections?.length || 0,
      examsCount: exams?.length || 0,
    });
  }, [options, sections, exams]);

  // Status options per report type
  const statusOptions = {
    student: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'graduated', label: 'Graduated' },
    ],
    attendance: [
      { value: '', label: 'All Statuses' },
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'leave', label: 'Leave' },
    ],
    fee: [
      { value: '', label: 'All Statuses' },
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Unpaid' },
      { value: 'partial', label: 'Partial' },
      { value: 'overdue', label: 'Overdue' },
    ],
    exam: [
      { value: '', label: 'All Statuses' },
      { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' },
      { value: 'absent', label: 'Absent' },
    ],
  };

  // Type options per report type
  const typeOptions = {
    attendance: [
      { value: 'summary', label: 'Summary' },
      { value: 'detailed', label: 'Detailed' },
      { value: 'student_wise', label: 'Student Wise' },
    ],
    exam: [
      { value: 'class_wise', label: 'Class Wise' },
      { value: 'student_wise', label: 'Student Wise' },
      { value: 'subject_wise', label: 'Subject Wise' },
    ],
  };

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...(Array.isArray(options?.classes) 
      ? options.classes.map((cls) => ({
          value: cls.id || cls._id,
          label: cls.name || cls.title || 'Unknown Class',
        }))
      : []
    ),
  ];

  // Section options based on selected class
  const sectionOptions = [
    { value: '', label: 'All Sections' },
    ...(Array.isArray(sections)
      ? sections.map((sec) => ({
          value: sec.id || sec._id,
          label: sec.name || sec.title || 'Unknown Section',
        }))
      : []
    ),
  ];

  // Exam options
  const examOptions = [
    { value: '', label: 'All Exams' },
    ...(Array.isArray(exams)
      ? exams.map((exam) => ({
          value: exam.id || exam._id,
          label: exam.name || exam.title || 'Unknown Exam',
        }))
      : []
    ),
  ];

  // Custom date validation: disable future dates
  const disableFutureDateMatcher = (date) => {
    return isAfter(startOfDay(date), startOfDay(new Date()));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🔍 Filters</h3>
        {Object.entries(filters).filter(([_, v]) => v).length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {Object.entries(filters).filter(([_, v]) => v).length} active
          </span>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        {config.filters.includes('search') && (
          <InputField
            name="search"
            label="🔎 Search Name/Email"
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            disabled={loading}
            className="text-sm"
          />
        )}

        {/* Date Range - From (Disable Future Dates) */}
        {config.filters.includes('dateRange') && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">📅 From Date</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date || ''}
              onChange={(e) => onFilterChange('from_date', e.target.value)}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </div>
        )}

        {/* Date Range - To (Disable Future Dates) */}
        {config.filters.includes('dateRange') && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">📅 To Date</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date || ''}
              onChange={(e) => onFilterChange('to_date', e.target.value)}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </div>
        )}

        {/* Class */}
        {config.filters.includes('class') && (
          <SelectField
            name="class_id"
            label="🏫 Class"
            value={filters.class_id || ''}
            onChange={(v) => {
              onFilterChange('class_id', v);
              // Reset section when class changes
              onFilterChange('section_id', '');
              onClassChange?.(v);
            }}
            disabled={loading}
            options={classOptions}
            placeholder="All Classes"
          />
        )}

        {/* Section (Dynamic based on class) */}
        {config.filters.includes('section') && (
          <SelectField
            name="section_id"
            label="📚 Section"
            value={filters.section_id || ''}
            onChange={(v) => onFilterChange('section_id', v)}
            disabled={loading || !filters.class_id}
            options={sectionOptions}
            placeholder={filters.class_id ? "Select Section" : "Choose class first"}
          />
        )}

        {/* Exam (For exam reports) */}
        {config.filters.includes('exam') && exams.length > 0 && (
          <SelectField
            name="exam_id"
            label="📝 Exam"
            value={filters.exam_id || ''}
            onChange={(v) => onFilterChange('exam_id', v)}
            disabled={loading}
            options={examOptions}
            placeholder="All Exams"
          />
        )}

        {/* Status */}
        {config.filters.includes('status') && (
          <SelectField
            name="status"
            label="📊 Status"
            value={filters.status || ''}
            onChange={(v) => onFilterChange('status', v)}
            disabled={loading}
            options={statusOptions[reportType] || statusOptions.student}
            placeholder="All Statuses"
          />
        )}

        {/* Type */}
        {config.filters.includes('type') && (
          <SelectField
            name="report_type"
            label="📋 Report Type"
            value={filters.type || 'summary'}
            onChange={(v) => onFilterChange('type', v)}
            disabled={loading}
            options={typeOptions[reportType] || []}
            placeholder="Select type"
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportDetailPage({ reportType: propReportType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportType = propReportType || searchParams.get('report') || 'student';
  
  const canDo = useAuthStore((s) => s.canDo);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);

  // Permission check
  if (!canDo(REPORT_CONFIGS[reportType]?.permission)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Access denied to this report</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.student;
  const [filters, setFilters] = useState({ skip: 0, limit: 50 });
  const [exporting, setExporting] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────
  // FETCH: Classes (same as AttendancePage)
  // ────────────────────────────────────────────────────────────────────────────
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FETCH: Sections (from selected class sections array)
  // ────────────────────────────────────────────────────────────────────────────
  const sections = useMemo(() => {
    if (!filters.class_id || !classesData?.data) return [];
    const selectedClass = classesData.data.find(c => String(c.id) === String(filters.class_id));
    const sectionList = selectedClass?.sections || [];
    console.log(`✅ Sections for class ${filters.class_id}:`, sectionList);
    return sectionList;
  }, [filters.class_id, classesData]);

  // ────────────────────────────────────────────────────────────────────────────
  // FETCH: Exams (for exam reports only)
  // ────────────────────────────────────────────────────────────────────────────
  const { data: examsData } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examService.getAll(),
    enabled: reportType === 'exam',
  });

  // ────────────────────────────────────────────────────────────────────────────
  // FETCH: Report data
  // ────────────────────────────────────────────────────────────────────────────
  const { data: reportData, isLoading: reportLoading, refetch } = useQuery({
    queryKey: ['report', reportType, filters],
    queryFn: async () => {
      if (reportType === 'student') return reportService.getStudentReport(filters);
      if (reportType === 'attendance') return reportService.getAttendanceReport(filters);
      if (reportType === 'fee') return reportService.getFeeReport(filters);
      if (reportType === 'exam') return reportService.getExamReport(filters);
      
      return null;
    },
    enabled: !!currentInstitute?.id,
  });

  // Debug logging (AFTER all hooks are declared)
  useEffect(() => {
    console.group('📊 ReportDetailPage - Data Status');
    console.log('Classes:', classesData?.data);
    console.log('Sections:', sections);
    console.log('Exams:', examsData?.data);
    console.log('Report Type:', reportType);
    console.log('Current Institute:', currentInstitute);
    console.groupEnd();
  }, [classesData, sections, examsData, reportType, currentInstitute]);

  // Build DataTable columns
  const columns = useMemo(() => {
    return config.columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ getValue }) => {
        const value = getValue();
        // Format currency
        if (col.key.includes('amount') || col.key.includes('outstanding')) {
          return <span className="font-medium">{value}</span>;
        }
        // Format status
        if (col.key === 'status') {
          const statusColors = {
            paid: 'bg-emerald-100 text-emerald-700',
            unpaid: 'bg-red-100 text-red-600',
            partial: 'bg-amber-100 text-amber-700',
            present: 'bg-emerald-100 text-emerald-700',
            absent: 'bg-red-100 text-red-600',
            leave: 'bg-blue-100 text-blue-700',
            pass: 'bg-emerald-100 text-emerald-700',
            fail: 'bg-red-100 text-red-600',
            active: 'bg-emerald-100 text-emerald-700',
            inactive: 'bg-slate-100 text-slate-700',
          };
          return (
            <span className={cn('rounded-full px-2 py-1 text-xs font-medium capitalize', statusColors[value] || 'bg-slate-100')}>
              {value}
            </span>
          );
        }
        return value || '—';
      },
    }));
  }, [reportType]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || null,
      skip: 0, // Reset pagination on filter change
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportReport({
        report_type: reportType,
        format: 'excel',
        filters,
      });
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const recordCount = reportData?.data?.records?.length || 0;
  const totalRecords = reportData?.data?.total_records || 0;

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="text-xs text-muted-foreground border rounded p-2 bg-slate-50 space-y-1">
        <div>📊 Classes: {classesData?.data?.length || 0} loaded</div>
        <div>📚 Sections: {sections?.length || 0} loaded</div>
        <div>📝 Exams: {examsData?.data?.length || 0} loaded</div>
        <div>🔧 Report: {reportLoading ? '⏳ Loading...' : 'Ready'}</div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded p-1 hover:bg-accent">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{totalRecords} total records</p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || !reportData}
          variant="outline"
          className="gap-2"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export as Excel
        </Button>
      </div>

      {/* Filters */}
      <ReportFilters
        reportType={reportType}
        filters={filters}
        onFilterChange={handleFilterChange}
        options={{
          classes: Array.isArray(classesData?.data) ? classesData.data : [],
        }}
        loading={reportLoading}
        sections={sections || []}
        exams={Array.isArray(examsData?.data) ? examsData.data : examsData || []}
        onClassChange={(classId) => {
          console.log('📍 Class changed to:', classId);
        }}
      />

      {/* Summary Stats */}
      {reportData?.data?.summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(reportData.data.summary).map(([key, value]) => (
            <div key={key} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* DataTable */}
      <div className="rounded-lg border bg-card">
        {reportLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : recordCount === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <p>No data found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={reportData?.data?.records || []}
            pagination={{
              skip: filters.skip,
              limit: filters.limit,
              total: totalRecords,
              onSkipChange: (skip) => setFilters((prev) => ({ ...prev, skip })),
              onLimitChange: (limit) => setFilters((prev) => ({ ...prev, limit })),
            }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground">
        Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, totalRecords)} of {totalRecords} records
      </div>
    </div>
  );
}
