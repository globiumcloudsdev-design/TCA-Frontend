import { validateMark } from '@/lib/marksValidation';

const blank = (v) => v === '' || v === null || v === undefined;

/**
 * Build the partial-save payload for the marks grid.
 *
 * students: detail.students  [{ student_id, marks_obtained, is_absent, remark, entered }]
 * rows:     { [student_id]: { marks: string, absent: boolean, remark: string } }  (current grid state)
 *
 * Rules (spec: blank = not entered yet, NEVER 0; saving is partial and never touches other students):
 *  - blank cell that was never saved      → not sent
 *  - blank cell that WAS saved (cleared)  → { student_id, clear: true }
 *  - absent                               → { student_id, is_absent: true, remark }
 *  - number 0..total (max 2 decimals)     → { student_id, marks_obtained, remark }
 *  - unchanged rows                       → not sent
 *  - invalid cells                        → reported in `invalid` and excluded from `changes`
 * Save is allowed when `changes.length > 0 && no invalid` — filling only some students is fine.
 */
export function buildMarksPayload(students = [], rows = {}, total) {
  const changes = [];
  const invalid = {};
  let enteredNow = 0;

  students.forEach((s) => {
    const cur = rows[s.student_id];
    if (!cur) return;

    if (cur.absent || !blank(cur.marks)) enteredNow += 1;

    if (!cur.absent) {
      const v = validateMark(cur.marks, total);
      if (!v.ok) {
        invalid[s.student_id] = v.error;
        return;
      }
    }

    const origMarks = blank(s.marks_obtained) ? '' : String(s.marks_obtained);
    if (cur.marks === origMarks && cur.absent === !!s.is_absent && (cur.remark || '') === (s.remark || '')) return; // unchanged

    if (cur.absent) {
      changes.push({ student_id: s.student_id, is_absent: true, remark: cur.remark });
    } else if (blank(cur.marks)) {
      if (s.entered) changes.push({ student_id: s.student_id, clear: true });
      // never entered and still blank → nothing to send (never 0)
    } else {
      changes.push({ student_id: s.student_id, marks_obtained: Number(cur.marks), remark: cur.remark });
    }
  });

  return { changes, invalid, enteredNow, total: students.length };
}
