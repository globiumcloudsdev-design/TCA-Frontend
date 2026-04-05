// 'use client';

// import { useMemo, useState } from 'react';
// import { Users } from 'lucide-react';
// import { getPortalTerms } from '@/constants/portalInstituteConfig';
// import DataTable from '@/components/common/DataTable';
// import { useTeacherStudents, useTeacherClasses } from '@/hooks/useTeacherPortal';
// import useAuthStore from '@/store/authStore';

// const ATTENDANCE_COLORS = {
//   present: 'bg-emerald-100 text-emerald-700',
//   absent: 'bg-red-100    text-red-700',
//   late: 'bg-amber-100  text-amber-700',
// };

// export default function TeacherStudentsPage() {
//   const user = useAuthStore((state) => state.user);
//   const t = getPortalTerms(user?.institute_type || 'school');
//   const { students, loading, search: searchStudents, filterByClass } = useTeacherStudents();
//   const { classes } = useTeacherClasses();

//   const [search, setSearch] = useState('');
//   const [filterClass, setFilter] = useState('');

//   const classNameById = useMemo(
//     () => classes.reduce((acc, cls) => {
//       acc[cls.class_id] = cls.class_name || cls.name;
//       return acc;
//     }, {}),
//     [classes]
//   );

//   const filtered = useMemo(() => students.filter((s) => {
//     const source = `${s.name || ''} ${s.registration_no || ''} ${s.roll_no || s.roll_number || ''}`.toLowerCase();
//     const matchSearch = source.includes(search.toLowerCase());
//     const selectedClassName = classNameById[filterClass];
//     const studentClassId = s.class_id || s.details?.studentDetails?.class_id;
//     const studentClassName = s.class || s.class_name || s.details?.studentDetails?.class_name;
//     const matchClass = !filterClass || studentClassId === filterClass || studentClassName === selectedClassName;
//     return matchSearch && matchClass;
//   }), [students, search, filterClass, classNameById]);

//   const columns = useMemo(() => [
//     {
//       id: 'name',
//       header: 'Student',
//       accessorFn: (row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
//       cell: ({ row: { original: s }, getValue }) => (
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
//             {(s.first_name?.[0] || s.name?.[0] || 'S')}
//           </div>
//           <div>
//             <p className="text-sm font-bold text-slate-800">{getValue()}</p>
//             <p className="text-xs text-slate-400">{s.gender || 'Student'}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       id: 'class',
//       header: 'Class',
//       accessorFn: (row) => row.class || row.class_name,
//       cell: ({ getValue }) => (
//         <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
//           {getValue() || '—'}
//         </span>
//       ),
//     },
//     {
//       id: 'roll',
//       header: 'Roll No',
//       accessorFn: (row) => row.roll_no || row.roll_number || '—',
//       cell: ({ getValue }) => (
//         <span className="text-sm font-semibold text-slate-700">{getValue()}</span>
//       ),
//     },
//     {
//       id: 'attendance',
//       header: "Today's Attendance",
//       accessorFn: (row) => row.attendance_today || (row.attendance_percentage >= 75 ? 'present' : 'absent'),
//       cell: ({ getValue }) => {
//         const val = getValue() || 'present';
//         return (
//           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${ATTENDANCE_COLORS[val] || 'bg-slate-100 text-slate-500'}`}>
//             {val}
//           </span>
//         );
//       },
//     },
//   ], []);

//   const classFilterOptions = classes.map((cls) => ({ value: cls.class_id, label: cls.class_name || cls.name }));

//   const onSearch = (value) => {
//     setSearch(value);
//     searchStudents(value);
//   };

//   const onFilterClass = (value) => {
//     setFilter(value);
//     filterByClass(value || null);
//   };

//   if (loading) {
//     return <div className="max-w-5xl mx-auto text-sm text-slate-500">Loading students...</div>;
//   }

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
//           <Users className="w-6 h-6 text-blue-600" /> My {t.studentsLabel}
//         </h1>
//         <p className="text-sm text-slate-500 mt-1">{students.length} {t.studentsLabel.toLowerCase()} across {classes.length} {t.classesLabel.toLowerCase()}</p>
//       </div>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//         <DataTable
//           columns={columns}
//           data={filtered}
//           search={search}
//           onSearch={onSearch}
//           searchPlaceholder="Search students..."
//           filters={classFilterOptions.length > 0 ? [
//             { name: 'class', label: 'Class', value: filterClass, onChange: onFilterClass, options: classFilterOptions },
//           ] : []}
//           emptyMessage="No students found."
//           enableColumnVisibility
//         />
//       </div>
//     </div>
//   );
// }






'use client';

import { useMemo, useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import DataTable from '@/components/common/DataTable';
import StatsCard from '@/components/common/StatsCard';
import SelectField from '@/components/common/SelectField';
import { useForm } from 'react-hook-form';
import { useTeacherStudents, useTeacherClasses } from '@/hooks/useTeacherPortal';
import useAuthStore from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ATTENDANCE_COLORS = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
};

export default function TeacherStudentsPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  
  // Form for filters
  const { control, watch, setValue, reset } = useForm({
    defaultValues: {
      class_id: '',
      section_id: '',
    }
  });

  const selectedClassId = watch('class_id');
  const selectedSectionId = watch('section_id');

  // Fetch teacher's classes
  const { 
    classes, 
    loading: classesLoading, 
    refetch: refetchClasses 
  } = useTeacherClasses();

  // Fetch students based on selected class & section
  const {
    students,
    loading: studentsLoading,
    pagination,
    fetchStudents,
    refetch: refetchStudents,
    attendanceSummary
  } = useTeacherStudents();

  // Get sections for selected class
  const sectionsForSelectedClass = useMemo(() => {
    if (!selectedClassId || !classes.length) return [];
    const selectedClass = classes.find(c => c.class_id === selectedClassId || c.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classes]);

  // Fetch students when class/section changes
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents({
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        page: 1
      });
    }
  }, [selectedClassId, selectedSectionId, fetchStudents]);

  // Handle class change - reset section
  const handleClassChange = (value) => {
    setValue('class_id', value);
    setValue('section_id', '');
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedClassId) {
      fetchStudents({
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        page: pagination?.page || 1
      });
    }
    refetchClasses();
  };

  // Class filter options
  const classOptions = classes.map(cls => ({
    value: cls.class_id || cls.id,
    label: cls.class_name || cls.name,
    badgeStatus: cls.is_active ? 'active' : 'inactive'
  }));

  // Section filter options
  const sectionOptions = sectionsForSelectedClass.map(section => ({
    value: section.section_id || section.id,
    label: section.section_name || section.name
  }));

  // Table columns
  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Student',
      accessorFn: (row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      cell: ({ row: { original: s }, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
            {(s.first_name?.[0] || s.name?.[0] || 'S').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{getValue()}</p>
            <p className="text-xs text-muted-foreground">#{s.registration_no || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'roll_no',
      header: 'Roll No',
      accessorFn: (row) => row.roll_no || row.roll_number || '—',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {getValue()}
        </Badge>
      ),
    },
    {
      id: 'class_section',
      header: 'Class & Section',
      accessorFn: (row) => `${row.class_name || ''} ${row.section_name ? `- ${row.section_name}` : ''}`,
      cell: ({ getValue }) => {
        const val = getValue();
        return val ? (
          <span className="text-xs text-muted-foreground">{val}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'attendance',
      header: "Today's Attendance",
      accessorFn: (row) => row.attendance_today || (row.attendance_percentage >= 75 ? 'present' : 'absent'),
      cell: ({ getValue }) => {
        const val = getValue() || 'present';
        const colors = ATTENDANCE_COLORS[val] || 'bg-slate-100 text-slate-500';
        const labels = { present: 'Present', absent: 'Absent', late: 'Late' };
        return (
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${colors}`}>
            {labels[val] || val}
          </span>
        );
      },
    },
    {
      id: 'attendance_percentage',
      header: 'Attendance %',
      accessorFn: (row) => row.attendance_percentage || 0,
      cell: ({ getValue }) => {
        const percentage = getValue();
        let colorClass = 'text-red-600';
        if (percentage >= 75) colorClass = 'text-emerald-600';
        else if (percentage >= 60) colorClass = 'text-amber-600';
        
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${colorClass}`}>
              {percentage}%
            </span>
            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ], []);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchStudents({
      class_id: selectedClassId,
      section_id: selectedSectionId || undefined,
      page: newPage,
      limit: pagination?.limit || 10
    });
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    fetchStudents({
      class_id: selectedClassId,
      section_id: selectedSectionId || undefined,
      page: 1,
      limit: newSize
    });
  };

  // Loading state
  if (classesLoading && !classes.length) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            My {t.studentsLabel}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your students' performance and attendance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={studentsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${studentsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Students"
          value={pagination?.total || 0}
          icon={<Users size={20} />}
          loading={studentsLoading}
          description={selectedClassId ? "In selected class" : "Select a class"}
        />
        <StatsCard
          label="Classes Teaching"
          value={classes.length}
          icon={<GraduationCap size={20} />}
          loading={classesLoading}
        />
        <StatsCard
          label="Present Today"
          value={attendanceSummary?.present || 0}
          icon={<BookOpen size={20} />}
          loading={studentsLoading}
          trend={attendanceSummary?.present_percentage}
        />
        <StatsCard
          label="Avg Attendance"
          value={`${attendanceSummary?.average_percentage || 0}%`}
          icon={<Calendar size={20} />}
          loading={studentsLoading}
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Select Class"
              name="class_id"
              control={control}
              options={classOptions}
              placeholder="Choose a class"
              required
            />
            
            {selectedClassId && sectionsForSelectedClass.length > 0 && (
              <SelectField
                label="Select Section"
                name="section_id"
                control={control}
                options={[
                  { value: 'all', label: 'All Sections' },
                  ...sectionOptions
                ]}
                placeholder="Choose section"
              />
            )}
          </div>

          {classes.length === 0 && !classesLoading && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                No classes assigned to you yet. Please contact administrator to assign classes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={students}
            loading={studentsLoading}
            emptyMessage={selectedClassId ? "No students found in this class" : "Please select a class to view students"}
            pagination={selectedClassId && pagination ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
              pageSize: pagination.limit,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange
            } : null}
            enableColumnVisibility
          />
        </CardContent>
      </Card>
    </div>
  );
}