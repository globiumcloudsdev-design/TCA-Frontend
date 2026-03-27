'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, classService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

export default function AttendancePage() {
  const canMark = useAuthStore((s) => s.canDo(PERMISSIONS.ATTENDANCE_MARK));

  const today = new Date().toISOString().split('T')[0];
  const [date,    setDate]    = useState(today);
  const [classId, setClassId] = useState('');

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn:  () => classService.getAll(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn:  () => attendanceService.getByClassDate(classId, date),
    enabled:  !!classId,
  });

  const classes    = classesData?.data?.rows ?? classesData?.data ?? [];
  const attendance = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        {canMark && classId && (
          <a
            href={`/attendance/mark?class_id=${classId}&date=${date}`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Mark Attendance
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
        >
          <option value="">— Select Class —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
        />
      </div>

      {!classId && (
        <p className="text-sm text-muted-foreground">Select a class to view attendance.</p>
      )}

      {classId && isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {classId && !isLoading && (
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
