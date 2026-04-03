'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, classService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import { QrCode, CheckSquare, Users } from 'lucide-react';
import AttendanceFilter from '@/components/attendance/AttendanceFilter';
import MarkAttendanceModal from '@/components/attendance/MarkAttendanceModal';
import useInstituteConfig from '@/hooks/useInstituteConfig';

export default function AttendancePage() {
  const canMark = useAuthStore((s) => s.canDo(PERMISSIONS.ATTENDANCE_MARK) || s.canDo('attendance.mark'));

  const { terms } = useInstituteConfig();

  const [modalState, setModalState] = useState({ open: false, mode: 'class' });

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    academic_year_id: '',
    class_id: '',
    section_id: '',
    date: today,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', filters.class_id, filters.date, filters.section_id, filters.academic_year_id],
    queryFn:  () => attendanceService.getByClassDate(filters.class_id, filters.date, {
      section_id: filters.section_id || undefined,
      academic_year_id: filters.academic_year_id || undefined
    }),
    enabled:  !!filters.class_id,
  });

  const attendance = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalState({ open: true, mode: 'scan' })}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            Scan QR Student
          </button>
          {canMark && (
            <button
              onClick={() => setModalState({ open: true, mode: 'class' })}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
            >
              <CheckSquare className="h-4 w-4" />
              Manual / Bulk Mark
            </button>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal 
        open={modalState.open} 
        onClose={() => setModalState({ open: false, mode: 'class' })} 
        defaultMode={modalState.mode} 
        type="school" 
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold">Attendance Filters</h2>
        </div>
        <AttendanceFilter 
          filters={filters} 
          setFilters={setFilters} 
          terms={terms} 
          showDate={true} 
        />
      </div>

      {!filters.class_id && (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No {terms.class || 'Class'} Selected</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please select a {terms.class || 'class'} from the filters above to view the attendance records.</p>
        </div>
      )}

      {filters.class_id && isLoading && (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-pulse">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-600 dark:text-slate-400">Loading attendance data...</p>
        </div>
      )}

      {filters.class_id && !isLoading && (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Student</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{a.student?.first_name} {a.student?.last_name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                      a.status === 'absent'  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                               'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.remarks ?? '—'}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No attendance records for this date</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
