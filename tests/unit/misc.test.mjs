import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { buildNotificationPayload } from '../../src/lib/notificationAudience.js';
import { toDateStrPK } from '../../src/lib/dateUtils.js';
import { sanitizeHtml, escapeHtml } from '../../src/lib/sanitize.js';
import { middleware } from '../../src/middleware.js';

test('notification payload: all roles + all scope -> { type: all }', () => {
  const r = buildNotificationPayload({ title: ' Hi ', message: 'Body', scope: 'all', roles: ['TEACHER', 'PARENT', 'STUDENT', 'STAFF'] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.payload, { title: 'Hi', body: 'Body', audience: { type: 'all' } });
});

test('notification payload: validation', () => {
  const r = buildNotificationPayload({ title: '', message: '', scope: 'class', roles: [] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.title && r.errors.message && r.errors.class_id && r.errors.roles);
});

test('notification payload: class scope only allows students + parents', () => {
  const r = buildNotificationPayload({ title: 't', message: 'm', scope: 'class', class_id: 'c1', roles: ['TEACHER', 'PARENT'] });
  assert.deepEqual(r.payload.audience, { type: 'class', class_id: 'c1', roles: ['PARENT'] });
});

test('dates are formatted in Pakistan time (UTC+5), not UTC', () => {
  // 2026-01-01T20:00Z is already 2026-01-02 01:00 in Karachi
  assert.equal(toDateStrPK(new Date('2026-01-01T20:00:00Z')), '2026-01-02');
  assert.equal(toDateStrPK(new Date('2026-01-01T10:00:00Z')), '2026-01-01');
});

test('sanitize: without a DOM the HTML is escaped, never passed through', () => {
  const out = sanitizeHtml('<img src=x onerror=alert(1)><script>alert(1)</script>');
  assert.ok(!out.includes('<'));
  assert.equal(escapeHtml('<a href="x">\'&'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
});

// ── middleware: exact-segment portal guards and role checks ──────────────
const run = (path, cookies = {}) => {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  const res = middleware(new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} }));
  const loc = res.headers.get('location');
  return loc ? new URL(loc).pathname : null; // null = allowed through
};
const staff = { access_token: 't', user_type: 'STAFF', institute_type: 'school' };
const teacher = { access_token: 't', portal_token: 't', user_type: 'TEACHER', institute_type: 'school' };

test('middleware: /students (admin page) is NOT treated as the /student portal', () => {
  assert.equal(run('/students'), '/login'); // unauthenticated -> login, not portal-login
  assert.equal(run('/student'), '/portal-login');
});

test('middleware: logged-out users are sent to login', () => {
  assert.equal(run('/school/dashboard'), '/login');
});

test('middleware: staff cannot open portals or master-admin', () => {
  assert.equal(run('/teacher', staff), '/school/dashboard');
  assert.equal(run('/master-admin', staff), '/school/dashboard');
});

test('middleware: a teacher stays inside /teacher and cannot open /student or admin pages', () => {
  assert.equal(run('/teacher/exams', teacher), null);
  assert.equal(run('/student', teacher), '/teacher');
  assert.equal(run('/school/dashboard', teacher), '/teacher');
  assert.equal(run('/master-admin', teacher), '/teacher');
});

test('middleware: branch admin is kept off the branches page (exact segment)', () => {
  const ba = { access_token: 't', user_type: 'BRANCH_ADMIN', institute_type: 'school' };
  assert.equal(run('/school/branches', ba), '/school/dashboard');
  assert.equal(run('/school/branches-report', ba), null);
});

test('middleware: logged-in users are bounced away from /login to their own home', () => {
  assert.equal(run('/login', teacher), '/teacher');
  assert.equal(run('/login', staff), '/school/dashboard');
});
