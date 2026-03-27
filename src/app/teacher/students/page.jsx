'use client';

import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import DataTable from '@/components/common/DataTable';
import { useTeacherStudents, useTeacherClasses } from '@/hooks/useTeacherPortal';
import useAuthStore from '@/store/authStore';

const ATTENDANCE_COLORS = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100    text-red-700',
  late: 'bg-amber-100  text-amber-700',
};

export default function TeacherStudentsPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  const { students, loading, search: searchStudents, filterByClass } = useTeacherStudents();
  const { classes } = useTeacherClasses();

  const [search, setSearch] = useState('');
  const [filterClass, setFilter] = useState('');

  const classNameById = useMemo(
    () => classes.reduce((acc, cls) => {
      acc[cls.class_id] = cls.class_name || cls.name;
      return acc;
    }, {}),
    [classes]
  );

  const filtered = useMemo(() => students.filter((s) => {
    const source = `${s.name || ''} ${s.registration_no || ''} ${s.roll_no || s.roll_number || ''}`.toLowerCase();
    const matchSearch = source.includes(search.toLowerCase());
    const selectedClassName = classNameById[filterClass];
    const studentClassId = s.class_id || s.details?.studentDetails?.class_id;
    const studentClassName = s.class || s.class_name || s.details?.studentDetails?.class_name;
    const matchClass = !filterClass || studentClassId === filterClass || studentClassName === selectedClassName;
    return matchSearch && matchClass;
  }), [students, search, filterClass, classNameById]);

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Student',
      accessorFn: (row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      cell: ({ row: { original: s }, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
            {(s.first_name?.[0] || s.name?.[0] || 'S')}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{getValue()}</p>
            <p className="text-xs text-slate-400">{s.gender || 'Student'}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'class',
      header: 'Class',
      accessorFn: (row) => row.class || row.class_name,
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
          {getValue() || '—'}
        </span>
      ),
    },
    {
      id: 'roll',
      header: 'Roll No',
      accessorFn: (row) => row.roll_no || row.roll_number || '—',
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-slate-700">{getValue()}</span>
      ),
    },
    {
      id: 'attendance',
      header: "Today's Attendance",
      accessorFn: (row) => row.attendance_today || (row.attendance_percentage >= 75 ? 'present' : 'absent'),
      cell: ({ getValue }) => {
        const val = getValue() || 'present';
        return (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${ATTENDANCE_COLORS[val] || 'bg-slate-100 text-slate-500'}`}>
            {val}
          </span>
        );
      },
    },
  ], []);

  const classFilterOptions = classes.map((cls) => ({ value: cls.class_id, label: cls.class_name || cls.name }));

  const onSearch = (value) => {
    setSearch(value);
    searchStudents(value);
  };

  const onFilterClass = (value) => {
    setFilter(value);
    filterByClass(value || null);
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto text-sm text-slate-500">Loading students...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> My {t.studentsLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{students.length} {t.studentsLabel.toLowerCase()} across {classes.length} {t.classesLabel.toLowerCase()}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <DataTable
          columns={columns}
          data={filtered}
          search={search}
          onSearch={onSearch}
          searchPlaceholder="Search students..."
          filters={classFilterOptions.length > 0 ? [
            { name: 'class', label: 'Class', value: filterClass, onChange: onFilterClass, options: classFilterOptions },
          ] : []}
          emptyMessage="No students found."
          enableColumnVisibility
        />
      </div>
    </div>
  );
}
