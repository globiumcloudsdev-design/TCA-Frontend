'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, Lock, RotateCcw } from 'lucide-react';
import { testRecordService, teacherTestRecordService, getTestRecordError } from '@/services/testRecordService';
import { Button } from '@/components/ui/button';
import { validateMark } from '@/lib/marksValidation';
import { buildMarksPayload } from '@/lib/marksPayload';
import { ResultBadge, InlineBanner, fmtDate, fmtNum } from './shared';

const blank = (v) => v === '' || v === null || v === undefined;

/**
 * Inline marks table for ONE test (detail payload in `test`).
 * Blank = not entered (never sent as 0). Only changed rows are sent; students not in the payload are never touched.
 */
export default function MarksEntry({ test, mode = 'admin', onSaved }) {
  const qc = useQueryClient();
  const svc = mode === 'admin' ? testRecordService : teacherTestRecordService;

  const [rows, setRows] = useState({});
  const [saveError, setSaveError] = useState('');

  const resetRows = () => {
    const next = {};
    (test?.students || []).forEach((s) => {
      next[s.student_id] = { marks: blank(s.marks_obtained) ? '' : String(s.marks_obtained), absent: !!s.is_absent, remark: s.remark || '' };
    });
    setRows(next);
    setSaveError('');
  };
  // Re-initialise only when fresh server data arrives (open / after save), never while editing.
  useEffect(resetRows, [test]); // eslint-disable-line react-hooks/exhaustive-deps

  const editable = !!test && test.can_edit !== false && test.marks_entry_open !== false;

  const update = (id, patch) => {
    setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));
  };

  // Partial-save payload + live validation (blank is valid and simply not sent; see lib/marksPayload.js)
  const { changes, invalid, enteredNow } = useMemo(() => buildMarksPayload(test?.students || [], rows, test?.total_marks), [rows, test]);
  const invalidCount = Object.keys(invalid).length;
  const aboveTotal = Object.values(invalid).filter((e) => e.startsWith('Max ') && !e.includes('decimals')).length;
  const totalStudents = test?.students?.length || 0;

  const saveMut = useMutation({
    mutationFn: () => svc.saveMarks(test.id, changes),
    onSuccess: async (res) => {
      const d = res?.data || {};
      const done = (d.created ?? 0) + (d.updated ?? 0);
      const entered = d.entered_count ?? 0;
      const total = d.total_students ?? totalStudents;
      const pending = Math.max(0, total - entered);
      toast.success(
        `Saved marks for ${done} student${done === 1 ? '' : 's'}${d.cleared ? `, cleared ${d.cleared}` : ''}; ${pending} still pending (${entered} / ${total} entered)`
      );
      qc.invalidateQueries({ queryKey: ['test-records'] });
      qc.invalidateQueries({ queryKey: ['test-record-sheet'] });
      await onSaved?.();
    },
    onError: (e) => {
      const msg = getTestRecordError(e, 'Failed to save marks');
      setSaveError(msg);
      toast.error(msg);
    },
  });

  const handleSave = () => {
    setSaveError('');
    if (invalidCount) return toast.error('Fix the highlighted marks first');
    if (changes.length === 0) return toast.info('Nothing to save');
    saveMut.mutate();
  };

  const preview = (cur) => {
    if (!cur) return null;
    if (cur.absent) return { result: 'absent', pct: null };
    if (blank(cur.marks) || !validateMark(cur.marks, test.total_marks).ok) return { result: null, pct: null };
    const n = Number(cur.marks);
    return { result: n >= Number(test.passing_marks) ? 'pass' : 'fail', pct: Number(test.total_marks) > 0 ? (n / Number(test.total_marks)) * 100 : null };
  };

  const busy = saveMut.isPending;
  const students = test?.students || [];

  return (
    <div className="space-y-3">
      {test.marks_entry_open === false && (
        <InlineBanner tone="warn">Marks can be entered on or after the test date ({fmtDate(test.test_date)}). The table is read-only until then.</InlineBanner>
      )}
      {test.can_edit === false && (
        <InlineBanner tone="lock">
          <Lock className="mr-1 inline h-3 w-3" />
          This test is published and locked. {mode === 'admin' ? 'Unpublish it to edit marks.' : 'Ask the admin to unpublish it if a correction is needed.'}
        </InlineBanner>
      )}
      {test.orphan_marks_count > 0 && <InlineBanner tone="info">{test.orphan_marks_count} saved mark(s) belong to students who have since left this class/section.</InlineBanner>}
      {saveError && <InlineBanner tone="warn">{saveError}</InlineBanner>}
      {invalidCount > 0 && (
        <InlineBanner tone="warn">
          {aboveTotal > 0
            ? `${aboveTotal} mark${aboveTotal === 1 ? ' is' : 's are'} above the total (${fmtNum(test.total_marks, 2)}).`
            : `${invalidCount} mark${invalidCount === 1 ? ' is' : 's are'} not valid.`}{' '}
          Fix {invalidCount === 1 ? 'it' : 'them'} to save.
        </InlineBanner>
      )}

      {students.length === 0 ? (
        <InlineBanner tone="warn">There are no active students in this class/section.</InlineBanner>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-tca-dark text-left text-xs text-white">
              <tr>
                <th className="px-3 py-2.5">S.No</th>
                <th className="px-3 py-2.5">Student</th>
                <th className="px-3 py-2.5">Roll</th>
                <th className="w-32 px-3 py-2.5">Marks / {fmtNum(test.total_marks, 2)}</th>
                <th className="px-3 py-2.5 text-center">Absent</th>
                <th className="px-3 py-2.5">Remark</th>
                <th className="px-3 py-2.5 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, i) => {
                const cur = rows[s.student_id] || { marks: '', absent: false, remark: '' };
                const prev = preview(cur);
                const err = invalid[s.student_id];
                return (
                  <tr key={s.student_id} className={cur.absent ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                    <td className="px-3 py-2 text-xs text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.registration_no}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{s.roll_no || '—'}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max={test.total_marks}
                        step="0.01"
                        aria-invalid={!!err}
                        value={cur.marks}
                        disabled={!editable || cur.absent || busy}
                        onChange={(e) => update(s.student_id, { marks: e.target.value })}
                        placeholder="—"
                        aria-label={`Marks for ${s.name}`}
                        className={`h-9 w-24 rounded-md border px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-tca-primary/30 disabled:bg-slate-100 ${err ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                      />
                      {err && <p className="mt-0.5 text-[11px] text-red-600">{err}</p>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={cur.absent}
                        disabled={!editable || busy}
                        onChange={(e) => update(s.student_id, { absent: e.target.checked, ...(e.target.checked ? { marks: '' } : {}) })}
                        aria-label={`Absent: ${s.name}`}
                        className="h-4 w-4 cursor-pointer accent-tca-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={cur.remark}
                        disabled={!editable || busy}
                        onChange={(e) => update(s.student_id, { remark: e.target.value })}
                        maxLength={255}
                        placeholder="Optional"
                        className="h-9 w-full min-w-[120px] rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-tca-primary/30 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <ResultBadge result={prev?.result} />
                        {prev?.pct != null && <span className="text-[11px] text-slate-500">{fmtNum(prev.pct)}%</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{enteredNow} / {totalStudents} entered · {changes.length > 0 ? `${changes.length} unsaved change(s)` : 'no unsaved changes'} · you can save a few students and finish later; blank marks are never saved as 0</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={busy || changes.length === 0} onClick={resetRows}>
            <RotateCcw className="mr-2 h-4 w-4" /> Discard
          </Button>
          <Button onClick={handleSave} disabled={!editable || busy || invalidCount > 0 || changes.length === 0} className="bg-tca-primary text-white hover:bg-tca-primary/90">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save marks
          </Button>
        </div>
      </div>
    </div>
  );
}
