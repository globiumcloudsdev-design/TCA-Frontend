'use client';

import { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, Save, AlertCircle } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useTeacherAttendance, useTeacherClasses, useTeacherStudents } from '@/hooks/useTeacherPortal';
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
  const { students, filterByClass } = useTeacherStudents();
  const { markAttendance, getClassAttendance } = useTeacherAttendance();
  const today      = new Date().toISOString().split('T')[0];

  const [selectedClass, setSelectedClass] = useState('');

  const [attendance, setAttendance] = useState({});

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      const firstClass = classes[0].class_id;
      setSelectedClass(firstClass);
      filterByClass(firstClass);
    }
  }, [classes, selectedClass, filterByClass]);

  useEffect(() => {
    if (!selectedClass) return;
    filterByClass(selectedClass);
    setSaved(false);
  }, [selectedClass, filterByClass]);

  useEffect(() => {
    const hydrateAttendance = async () => {
      if (!selectedClass) return;
      try {
        const records = await getClassAttendance(selectedClass, today);
        const next = {};
        (records || []).forEach((row) => {
          next[row.student_id] = row.status;
        });
        setAttendance(next);
      } catch {
        setAttendance({});
      }
    };
    hydrateAttendance();
  }, [selectedClass, today, getClassAttendance]);

  const setStatus = (studentId, status) => {
    if (saved) return;
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status,
    }));
  };

  const markAll = (status) => {
    if (saved) return;
    const next = {};
    students.forEach((s, i) => { next[s.id || `s-${i}`] = status; });
    setAttendance(next);
  };

  const handleSave = async () => {
    const unmarked = students.filter((s, i) => !attendance[s.id || `s-${i}`]);
    if (unmarked.length > 0) {
      toast.warning(`${unmarked.length} student(s) still not marked. Please mark all students.`);
      return;
    }
    try {
      await markAttendance({
        class_id: selectedClass,
        date: today,
        attendance: students.map((s, i) => ({
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
  const unmarked     = students.length - Object.values(attendance).filter(Boolean).length;

  if (classesLoading) {
    return <div className="max-w-3xl mx-auto text-sm text-slate-500">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" /> Mark {t.attendanceLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Date: {today}</p>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Attendance Saved!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Attendance for {today} has been recorded successfully.</p>
          </div>
        </div>
      )}

      {/* Class selector */}
      <div className="flex gap-2 flex-wrap">
        {classes.map((cls) => (
          <button
            key={cls.class_id}
            onClick={() => setSelectedClass(cls.class_id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedClass === cls.class_id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            {cls.class_name}
          </button>
        ))}
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

      {/* Quick mark all */}
      {!saved && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-1">Mark all:</span>
          <button onClick={() => markAll('present')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-all">All Present</button>
          <button onClick={() => markAll('absent')}  className="px-3 py-1.5 rounded-lg bg-red-50    text-red-700    text-xs font-semibold hover:bg-red-100    border border-red-200    transition-all">All Absent</button>
        </div>
      )}

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">{t.studentsLabel} — {classes.find((c) => c.class_id === selectedClass)?.class_name}</h2>
          <span className="text-xs text-slate-400">{students.length} {t.studentsLabel.toLowerCase()}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {students.map((s, i) => {
            const sid    = s.id || `s-${i}`;
            const status = attendance[sid] || '';
            return (
              <div key={sid} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {s.first_name?.[0] || s.name?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</p>
                </div>
                {/* Status buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      {!saved && (
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 font-bold gap-2"
        >
          <Save className="w-4 h-4" /> Save Attendance for Today
        </Button>
      )}
    </div>
  );
}
