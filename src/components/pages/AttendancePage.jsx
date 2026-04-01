'use client';
/**
 * AttendancePage — Adaptive for all institute types
 * School → Subject-wise | Coaching → Session-wise | etc.
 */
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, X, Minus, QrCode, Search, Filter } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  studentAttendanceService,
  classService,
  academicYearService
} from '@/services';
import { SelectField, DatePickerField } from '@/components/common';
import { Button } from '@/components/ui/button';

const STATUS_COLORS = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  holiday: 'bg-slate-100 text-slate-700'
};

const STATUS_ICONS = {
  present: <CheckSquare size={13} />,
  absent: <X size={13} />,
  late: <Minus size={13} />,
  holiday: <Minus size={13} />
};

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'holiday', label: 'Holiday' }
];

export default function AttendancePage({ type }) {
  const canDo = useAuthStore((s) => s.canDo);
  const { terms, attendanceConfig } = useInstituteConfig();

  // Filters State
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    status: '',
    date: new Date().toISOString().slice(0, 10),
    search: ''
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicYearService.getAll({ is_active: true }),
  });

  // Fetch Classes
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getAll(),
  });

  // Extract Sections from selected class
  const sections = useMemo(() => {
    if (!filters.class_id || !classesData?.data) return [];
    const selectedClass = classesData.data.find(c => c.id === filters.class_id);
    return selectedClass?.sections || [];
  }, [filters.class_id, classesData]);

  // Main Attendance Query
  const { data: attendanceData, isLoading, refetch } = useQuery({
    queryKey: ['attendance', filters, page, pageSize],
    queryFn: () => studentAttendanceService.getAttendance({
      ...filters,
      page,
      limit: pageSize
    }),
  });

  const rows = attendanceData?.data || [];
  console.log('Attendance Data', rows);

  const pagination = attendanceData?.pagination || { total: 0, totalPages: 1 };

  const stats = useMemo(() => {
    if (!rows.length) return { present: 0, absent: 0, late: 0, rate: 0 };
    const p = rows.filter(r => r.status === 'present').length;
    const a = rows.filter(r => r.status === 'absent').length;
    const l = rows.filter(r => r.status === 'late').length;
    return {
      present: p,
      absent: a,
      late: l,
      rate: Math.round((p / rows.length) * 100)
    };
  }, [rows]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Refetch data when filters change
  const columns = useMemo(() => [
    {
      accessorKey: 'student.registration_no',
      header: 'Reg No.',
      cell: ({ row }) => {
        const student = row.original.Student;
        return (
          <span className="font-medium">
            {student?.registration_no || ''}
          </span>
        );
      },
    },
    {
      accessorKey: 'student.full_name',
      header: `${terms.student} Name`,
      cell: ({ row }) => {
        const student = row.original.Student;
        return (
          <span className="font-medium">
            {student?.first_name || ''} {student?.last_name || ''}
          </span>
        );
      },
    },
    {
      accessorKey: 'class.name',
      header: 'Class/Section',
      cell: ({ row }) => {
        const classData = row.original.Class;
        const sectionData = row.original.Section;
        return `${classData?.name || ''} - ${sectionData?.name || ''}`;
      }
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString('en-PK') : 'N/A';
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue();
        if (!s) return <span className="text-slate-400">N/A</span>;
        return (
          <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit capitalize', STATUS_COLORS[s])}>
            {STATUS_ICONS[s]} {s}
          </span>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Marking Type',
      cell: ({ getValue }) => {
        const type = getValue();
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {type || 'Manual'}
          </span>
        );
      }
    }
  ], [terms]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Attendance"
        description="Track and manage student daily attendance"
        action={
          <div className="flex gap-2">
            <Link href={`/${type}/attendance/scan`}>
              {/* <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"> */}
              <Button variant="emerald">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Attendance
              </Button>
            </Link>
            {canDo('attendance.create') && (
              <Link href={`/${type}/attendance/mark`}>
                <Button>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Bulk Mark
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <DatePickerField
          label="Attendance Date"
          value={filters.date}
          onChange={(val) => handleFilterChange('date', val)}
        />

        <SelectField
          label="Academic Year"
          options={yearsData?.data?.map(y => ({ value: y.id, label: y.name })) || []}
          value={filters.academic_year_id}
          onChange={(val) => handleFilterChange('academic_year_id', val)}
          placeholder="Select Year"
        />

        <SelectField
          label="Class"
          options={classesData?.data?.map(c => ({ value: c.id, label: c.name })) || []}
          value={filters.class_id}
          onChange={(val) => handleFilterChange('class_id', val)}
          placeholder="All Classes"
        />

        <SelectField
          label="Section"
          options={sections.map(s => ({ value: s.id, label: s.name })) || []}
          value={filters.section_id}
          onChange={(val) => handleFilterChange('section_id', val)}
          placeholder="All Sections"
          disabled={!filters.class_id}
        />

        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(val) => handleFilterChange('status', val)}
          placeholder="All Status"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard label="Attendance Rate" value={`${stats.rate}%`} icon={<CheckSquare size={18} />} trend={stats.rate >= 75 ? 1 : -1} description="Based on current list" />
        <StatsCard label="Present" value={stats.present} icon={<CheckSquare size={18} />} color="emerald" />
        <StatsCard label="Absent" value={stats.absent} icon={<X size={18} />} color="red" />
        <StatsCard label="Late" value={stats.late} icon={<Minus size={18} />} color="amber" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage="No attendance records found for selected filters"
        search={filters.search}
        onSearch={(v) => handleFilterChange('search', v)}
        searchPlaceholder="Search student name or reg no..."
        enableColumnVisibility
        exportConfig={{ fileName: `attendance_${filters.date}` }}
        pagination={{
          page,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
          total: pagination.total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); }
        }}
      />
    </div>
  );
}
