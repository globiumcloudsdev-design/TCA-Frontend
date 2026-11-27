import test from 'node:test';
import assert from 'node:assert/strict';
import { friendlyMessage, humanizeAxiosError, isTechnicalText, MESSAGES } from '../../src/lib/errorMessages.js';

const axiosErr = (status, message) => ({
  message: 'Request failed',
  config: { url: '/x', method: 'get' },
  response: { status, data: { message } },
});

test('network failures map to the offline message', () => {
  assert.equal(friendlyMessage({ message: 'Network Error', code: 'ERR_NETWORK' }), MESSAGES.network);
});

test('401 -> session expired, but login screens keep a clean backend text', () => {
  assert.equal(friendlyMessage(axiosErr(401, 'jwt expired')), MESSAGES.session);
  assert.equal(friendlyMessage(axiosErr(401, 'Invalid email or password'), { keepAuthMessage: true }), 'Invalid email or password');
});

test('403 / 404 / 429 / 5xx map to plain language', () => {
  assert.equal(friendlyMessage(axiosErr(403, 'Forbidden')), MESSAGES.forbidden);
  assert.equal(friendlyMessage(axiosErr(404, 'Route GET /api/v1/foo not found')), MESSAGES.featureMissing);
  assert.equal(friendlyMessage(axiosErr(404, 'Not found')), MESSAGES.notFound);
  assert.equal(friendlyMessage(axiosErr(429, 'x')), MESSAGES.tooMany);
  assert.equal(friendlyMessage(axiosErr(500, 'SequelizeDatabaseError: select * from users')), MESSAGES.server);
});

test('validation errors keep a clean backend text', () => {
  assert.equal(friendlyMessage(axiosErr(400, 'Title is required')), 'Title is required');
});

test('technical text (urls, uuids, sql, stack) is never shown', () => {
  const technical = [
    'GET https://api.example.com/v1/x failed',
    'id 3f2b8c1e-1a2b-4c3d-9e8f-0123456789ab missing',
    'select a from b',
    'at Object.run (file.js:10:5)',
    'Cannot read properties of undefined',
  ];
  for (const t of technical) assert.equal(isTechnicalText(t), true, t);
  assert.equal(isTechnicalText('Please enter a valid phone number'), false);
  assert.equal(friendlyMessage('connect ECONNREFUSED 127.0.0.1:5001'), MESSAGES.generic);
});

test('humanizeAxiosError rewrites the message fields once and keeps the technical one aside', () => {
  const e = axiosErr(500, 'boom: select * from x');
  humanizeAxiosError(e);
  assert.equal(e.message, MESSAGES.server);
  assert.equal(e.response.data.message, MESSAGES.server);
  assert.equal(e.technicalMessage, 'boom: select * from x');
  humanizeAxiosError(e); // idempotent
  assert.equal(e.message, MESSAGES.server);
});
