'use client';

import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useStudentAttendance } from '@/hooks/useStudentPortal';

export default function StudentAttendancePage() {
  const { data: attendanceRes, isLoading } = useStudentAttendance();
  const attendance = attendanceRes?.data || {};
  const summary = attendance.summary || {};
  const records = attendance.records || [];

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600" /> Attendance
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={summary.total ?? 0} icon={Calendar} />
        <SummaryCard label="Present" value={summary.present ?? 0} icon={CheckCircle2} color="text-emerald-600" />
        <SummaryCard label="Absent" value={summary.absent ?? 0} icon={XCircle} color="text-red-600" />
        <SummaryCard label="Late" value={summary.late ?? 0} icon={Clock} color="text-amber-600" />
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Overall Percentage</h2>
          <span className="text-2xl font-bold text-emerald-600">{summary.percentage ?? 0}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(summary.percentage ?? 0, 100)}%` }} />
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Recent Records</h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-500">No attendance records found.</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 30).map((item, idx) => (
              <div key={`${item.date}-${item.subject}-${idx}`} className="p-3 rounded-lg bg-slate-50 text-sm flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{item.subject || 'General'}</p>
                  <p className="text-slate-500">{item.date} | {item.day}</p>
                </div>
                <span className="capitalize text-xs font-semibold px-2 py-1 rounded-full bg-white border text-slate-700">
                  {item.status || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color = 'text-slate-700' }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
