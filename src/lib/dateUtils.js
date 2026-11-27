/**
 * Pakistan-local date helpers.
 *
 * `todayPK()` returns the UTC date, which is the
 * previous calendar day in Pakistan (UTC+5) between 00:00 and 05:00 PKT.
 * These helpers always format in the Asia/Karachi timezone.
 */
const PK_TZ = 'Asia/Karachi';

const pkFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PK_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD for the given date (default: now) in Pakistan time. */
export function toDateStrPK(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return pkFormatter.format(d);
}

/** Today's date (YYYY-MM-DD) in Pakistan time. */
export function todayPK() {
  return toDateStrPK(new Date());
}

/** Current month (YYYY-MM) in Pakistan time. */
export function monthPK() {
  return todayPK().slice(0, 7);
}
