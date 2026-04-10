'use client';

import { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, Save, Users } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useTeacherAttendance, useTeacherClasses, useTeacherStudents } from '@/hooks/useTeacherPortal';
import { SelectField, DatePickerField } from '@/components/common';
import QRScanner from '@/components/attendance/QRScanner';
import useAuthStore from '@/store/authStore';

const STATUS_OPTIONS = [
  { value: 'present', label: 'P', icon: CheckCircle2, color: 'text-white bg-emerald-500 hover:bg-emerald-600 border-emerald-500' },
  { value: 'absent',  label: 'A', icon: XCircle,      color: 'text-white bg-red-500    hover:bg-red-600    border-red-500' },
  { value: 'late',    label: 'L', icon: Clock,         color: 'text-white bg-amber-500  hover:bg-amber-600  border-amber-500' },
];

const UNSET_BTN = 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50';

export default function TeacherAttendancePage() {
const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
    const { classes, loading: classesLoading } = useTeacherClasses();
  const { students, fetchStudents, clearStudents, loading: studentsLoading } = useTeacherStudents();
  const { markAttendance, getClassAttendance } = useTeacherAttendance();
  const today      = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    class_id: '',
    section_id: '',
    date: today
  });

  const [attendance, setAttendance] = useState({});
  const [mode, setMode] = useState('manual');

  const [saved, setSaved] = useState(false);

  const handleFilterChange = (name, value) => {
    setSaved(false);
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'class_id') {
        next.section_id = '';
      }
      return next;
    });
  };


  useEffect(() => {
    if (!filters.class_id || !filters.section_id) {
      clearStudents();
      setAttendance({});
      return;
    }

    const loadAll = async () => {
      setSaved(false);

      // 1. Fetch students
      fetchStudents({
        class_id: filters.class_id,
        section_id: filters.section_id,
        page: 1
      });

      // 2. Fetch existing attendance records for this class+section+date
      try {
        const res = await getClassAttendance(filters.class_id, filters.date, filters.section_id);

        // Handle both array and { data: [] } response shapes
        const recordList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.message?.data)
              ? res.message.data
              : [];

        console.log('[Attendance] Existing records:', recordList);

        const next = {};
        recordList.forEach((row) => {
          // Backend returns student_id directly or nested in Student object
          const sid = row.student_id || row.Student?.id;
          if (sid && row.status) {
            next[sid] = row.status;
          }
        });
        setAttendance(next);
      } catch {
        // If attendance fetch fails (e.g. no records yet), just clear
        setAttendance({});
      }
    };

    loadAll();
  }, [filters.class_id, filters.section_id, filters.date, fetchStudents, clearStudents, getClassAttendance]);

  const setStatus = (studentId, status) => {
    if (saved) return;
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status,
    }));
  };

  const selectedClass = classes.find((c) => c.class_id === filters.class_id);
  const sections = selectedClass?.sections || [];
  const selectedSection = sections.find((s) => (s.id || s.section_id) === filters.section_id);
  const selectedSectionName = selectedSection?.name || selectedSection?.section_name || '';

  // Frontend-side section filter (safety net in case backend doesn't filter by section_id)
  const displayStudents = filters.section_id
    ? students.filter((s) => {
        const studentSectionId = s.section_id || s.details?.section_id || s.section?.id;
        const studentSectionName = s.section || s.section_name || s.details?.section_name || '';
        if (studentSectionId) return studentSectionId === filters.section_id;
        if (selectedSectionName && studentSectionName) {
          return studentSectionName.trim().toLowerCase() === selectedSectionName.trim().toLowerCase();
        }
        return true;
      })
    : students;

  const handleSave = async () => {
    // Use displayStudents (filtered by section) for save
    const toSave = displayStudents;
    const unmarked = toSave.filter((s, i) => !attendance[s.id || `s-${i}`]);
    if (unmarked.length > 0) {
      toast.warning(`${unmarked.length} student(s) still not marked. Please mark all students.`);
      return;
    }
    try {
      await markAttendance({
        class_id: filters.class_id,
        section_id: filters.section_id,
        date: filters.date,
        attendance: toSave.map((s, i) => ({
          student_id: s.id || `s-${i}`,
          status: attendance[s.id || `s-${i}`]
        }))
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount  = Object.values(attendance).filter((v) => v === 'absent').length;
  const lateCount    = Object.values(attendance).filter((v) => v === 'late').length;
  const unmarked     = displayStudents.length - Object.values(attendance).filter(Boolean).length;

  // sections and selectedSectionName already computed above

  if (classesLoading) {
    return <div className="max-w-3xl mx-auto text-sm text-slate-500">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" /> Mark {t.attendanceLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Date: {filters.date}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('scan')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'scan' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Scan Attendance
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            Manual Attendance
          </button>
        </div>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Attendance Saved!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Attendance for {filters.date} has been recorded successfully.</p>
          </div>
        </div>
      )}

      {mode === 'scan' ? (
        <div className="space-y-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Scan Attendance</h2>
              <p className="text-sm text-slate-500 mt-1">Use the QR Scanner to mark attendance instantly, just like the school admin flow.</p>
            </div>
            <Badge className="uppercase text-[10px] tracking-[0.18em]">Scan Mode</Badge>
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 p-2">
            <QRScanner bulkMode={false} instituteId={user?.institute_id} type={user?.institute_type || 'school'} />
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manual Attendance</h2>
                <p className="text-sm text-slate-500 mt-1">Filter class, section, and attendance date before marking manually.</p>
              </div>
              <Badge className="uppercase text-[10px] tracking-[0.18em]">Manual Mode</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DatePickerField
                label="Date"
                value={filters.date}
                onChange={(value) => handleFilterChange('date', value)}
                disableFutureDates
              />

              <SelectField
                label={t.class || 'Class'}
                options={classes.map((cls) => ({ value: cls.class_id, label: cls.class_name }))}
                value={filters.class_id}
                onChange={(value) => handleFilterChange('class_id', value)}
                placeholder="Select Class"
              />

              <SelectField
                label={t.section || 'Section'}
                options={sections.map((section) => ({ value: section.id || section.section_id, label: section.name || section.section_name }))}
                value={filters.section_id}
                onChange={(value) => handleFilterChange('section_id', value)}
                placeholder="All Sections"
                disabled={!filters.class_id}
              />
            </div>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Present', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Absent',  value: absentCount,  color: 'text-red-600',    bg: 'bg-red-50' },
              { label: 'Late',    value: lateCount,    color: 'text-amber-600',  bg: 'bg-amber-50' },
              { label: 'Unmarked',value: unmarked,     color: 'text-slate-500',  bg: 'bg-slate-100' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-white`}>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Legend:</span>
            {STATUS_OPTIONS.map((opt) => (
              <span key={opt.value} className={`text-xs px-2 py-0.5 rounded-lg font-bold ${opt.color}`}>
                {opt.label} = {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
              </span>
            ))}
          </div>

          {/* Student list */}
          {studentsLoading ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Loading Students...</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please wait while we fetch the students for this section.</p>
            </div>
          ) : !filters.class_id ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No {t.class || 'Class'} Selected</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please select a {t.class || 'class'} from the filters above to view student attendance.</p>
            </div>
          ) : !filters.section_id ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No {t.section || 'Section'} Selected</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please select a {t.section || 'section'} from the filters above to view student attendance.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No Students Found</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">No students found in the selected {t.class || 'class'} and {t.section || 'section'}.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {t.studentsLabel} — {selectedClass?.class_name}
                    {selectedSectionName && <span className="ml-1 text-blue-600">· Section {selectedSectionName}</span>}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{displayStudents.length} student{displayStudents.length !== 1 ? 's' : ''} in this section</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.studentsLabel}</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Roll No</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Section</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayStudents.map((s, i) => {
                      const sid = s.id || `s-${i}`;
                      const status = attendance[sid] || '';
                      const studentName = s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown';
                      const rollNo = s.roll_no || s.roll_number || s.registration_no || 'N/A';
                      const sectionLabel = s.section || s.section_name || s.details?.section_name || selectedSectionName || '—';
                      
                      return (
                        <tr key={sid} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium w-8">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                {studentName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{studentName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{rollNo}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                              {sectionLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 justify-center flex-wrap">
                              {STATUS_OPTIONS.map((opt) => {
                                const isActive = status === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => setStatus(sid, opt.value)}
                                    disabled={saved}
                                    className={`w-8 h-8 rounded-lg text-xs font-extrabold border-2 transition-all ${isActive ? opt.color : UNSET_BTN}`}
                                    title={opt.value}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save button */}
          {filters.class_id && filters.section_id && displayStudents.length > 0 && !saved && (
            <Button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 font-bold gap-2 sticky bottom-0"
            >
              <Save className="w-4 h-4" /> Save Attendance for {filters.date}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
