/**
 * Event API Service
 * GET    /events
 * POST   /events
 * GET    /events/:id
 * PUT    /events/:id
 * DELETE /events/:id
 * POST   /events/:id/send-sms
 * POST   /events/import
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';

const DUMMY_EVENTS = [
  {
    id: 'evt-001',
    event_name: 'Annual Sports Day',
    description: 'Inter-house sports competitions and prize distribution.',
    event_type: 'Sports',
    date: '2026-04-20',
    time: '09:00',
    location: 'Main Ground',
    audience: 'all_students',
    status: 'scheduled',
    selected_classes: [],
    custom_users: [],
  },
  {
    id: 'evt-002',
    event_name: 'Parent Teacher Meeting',
    description: 'PTM for Term 2 progress discussion.',
    event_type: 'PTM',
    date: '2026-04-28',
    time: '11:30',
    location: 'Auditorium',
    audience: 'selected_classes',
    status: 'draft',
    selected_classes: ['class-1', 'class-3'],
    custom_users: [],
  },
];

const paginateData = (items, page = 1, limit = 10) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const start = (p - 1) * l;
  const rows = items.slice(start, start + l);
  return {
    data: {
      rows,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / l)),
      page: p,
      limit: l,
    },
  };
};

const normalizeText = (v) => String(v ?? '').toLowerCase();

export const eventService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/events${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_EVENTS];

        if (filters.search) {
          const q = normalizeText(filters.search);
          data = data.filter((e) =>
            [e.event_name, e.event_type, e.location, e.audience, e.status]
              .some((f) => normalizeText(f).includes(q))
          );
        }

        if (filters.event_type) data = data.filter((e) => e.event_type === filters.event_type);
        if (filters.audience) data = data.filter((e) => e.audience === filters.audience);
        if (filters.status) data = data.filter((e) => e.status === filters.status);
        if (filters.from_date) data = data.filter((e) => e.date >= filters.from_date);
        if (filters.to_date) data = data.filter((e) => e.date <= filters.to_date);

        return paginateData(data, filters.page, filters.limit);
      }
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/events/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_EVENTS.find((e) => e.id === id) ?? null })
    ),

  create: (body) =>
    withFallback(
      () => api.post('/events', body).then((r) => r.data),
      () => ({ data: { ...body, id: `evt-${Date.now()}` } })
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/events/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } })
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/events/${id}`).then((r) => r.data),
      () => ({ data: { id } })
    ),

  sendSMS: (id) =>
    withFallback(
      () => api.post(`/events/${id}/send-sms`).then((r) => r.data),
      () => ({ data: { id, sms_sent: true } })
    ),

  bulkImport: (rows = []) =>
    withFallback(
      () => api.post('/events/import', { rows }).then((r) => r.data),
      () => ({ data: { imported: rows.length } })
    ),
};
