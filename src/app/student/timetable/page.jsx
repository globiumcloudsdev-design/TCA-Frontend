// src/app/student/timetable/page.jsx
'use client';

import { useMemo, useState } from 'react';
import { Clock, User, MapPin } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useStudentTimetable, useStudentProfile } from '@/hooks/useStudentPortal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-50 border-blue-200 text-blue-700',
  English: 'bg-violet-50 border-violet-200 text-violet-700',
  Urdu: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Science: 'bg-teal-50 border-teal-200 text-teal-700',
  Physics: 'bg-sky-50 border-sky-200 text-sky-700',
  Chemistry: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  Computer: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  'Computer Science': 'bg-indigo-50 border-indigo-200 text-indigo-700',
  Break: 'bg-slate-50 border-slate-200 text-slate-400',
  'Lunch Break': 'bg-slate-50 border-slate-200 text-slate-400'
};

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || 'bg-amber-50 border-amber-200 text-amber-700';
}

function normalizeSchedule(schedule = {}) {
  const map = {};
  DAYS.forEach((day) => {
    const key = day.toLowerCase();
    const periods = Array.isArray(schedule[key]) ? schedule[key] : [];
    
    // Create a map with period number as key
    const periodMap = {};
    periods.forEach((slot) => {
      const periodNum = slot.period || 1;
      periodMap[periodNum] = {
        ...slot,
        time: `${slot.start_time || '--:--'} - ${slot.end_time || '--:--'}`,
        subject: slot.subject || 'Subject',
        period: periodNum,
        start_time: slot.start_time,
        end_time: slot.end_time
      };
    });
    
    map[day] = periodMap;
  });
  return map;
}

function getMaxPeriod(scheduleMap) {
  let maxPeriod = 0;
  DAYS.forEach(day => {
    const periods = Object.keys(scheduleMap[day] || {});
    periods.forEach(period => {
      maxPeriod = Math.max(maxPeriod, parseInt(period) || 0);
    });
  });
  return maxPeriod;
}

// Get all unique times for each period across days
function getPeriodTimeMap(scheduleMap, maxPeriods) {
  const timeMap = {};
  for (let periodNum = 1; periodNum <= maxPeriods; periodNum++) {
    // Try to find time from any day that has this period
    for (const day of DAYS) {
      const period = scheduleMap[day]?.[periodNum];
      if (period && period.start_time && period.end_time) {
        timeMap[periodNum] = `${period.start_time} - ${period.end_time}`;
        break;
      }
    }
    // If no time found, set default
    if (!timeMap[periodNum]) {
      timeMap[periodNum] = '--:--';
    }
  }
  return timeMap;
}

export default function StudentTimetablePage() {
  const { portalUser } = usePortalStore();
  const { data: timetableRes, isLoading } = useStudentTimetable();
  const { data: profileRes } = useStudentProfile();

  const profile = profileRes?.data || {};
  const t = getPortalTerms(portalUser?.institute_type || 'school');

  const timetable = timetableRes?.data || {};
  const scheduleMap = useMemo(() => normalizeSchedule(timetable.schedule), [timetable.schedule]);

  const [activeDay, setActiveDay] = useState('Monday');
  const daySchedule = scheduleMap[activeDay] || {};

  const maxPeriods = useMemo(() => getMaxPeriod(scheduleMap), [scheduleMap]);
  const periodTimeMap = useMemo(() => getPeriodTimeMap(scheduleMap, maxPeriods), [scheduleMap, maxPeriods]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading timetable...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" /> {t.timetableLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {profile.class_name || portalUser?.class_name || '-'} | Week: {timetable.week?.start || '-'} to {timetable.week?.end || '-'}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeDay === day
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Desktop View - Proper Grid with Period Numbers and Times */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase border-b border-slate-100 w-28">Period</th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className={`px-3 py-3 text-xs font-bold uppercase border-b border-l border-slate-100 ${
                    day === activeDay ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxPeriods }).map((_, periodIdx) => {
              const periodNum = periodIdx + 1;
              const periodTime = periodTimeMap[periodNum];
              
              return (
                <tr key={periodNum} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-[11px] font-bold text-slate-500 align-top">
                    <div>Period {periodNum}</div>
                    {periodTime !== '--:--' && (
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        {periodTime}
                      </div>
                    )}
                  </td>
                  {DAYS.map((day) => {
                    const period = scheduleMap[day]?.[periodNum];
                    if (!period) {
                      return (
                        <td key={day} className="border-l border-slate-100 px-2 py-3 align-top">
                          <div className="h-16"></div>
                        </td>
                      );
                    }

                    const isBreak = String(period.subject || '').toLowerCase().includes('break');

                    return (
                      <td key={day} className={`border-l border-slate-100 px-2 py-3 align-top ${day === activeDay ? 'bg-emerald-50/30' : ''}`}>
                        {isBreak ? (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center">
                            <span className="text-[11px] text-slate-400 font-medium italic">{period.subject}</span>
                          </div>
                        ) : (
                          <div className={`rounded-lg border px-2 py-2 ${getSubjectColor(period.subject)}`}>
                            <p className="text-xs font-bold leading-tight">{period.subject}</p>
                            {period.teacher && (
                              <p className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> {period.teacher}
                              </p>
                            )}
                            {period.room && (
                              <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {period.room}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-2">
        <h2 className="text-base font-bold text-slate-800">{activeDay}'s Schedule</h2>
        {Object.keys(daySchedule).length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No schedule for {activeDay}.</p>
          </div>
        ) : (
          Object.values(daySchedule)
            .sort((a, b) => a.period - b.period)
            .map((period, idx) => {
              const isBreak = String(period.subject || '').toLowerCase().includes('break');
              return (
                <div
                  key={`${period.id || idx}-${period.start_time || ''}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isBreak ? 'bg-slate-50 border-slate-200 opacity-60' : `${getSubjectColor(period.subject)} bg-white`
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-slate-500 flex-col">
                    <span>P{period.period}</span>
                    <span className="text-[8px] font-normal">{period.start_time?.slice(0,5)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isBreak ? 'text-slate-400 italic' : 'text-slate-800'}`}>{period.subject}</p>
                    {!isBreak && (
                      <div className="flex gap-3 mt-0.5">
                        {period.teacher && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <User className="w-3 h-3" /> {period.teacher}
                          </span>
                        )}
                        {period.room && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {period.room}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400">{period.time}</p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Detailed View for Active Day */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50">
          <h2 className="text-base font-bold text-emerald-800">{activeDay} - Detailed Schedule</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.values(daySchedule)
            .sort((a, b) => a.period - b.period)
            .map((period, idx) => {
              const isBreak = String(period.subject || '').toLowerCase().includes('break');
              return (
                <div key={`${period.id || idx}-detail`} className={`flex items-center gap-4 px-5 py-3 ${isBreak ? 'opacity-50' : ''}`}>
                  <div className="w-12 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-500">
                      P{period.period}
                    </div>
                    <div className="text-[9px] text-slate-400 text-center mt-1">
                      {period.start_time?.slice(0,5)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isBreak ? 'text-slate-400 italic' : 'text-slate-800'}`}>{period.subject}</p>
                    {!isBreak && (
                      <div className="flex gap-4 mt-0.5">
                        {period.teacher && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" /> {period.teacher}
                          </span>
                        )}
                        {period.room && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {period.room}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">{period.time}</p>
                  </div>
                </div>
              );
            })}
          {Object.keys(daySchedule).length === 0 && (
            <div className="px-5 py-8 text-sm text-slate-500">No classes scheduled for {activeDay}.</div>
          )}
        </div>
      </div>
    </div>
  );
}