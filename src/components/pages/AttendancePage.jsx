'use client';
/**
 * AttendancePage — Adaptive for all institute types
 * School → Subject-wise | Coaching → Session-wise | etc.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, X, Minus } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_ATTENDANCE } from '@/data/dummyData';



const STATUS_COLORS = { present:'bg-emerald-100 text-emerald-700', absent:'bg-red-100 text-red-700', late:'bg-amber-100 text-amber-700' };
const STATUS_ICONS  = { present:<CheckSquare size={13} />, absent:<X size={13} />, late:<Minus size={13} /> };
const STATUS_OPTIONS = [{ value:'present', label:'Present' }, { value:'absent', label:'Absent' }, { value:'late', label:'Late' }];

export default function AttendancePage({ type }) {
  const canDo = useAuthStore((s) => s.canDo);
  const { terms, attendanceConfig } = useInstituteConfig();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter,   setDateFilter]   = useState(new Date().toISOString().slice(0,10));
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', type, page, pageSize, search, statusFilter, dateFilter],
    queryFn: async () => {
      try {
        const { attendanceService } = await import('@/services');
        return await attendanceService.getAll({ page, limit: pageSize, search, status: statusFilter, date: dateFilter });
      } catch {
        const d = DUMMY_ATTENDANCE.filter(a =>
          (!search || a.name.toLowerCase().includes(search.toLowerCase())) &&
          (!statusFilter || a.status === statusFilter)
        );
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows       = data?.data?.rows       ?? DUMMY_ATTENDANCE;
  const total      = data?.data?.total      ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const stats = useMemo(() => ({
    present: rows.filter(r => r.status === 'present').length,
    absent:  rows.filter(r => r.status === 'absent').length,
    late:    rows.filter(r => r.status === 'late').length,
    rate:    rows.length ? Math.round((rows.filter(r => r.status === 'present').length / rows.length) * 100) : 0,
  }), [rows]);

  const primaryUnitLabel = type === 'coaching' ? 'Batch' : type === 'coaching' ? 'Batch' : 'Class/Section';

  const columns = useMemo(() => [
    { accessorKey: 'roll', header: 'Roll No.' },
    {
      accessorKey: 'name', header: `${terms.student} Name`,
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    { accessorKey: 'class', header: primaryUnitLabel },
    { accessorKey: 'subject', header: attendanceConfig?.mode === 'session_wise' ? 'Session' : 'Subject' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-PK') },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue();
        return (
          <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit capitalize', STATUS_COLORS[s])}>
            {STATUS_ICONS[s]} {s}
          </span>
        );
      },
    },
  ], [terms, attendanceConfig, primaryUnitLabel]);

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" description={attendanceConfig?.label} />

      {/* Date picker */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3">
        <label className="text-sm font-medium">Date:</label>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard label="Attendance Rate" value={`${stats.rate}%`} icon={<CheckSquare size={18} />} trend={stats.rate >= 75 ? 1 : -1} description="today" />
        <StatsCard label="Present"         value={stats.present} icon={<CheckSquare size={18} />} />
        <StatsCard label="Absent"          value={stats.absent}  icon={<X size={18} />} />
        <StatsCard label="Late"            value={stats.late}    icon={<Minus size={18} />} />
      </div>

      <DataTable
        columns={columns} data={rows} loading={isLoading}
        emptyMessage="No attendance records"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:statusFilter, onChange:(v) => { setStatusFilter(v); setPage(1); }, options:STATUS_OPTIONS }]}
        action={canDo('attendance.create') ? <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><CheckSquare size={14} /> Mark Attendance</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'attendance' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />
    </div>
  );
}
