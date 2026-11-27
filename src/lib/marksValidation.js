/**
 * Marks validation shared by every marks-entry screen.
 * Valid marks: blank (= not entered) or a plain non-negative number 0..total with at most 2 decimals
 * (the backend column is DECIMAL(7,2)). No letters, signs, exponents or thousands separators.
 *
 * @returns {{ ok: boolean, blank: boolean, error: string|null }}
 */
export function validateMark(raw, total) {
  const t = Number(total);
  const s = raw === null || raw === undefined ? '' : String(raw).trim();
  if (s === '') return { ok: true, blank: true, error: null };
  const rangeText = Number.isFinite(t) ? `0–${t}` : 'a valid number';
  if (!/^\d+(\.\d{1,2})?$|^\.\d{1,2}$/.test(s)) {
    return { ok: false, blank: false, error: /^-?\d*\.\d{3,}$/.test(s) ? 'Max 2 decimals' : `Must be ${rangeText}` };
  }
  const n = Number(s);
  if (Number.isFinite(t) && n > t) return { ok: false, blank: false, error: `Max ${t}` };
  return { ok: true, blank: false, error: null };
}

/** Total/passing marks rules for the Add/Edit form. Returns { total?: string, passing?: string }. */
export function validateTotals(totalRaw, passingRaw) {
  const out = {};
  const ts = String(totalRaw ?? '').trim();
  const ps = String(passingRaw ?? '').trim();
  const total = Number(ts);
  if (ts !== '' && (!/^\d+(\.\d{1,2})?$/.test(ts) || !(total > 0))) out.total = 'Total marks must be greater than 0 (max 2 decimals)';
  if (ps !== '' && !/^\d+(\.\d{1,2})?$/.test(ps)) out.passing = 'Passing marks must be a number (max 2 decimals)';
  else if (ps !== '' && ts !== '' && !out.total && Number(ps) > total) out.passing = `Passing marks cannot be more than total marks (${total})`;
  return out;
}
