'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { staffAttendanceService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, ATTENDANCE_STATUS } from '@/constants';
import { formatDate } from '@/lib/utils';
import { PageHeader, StatsCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];

const STATUS_STYLES = {
  present: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200',
  absent:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200',
  late:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200',
  leave:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
};

const ALL_STATUSES = ['present', 'absent', 'late', 'leave'];

export default function StaffAttendancePage() {
  const qc = useQueryClient();

  const canMark = useAuthStore((s) => s.canDo(PERMISSIONS.ATTENDANCE_MARK));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate]       = useState(today);
  const [marks, setMarks]     = useState({}); // { [teacher_id]: status }
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Daily Roll, 1: Summary

  /* ── Daily attendance ── */
  const { data, isLoading } = useQuery({
    queryKey: ['staff-attendance', date],
    queryFn:  () => staffAttendanceService.getAll({ date }),
  });

  /* ── Monthly summary ── */
  const [summaryMonth, setSummaryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['staff-attendance-summary', summaryMonth],
    queryFn:  () => staffAttendanceService.getSummary({ month: summaryMonth }),
    enabled:  activeTab === 1,
  });

  const records  = extractRows(data);
  const summary  = summaryData?.data ?? [];

  /* Pre-fill marks from existing records */
  useEffect(() => {
    if (records.length) {
      const m = {};
      records.forEach((r) => { m[r.teacher_id] = r.status; });
      setMarks(m);
    }
  }, [records]);

  /* Count by status */
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length;
    return acc;
  }, {});

  const handleMarkAll = (status) => {
    const m = {};
    records.forEach((r) => { m[r.teacher_id] = status; });
    setMarks(m);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = records.map((r) => ({
        teacher_id: r.teacher_id,
        status: marks[r.teacher_id] ?? 'present',
        date,
      }));
      await staffAttendanceService.markBulk({ date, records: payload });
      qc.invalidateQueries({ queryKey: ['staff-attendance'] });
      toast.success('Attendance saved');
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff Attendance"
        description="Daily staff and teacher attendance tracking"
        action={
          canMark && activeTab === 0 && (
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving…' : 'Save Attendance'}
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {['Daily Roll Call', 'Monthly Summary'].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Daily roll call ── */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {/* Date selector & stats */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
            />
            <div className="flex gap-2 ml-auto">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleMarkAll(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize border transition-all ${STATUS_STYLES[s] ?? ''}`}
                >
                  All {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick counts */}
          {!isLoading && records.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {ALL_STATUSES.map((s) => (
                <div key={s} className={`rounded-lg p-3 border text-center ${STATUS_STYLES[s] ?? ''}`}>
                  <p className="text-2xl font-bold">{counts[s] ?? 0}</p>
                  <p className="text-xs capitalize font-medium mt-0.5">{s}</p>
                </div>
              ))}
            </div>
          )}

          {isLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading staff…</p>}

          {!isLoading && records.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No staff records found for this date.</p>
          )}

          {/* Roll call table */}
          {!isLoading && records.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Staff Member</th>
                    <th className="px-4 py-3 text-left font-medium">Designation</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Check In</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => {
                    const status = marks[r.teacher_id] ?? r.status ?? 'present';
                    return (
                      <tr key={r.id ?? r.teacher_id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{r.teacher_name ?? r.name ?? '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.designation ?? '—'}</td>
                        <td className="px-4 py-3">
                          {canMark ? (
                            <div className="flex gap-1 flex-wrap">
                              {ALL_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setMarks((m) => ({ ...m, [r.teacher_id]: s }))}
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border transition-all ${
                                    status === s
                                      ? STATUS_STYLES[s]
                                      : 'border-border text-muted-foreground hover:border-ring'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ''}`}>
                              {status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.check_in_time ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Monthly summary ── */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {summaryLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading summary…</p>}

          {!summaryLoading && summary.length > 0 && (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Staff Member</th>
                    <th className="px-4 py-3 text-center font-medium text-green-600">Present</th>
                    <th className="px-4 py-3 text-center font-medium text-red-600">Absent</th>
                    <th className="px-4 py-3 text-center font-medium text-yellow-600">Late</th>
                    <th className="px-4 py-3 text-center font-medium text-blue-600">Leave</th>
                    <th className="px-4 py-3 text-center font-medium">Total Days</th>
                    <th className="px-4 py-3 text-center font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => {
                    const totalDays = (s.present_days ?? 0) + (s.absent_days ?? 0) + (s.late_days ?? 0) + (s.leave_days ?? 0);
                    const pct = totalDays > 0 ? Math.round(((s.present_days ?? 0) / totalDays) * 100) : 0;
                    return (
                      <tr key={s.teacher_id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{s.teacher_name ?? '—'}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-medium">{s.present_days ?? 0}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-medium">{s.absent_days ?? 0}</td>
                        <td className="px-4 py-3 text-center text-yellow-600 font-medium">{s.late_days ?? 0}</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-medium">{s.leave_days ?? 0}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{totalDays}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!summaryLoading && summary.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No summary data for selected month.</p>
          )}
        </div>
      )}
    </div>
  );
}
