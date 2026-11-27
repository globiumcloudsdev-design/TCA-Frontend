import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMark, validateTotals } from '../../src/lib/marksValidation.js';
import { buildMarksPayload } from '../../src/lib/marksPayload.js';

test('validateMark: blank is allowed and means "not entered"', () => {
  assert.deepEqual(validateMark('', 20), { ok: true, blank: true, error: null });
  assert.equal(validateMark(null, 20).blank, true);
});

test('validateMark: 0..total inclusive, max 2 decimals, digits only', () => {
  assert.equal(validateMark('0', 20).ok, true);
  assert.equal(validateMark('20', 20).ok, true);
  assert.equal(validateMark('12.5', 20).ok, true);
  assert.equal(validateMark('21', 20).ok, false);
  assert.equal(validateMark('-1', 20).ok, false);
  assert.equal(validateMark('1e3', 20).ok, false);
  assert.equal(validateMark('abc', 20).ok, false);
  assert.equal(validateMark('1.234', 20).error, 'Max 2 decimals');
});

test('validateTotals: total > 0 and passing <= total', () => {
  assert.deepEqual(validateTotals('20', '8'), {});
  assert.ok(validateTotals('0', '').total);
  assert.ok(validateTotals('20', '30').passing);
});

test('buildMarksPayload: partial save sends only changed rows and never writes 0 for blanks', () => {
  const students = [
    { student_id: 'a', marks_obtained: null, is_absent: false, entered: false },
    { student_id: 'b', marks_obtained: 10, is_absent: false, entered: true },
    { student_id: 'c', marks_obtained: null, is_absent: false, entered: false },
    { student_id: 'd', marks_obtained: null, is_absent: false, entered: false },
  ];
  const rows = {
    a: { marks: '15', absent: false, remark: '' }, // new mark
    b: { marks: '', absent: false, remark: '' }, // cleared
    c: { marks: '', absent: false, remark: '' }, // still blank: not sent
    d: { marks: '', absent: true, remark: 'ill' }, // absent
  };
  const r = buildMarksPayload(students, rows, 20);
  assert.deepEqual(r.changes, [
    { student_id: 'a', marks_obtained: 15, remark: '' },
    { student_id: 'b', clear: true },
    { student_id: 'd', is_absent: true, remark: 'ill' },
  ]);
  assert.deepEqual(r.invalid, {});
});

test('buildMarksPayload: invalid cells are reported and excluded', () => {
  const r = buildMarksPayload(
    [{ student_id: 'a', marks_obtained: null, entered: false }],
    { a: { marks: '99', absent: false, remark: '' } },
    20,
  );
  assert.equal(r.changes.length, 0);
  assert.equal(r.invalid.a, 'Max 20');
});

test('buildMarksPayload: unchanged rows are not sent', () => {
  const r = buildMarksPayload(
    [{ student_id: 'a', marks_obtained: 10, entered: true, is_absent: false }],
    { a: { marks: '10', absent: false, remark: '' } },
    20,
  );
  assert.equal(r.changes.length, 0);
});
