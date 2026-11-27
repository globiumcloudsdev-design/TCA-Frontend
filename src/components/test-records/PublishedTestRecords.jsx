'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parentTestRecordService, studentTestRecordService, getTestRecordError } from '@/services/testRecordService';
import { LoadingBlock, ErrorBlock, EmptyBlock, ResultBadge, FieldLabel, NativeSelect, MONTH_OPTIONS, yearOptions, currentMonthYear, fmtDate, fmtNum } from './shared';

/**
 * Read-only monthly test results (published tests only) for a student (mode 'student')
 * or one child of a parent (mode 'parent', needs childId; the parent page owns the child switcher).
 * One mini sheet per subject: date, total, obtained, pass/fail, plus the monthly total and %.
 */
export default function PublishedTestRecords({ mode = 'student', childId }) {
  const now = currentMonthYear();
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(now.year);
  const enabled = mode === 'student' || !!childId;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['published-test-records', mode, childId || 'self', month, year],
    queryFn: () => (mode === 'parent' ? parentTestRecordService.monthly(childId, { month, year }) : studentTestRecordService.monthly({ month, year })),
    enabled,
    placeholderData: (prev) => prev,
  });

  const picker = (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <FieldLabel>Month</FieldLabel>
        <NativeSelect value={month} onChange={(v) => v && setMonth(v)} options={MONTH_OPTIONS} placeholder="Month" />
      </div>
      <div className="w-28">
        <FieldLabel>Year</FieldLabel>
        <NativeSelect value={year} onChange={(v) => v && setYear(v)} options={yearOptions()} placeholder="Year" />
      </div>
    </div>
  );

  if (!enabled) return <EmptyBlock title="No child selected" hint="Select a child to see their test results." />;

  const m = data?.data;
  const subjects = m?.subjects || [];
  const overall = m?.overall;

  return (
    <div className="space-y-4">
      {picker}

      {isLoading ? (
        <LoadingBlock label="Loading test results…" />
      ) : error ? (
        <ErrorBlock title="Couldn’t load test results" message={getTestRecordError(error, 'Could not load test results')} onRetry={refetch} />
      ) : subjects.length === 0 ? (
        <EmptyBlock title="No published test results this month" hint="Results appear here once the school publishes them." />
      ) : (
        <div className={`space-y-4 ${isFetching ? 'opacity-70' : ''}`}>
          {overall && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Tests', overall.tests],
                ['Absent', overall.absent],
                ['Total', `${fmtNum(overall.total_obtained, 2)} / ${fmtNum(overall.total_possible, 2)}`],
                ['Monthly %', overall.percentage == null ? '—' : `${fmtNum(overall.percentage)}%`],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black text-tca-dark">{val ?? 0}</p>
                </div>
              ))}
            </div>
          )}

          {subjects.map((s) => (
            <div key={`${s.subject_name}-${s.teacher_id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-tca-dark px-4 py-2.5 text-white">
                <div>
                  <p className="text-sm font-bold">{s.subject_name}</p>
                  {s.teacher_name && <p className="text-[11px] text-white/70">{s.teacher_name}</p>}
                </div>
                <p className="text-sm font-black text-amber-300">
                  {s.monthly_percentage == null ? '—' : `${fmtNum(s.monthly_percentage)}%`}
                  <span className="ml-2 text-xs font-medium text-white/70">
                    {fmtNum(s.monthly_total_obtained, 2)} / {fmtNum(s.monthly_total_possible, 2)}
                  </span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Test</th>
                      <th className="px-3 py-2 text-center">Total</th>
                      <th className="px-3 py-2 text-center">Obtained</th>
                      <th className="px-3 py-2 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {s.tests.map((t) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">{fmtDate(t.date)}</td>
                        <td className="px-3 py-2">
                          <p className="text-slate-800">{t.title}</p>
                          {t.remark && <p className="text-[11px] italic text-slate-500">“{t.remark}”</p>}
                        </td>
                        <td className="px-3 py-2 text-center">{fmtNum(t.total_marks, 2)}</td>
                        <td className="px-3 py-2 text-center font-bold text-tca-dark">{t.is_absent ? 'A' : fmtNum(t.marks_obtained, 2)}</td>
                        <td className="px-3 py-2 text-center">
                          <ResultBadge result={t.result} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
