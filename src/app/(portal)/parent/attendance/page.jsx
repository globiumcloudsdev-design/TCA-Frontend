'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_PARENTS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

const STATUS_CONFIG = {
  present: { color: 'bg-emerald-100 text-emerald-700',  dot: 'bg-emerald-500', icon: CheckCircle, label: 'Present' },
  absent:  { color: 'bg-red-100 text-red-700',          dot: 'bg-red-500',     icon: XCircle,     label: 'Absent'  },
  late:    { color: 'bg-amber-100 text-amber-700',       dot: 'bg-amber-500',   icon: Clock,       label: 'Late'    },
};

export default function ParentAttendancePage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser || DUMMY_PARENTS[0];
  const t = getPortalTerms(parent?.institute_type);
  const children = parent.children || [];
  const [selectedChild, setSelectedChild] = useState(0);

  const child = children[selectedChild];
  const attendance = child?.attendance;
  if (!attendance) return <p className="text-slate-500">No attendance data available.</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t.attendanceLabel} Record</h1>
        <p className="text-sm text-slate-500 mt-1">View daily and monthly {t.attendanceLabel.toLowerCase()} for your child.</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedChild === i
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {c.first_name} {c.last_name}
            </button>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: attendance.total_days, color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-400' },
          { label: 'Present', value: attendance.present, color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
          { label: 'Absent', value: attendance.absent, color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
          { label: 'Late', value: attendance.late, color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-100`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance percentage banner */}
      <div className={`rounded-xl p-5 flex items-center gap-4 ${attendance.percentage >= 90 ? 'bg-emerald-50 border border-emerald-200' : attendance.percentage >= 75 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold ${attendance.percentage >= 90 ? 'bg-emerald-600 text-white' : attendance.percentage >= 75 ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'}`}>
          {attendance.percentage}%
        </div>
        <div>
          <p className="font-bold text-slate-900">
            {attendance.percentage >= 90
              ? '✅ Excellent attendance this month!'
              : attendance.percentage >= 75
              ? '⚠️ Acceptable attendance — can improve'
              : '❌ Low attendance — immediate attention needed'}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {child.first_name} attended {attendance.present} out of {attendance.total_days} school days in {attendance.month}.
          </p>
        </div>
      </div>

      {/* Daily calendar grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">{attendance.month} — Daily Record</h2>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
            <p key={d} className="text-center text-xs font-semibold text-slate-400">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {/* Adjust offset for Feb 2026 (starts Sunday → Mon is 2nd) */}
          <div className="col-span-0" />
          {attendance.days.map((day) => {
            const s = STATUS_CONFIG[day.status];
            const dayNum = new Date(day.date).getDate();
            return (
              <div
                key={day.date}
                title={`${day.date} — ${s.label}`}
                className={`rounded-xl p-2 text-center text-xs font-bold ${s.color}`}
              >
                <span className="block text-sm">{dayNum}</span>
                <span className="text-[9px] opacity-70">{s.label}</span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-slate-100">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={`w-3 h-3 rounded-full ${config.dot}`} />
              {config.label}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly history */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">Monthly History</h2>
        <div className="space-y-3">
          {attendance.monthly_history.map((m) => (
            <div key={m.month} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600 w-20 flex-shrink-0">{m.month}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${m.percentage >= 90 ? 'bg-emerald-500' : m.percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-10 text-right ${m.percentage >= 90 ? 'text-emerald-600' : m.percentage >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                {m.percentage}%
              </span>
              <span className="text-[10px] text-slate-400">{m.present}/{m.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
