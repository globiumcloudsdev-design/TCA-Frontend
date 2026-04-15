//src/components/attendance/AttendanceReport.jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users,
  Calendar,
  Search,
  Download,
  Filter,
  CalendarCheck,
  CalendarX,
  Clock,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  BarChart3,
  Printer,
  MoreVertical
} from 'lucide-react';
import { studentAttendanceService } from '@/services/studentAttendanceService';
import { classService } from '@/services/classService';
import { studentService } from '@/services/studentService';
import { academicYearService } from '@/services/academicYearService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SelectField from '@/components/common/SelectField';
import DataTable from '@/components/common/DataTable';
import TableRowActions from '@/components/common/TableRowActions';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-colors group-hover:scale-110 duration-300`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{trendValue ? 'Sessions' : 'Days'}</span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden" />
        ))}
        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
          +4
        </div>
      </div>
      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const AttendanceReport = ({ terms = {} }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const [reportType, setReportType] = useState('class');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [minAttendance, setMinAttendance] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for dynamic month options based on selected academic year
  const [monthOptions, setMonthOptions] = useState([]);

  // Helper: Generate months between two dates (inclusive of start month, exclusive of end month? Actually up to end date)
  const generateMonthsBetween = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1; // 1-12
      months.push({
        value: `${year}-${month}`, // Store as "YYYY-M"
        label: current.toLocaleString('default', { month: 'long', year: 'numeric' }),
        year,
        month
      });
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  // React Hook Form
  const { control, watch, setValue, getValues } = useForm({
    defaultValues: {
      class: 'all',
      section: 'all',
      academicYear: '',
      month: '', // will be set after academic year loads
      status: 'all',
      studentId: 'all',
      search: ''
    }
  });

  const formValues = watch();
  const { class: classId, section, academicYear, month, status, studentId, search } = formValues;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Academic Years
  useEffect(() => {
    if (!isMounted) return;
    const fetchYears = async () => {
      try {
        const res = await academicYearService.getOptions(user?.school_id);
        const years = res.data || [];
        setAcademicYears(years);

        // Auto-select current academic year
        const currentYear = years.find(y => y.is_current);
        if (currentYear) {
          setValue('academicYear', currentYear.value);
        } else if (years.length > 0) {
          setValue('academicYear', years[0].value);
        }
      } catch (err) {
        console.error('Failed to fetch years:', err);
      }
    };
    fetchYears();
  }, [user?.school_id, isMounted, setValue]);

  // When academic year changes, generate month options and set default month
  useEffect(() => {
    if (!academicYear || academicYear === 'all' || academicYears.length === 0) return;

    const selectedYearObj = academicYears.find(y => y.value === academicYear);
    if (!selectedYearObj) return;

    const { start_date, end_date } = selectedYearObj;
    const months = generateMonthsBetween(start_date, end_date);
    setMonthOptions(months);

    if (months.length === 0) return;

    // Determine current date
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const currentMonthExists = months.some(m => m.value === currentYearMonth);

    if (currentMonthExists) {
      setValue('month', currentYearMonth);
    } else {
      // Select first month of academic year
      setValue('month', months[0].value);
    }
  }, [academicYear, academicYears, setValue]);

  // Fetch Classes
  useEffect(() => {
    if (!isMounted) return;
    const fetchClasses = async () => {
      try {
        const res = await classService.getAll({ school_id: user?.school_id });
        setClasses(res.data || res || []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    fetchClasses();
  }, [user?.school_id, isMounted]);

  // Derived Sections from selected class
  const sectionsList = useMemo(() => {
    if (!classId || classId === 'all') return [];
    const selectedClass = classes.find(c => String(c.id) === String(classId));
    return selectedClass?.sections || selectedClass?.Sections || [];
  }, [classId, classes]);

  // Fetch Students for selected class
  useEffect(() => {
    if (isMounted && reportType === 'student' && classId !== 'all') {
      const fetchStudents = async () => {
        try {
          const res = await studentService.getAll({
            class_id: classId,
            section_id: section === 'all' ? undefined : section
          });
          const studentData = res.data || res;
          setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (err) {
          console.error('Failed to fetch students:', err);
          setStudents([]);
        }
      };
      fetchStudents();
    }
  }, [reportType, classId, section, isMounted]);

  // Generate Report
  const handleGenerateReport = async () => {
    if (!classId || classId === 'all') {
      toast.error('Please select a class first');
      return;
    }
    if (!month) {
      toast.error('Please select a month');
      return;
    }

    setLoading(true);
    try {
      const [year, monthNum] = month.split('-');
      const params = {
        school_id: user?.school_id,
        academic_year_id: academicYear === 'all' ? undefined : academicYear,
        class_id: classId === 'all' ? undefined : classId,
        section_id: section === 'all' ? undefined : section,
        student_id: studentId === 'all' ? undefined : studentId,
        month: parseInt(monthNum),
        year: parseInt(year),
      };

      const res = await studentAttendanceService.getAttendanceReport(params);
      const resData = res?.data || res;

      // ✅ Check for ANY valid data
      const hasValidData =
        (resData?.student_wise && resData.student_wise.length > 0) ||  // class report with students
        resData?.class_summary ||                                      // class summary
        resData?.student;                                              // individual student report

      if (!hasValidData) {
        toast.error('No records found for the selected filters');
        setReportData(null);
      } else {
        setReportData(resData);
        toast.success('Report generated successfully');
      }
    } catch (err) {
      console.error('Report error:', err);
      toast.error(err.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData || allFilteredRows.length === 0) {
      toast.error('No report data to export');
      return;
    }

    const doc = new jsPDF();
    const primaryColor = [79, 70, 229];
    const secondaryColor = [71, 85, 105];

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('THE CLOUDS ACADEMY', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const reportTitle = reportType === 'class' ? 'Class Attendance Report' : 'Individual Performance Report';
    doc.text(reportTitle, 105, 30, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const selectedClass = classes.find(c => c.id === classId)?.name || 'N/A';
    const selectedSection = sectionsList.find(s => s.id === section)?.name || 'All Sections';
    const selectedMonthObj = monthOptions.find(m => m.value === month);
    const monthDisplay = selectedMonthObj?.label || month;

    doc.text(`Class: ${selectedClass}`, 20, 45);
    doc.text(`Section: ${selectedSection}`, 20, 50);
    doc.text(`Report Period: ${monthDisplay}`, 140, 45);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 140, 50);

    if (stats?.isClass) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 58, 170, 15, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Overall Attendance: ${stats.overallPercentage}%`, 40, 67);
      doc.text(`Working Days: ${stats.workingDays}`, 120, 67);
    }

    const tableData = allFilteredRows.map(item => {
      const student = item.student || item.Student || item;
      const percentage = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
      return [
        `${student?.first_name} ${student?.last_name}`,
        student?.registration_no || 'N/A',
        `${percentage}%`,
        item.present || 0,
        item.absent || 0,
        item.leave || 0,
        percentage >= 75 ? 'Satisfactory' : 'Low'
      ];
    });

    autoTable(doc, {
      startY: stats?.isClass ? 80 : 60,
      head: [['Student Name', 'Reg No.', 'Attendance %', 'P', 'A', 'L', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { halign: 'center' },
        2: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('© The Clouds Academy Management System', 105, 290, { align: 'center' });
    }

    doc.save(`Attendance_Report_${selectedClass}_${monthDisplay.replace(/ /g, '_')}.pdf`);
    toast.success('PDF Report downloaded successfully');
  };

  const displayData = useMemo(() => {
    if (!reportData) return [];
    const payload = reportData.data || reportData;
    if (payload.student_wise) return payload.student_wise;
    if (Array.isArray(payload)) return payload;
    if (payload.student) return [payload];
    return [];
  }, [reportData]);

  const stats = useMemo(() => {
    if (!reportData) return null;
    const payload = reportData.data || reportData;

    if (payload.student && !payload.student_wise) {
      return {
        present: payload.present,
        absent: payload.absent,
        late: payload.late,
        leave: payload.leave,
        percentage: payload.presentPercentage
      };
    }

    if (payload.class_summary) {
      return {
        isClass: true,
        enrolled: payload.class_summary.total_students_enrolled,
        workingDays: payload.class_summary.working_days,
        overallPercentage: payload.class_summary.overall_present_percentage
      };
    }

    return null;
  }, [reportData]);

  const columns = useMemo(() => [
    {
      accessorKey: 'student_info',
      header: 'Student Info',
      cell: ({ row }) => {
        const item = row.original;
        const student = item.student || item.Student || item;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
              {student?.first_name?.[0]}{student?.last_name?.[0]}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {student?.first_name} {student?.last_name}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                  Roll: {student?.roll_no || student?.roll_number || student?.details?.studentDetails?.roll_no || '—'}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  Reg: {student?.registration_no || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'attendance_percentage',
      header: 'Attendance %',
      cell: ({ row }) => {
        const item = row.original;
        const percentage = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
        return (
          <div className="flex flex-col items-center gap-1.5">
            <span className={`text-sm font-bold ${percentage >= 90 ? 'text-emerald-600' : percentage >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
              {percentage}%
            </span>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'present',
      header: 'Present',
      cell: ({ row }) => row.original.present || 0
    },
    {
      accessorKey: 'absent',
      header: 'Absent',
      cell: ({ row }) => row.original.absent || 0
    },
    {
      accessorKey: 'leave',
      header: 'Leave',
      cell: ({ row }) => row.original.leave || 0
    },
    {
      accessorKey: 'late',
      header: 'Late',
      cell: ({ row }) => row.original.late || 0
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original;
        const percentage = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
        const isLow = percentage < 75;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isLow ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
            }`}>
            {isLow ? 'Low' : 'Satisfactory'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <TableRowActions
          onView={() => toast.info('View student details')}
          onEdit={() => toast.info('Edit attendance record')}
        />
      )
    }
  ], []);

  const allFilteredRows = useMemo(() => {
    return displayData.filter(item => {
      const student = item.student || item.Student || item;
      const first = student?.first_name || '';
      const last = student?.last_name || '';
      const reg = student?.registration_no || '';

      const studentName = `${first} ${last}`.toLowerCase();
      const matchesSearch = studentName.includes(search.toLowerCase()) ||
        reg.toLowerCase().includes(search.toLowerCase());

      const attendance = parseFloat(item.presentPercentage || item.attendance_percentage || 0);
      const matchesAttendance = attendance >= minAttendance;

      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'low' && attendance < 75) ||
        (selectedStatus === 'satisfactory' && attendance >= 75);

      return matchesSearch && matchesAttendance && matchesStatus;
    });
  }, [displayData, search, minAttendance, selectedStatus]);

  const filteredRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allFilteredRows.slice(startIndex, endIndex);
  }, [allFilteredRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, minAttendance, selectedStatus]);

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Report Type Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            onClick={() => setReportType('class')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${reportType === 'class' ? 'bg-white dark:bg-slate-800 text-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Users className="w-4 h-4" />
            Class Report
          </button>
          <button
            onClick={() => setReportType('student')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${reportType === 'student' ? 'bg-white dark:bg-slate-800 text-primary shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Search className="w-4 h-4" />
            Student Report
          </button>
        </div>
      </div>

      {/* Top Filter Section */}
      <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportType === 'class' ? (
            <>
              <SelectField
                label={`Select ${terms.class || 'Class'}`}
                name="class"
                control={control}
                value={classId}
                options={[
                  { value: 'all', label: 'All Classes' },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
                placeholder="Choose a class"
              />
              <SelectField
                label="Select Section"
                name="section"
                control={control}
                value={section}
                options={[
                  { value: 'all', label: 'All Sections' },
                  ...sectionsList.map(s => ({ value: s.id, label: s.name }))
                ]}
                placeholder="Choose a section"
              />
            </>
          ) : (
            <>
              <SelectField
                label="Select Class"
                name="class"
                control={control}
                value={classId}
                options={[
                  { value: 'all', label: 'Select Class' },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
                placeholder="Choose a class"
              />
              <SelectField
                label="Select Section"
                name="section"
                control={control}
                value={section}
                options={[
                  { value: 'all', label: 'All Sections' },
                  ...sectionsList.map(s => ({ value: s.id, label: s.name }))
                ]}
                placeholder="Choose a section"
              />
              <SelectField
                label="Select Student"
                name="studentId"
                control={control}
                value={studentId}
                options={[
                  { value: 'all', label: 'Choose a Student' },
                  ...students.map(st => ({ value: st.id, label: `${st.first_name} ${st.last_name} (${st.registration_no || 'No Reg'})` }))
                ]}
                placeholder="Pick a student"
              />
            </>
          )}

          <SelectField
            label="Academic Year"
            name="academicYear"
            control={control}
            value={academicYear}
            options={academicYears.map(y => ({ value: y.value, label: y.label }))}
            placeholder="Choose year"
          />

          <SelectField
            label="Select Month"
            name="month"
            control={control}
            value={month}
            options={monthOptions.map(m => ({ value: m.value, label: m.label }))}
            placeholder="Select month"
            disabled={monthOptions.length === 0}
          />
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Report Management Engine 2.0</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Results
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters - only when data exists */}
      {reportData && (
        <div className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 p-1 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none animate-in fade-in zoom-in duration-700">
          <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[2.2rem] p-6 lg:px-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Performance Filter</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Segregate by Attendance Bracket</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'all', label: 'All Records', icon: Users },
                  { id: 'low', label: 'Low Performance', sub: '< 75%', icon: CalendarX },
                  { id: 'satisfactory', label: 'Satisfactory', sub: '≥ 75%', icon: ShieldCheck }
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = selectedStatus === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStatus(s.id)}
                      className={`relative flex flex-col items-start px-5 py-3 rounded-2xl transition-all duration-300 group ${isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 -translate-y-1'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="text-sm font-black tracking-tight">{s.label}</span>
                      </div>
                      {s.sub && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${isActive ? 'text-primary-foreground/80' : 'text-slate-500'}`}>
                          {s.sub}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-foreground rounded-full shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="w-full md:w-[320px] bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-tighter">Min. Threshold</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-primary">{minAttendance}</span>
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary-hover focus:outline-none transition-all"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400">0%</span>
                  <span className="text-[10px] font-bold text-slate-400">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.isClass ? (
          <>
            <StatCard title="Students Enrolled" value={stats.enrolled} icon={Users} color="bg-primary" />
            <StatCard title="Working Days" value={stats.workingDays} icon={Calendar} color="bg-emerald-500" />
            <StatCard title="Overall Attendance" value={`${stats.overallPercentage}%`} icon={CalendarCheck} color="bg-emerald-500" trend="up" trendValue="Target 90%" />
            <StatCard title="On Leave" value="09" icon={UserPlus} color="bg-blue-500" />
          </>
        ) : stats ? (
          <>
            <StatCard title="Present Days" value={stats.present} icon={CalendarCheck} color="bg-emerald-500" trend="up" trendValue={`${stats.percentage}%`} />
            <StatCard title="Absent Days" value={stats.absent} icon={CalendarX} color="bg-rose-500" />
            <StatCard title="Late Arrivals" value={stats.late} icon={Clock} color="bg-amber-500" />
            <StatCard title="On Leave" value={stats.leave} icon={UserPlus} color="bg-blue-500" />
          </>
        ) : (
          <div className="lg:col-span-4 p-8 text-center bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500">Please select filters and generate a report to see statistics</p>
          </div>
        )}
      </div>

      {/* DataTable with bottom margin */}
      <div className="mb-8">
        <DataTable
          columns={columns}
          data={filteredRows}
          loading={loading}
          search={search}
          onSearch={(val) => setValue('search', val)}
          searchPlaceholder="Search by student name or registration number..."
          emptyMessage="No attendance records found. Generate a report to see results."
          pagination={{
            page,
            pageSize,
            totalPages: Math.ceil(allFilteredRows.length / pageSize),
            onPageChange: setPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setPage(1);
            },
            total: allFilteredRows.length
          }}
        />
      </div>
    </div>
  );
};

export default AttendanceReport;