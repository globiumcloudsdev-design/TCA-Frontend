/**
 * Notification API Service
 * GET    /notifications
 * PATCH  /notifications/:id/read
 * PATCH  /notifications/read-all
 * DELETE /notifications/:id
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_NOTIFICATIONS, paginate } from '@/data/dummyData';

export const notificationService = {
  // filters: { user_id, is_read, type, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get('/notifications', { params: filters }).then((r) => r.data),
      () => {
        let data = [...DUMMY_NOTIFICATIONS];
        if (filters.is_read !== undefined)
          data = data.filter((n) => n.is_read === (filters.is_read === 'true' || filters.is_read === true));
        if (filters.type)
          data = data.filter((n) => n.type === filters.type);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getUnreadCount: () =>
    withFallback(
      () => api.get('/notifications/unread-count').then((r) => r.data),
      () => ({ data: { count: DUMMY_NOTIFICATIONS.filter((n) => !n.is_read).length } }),
    ),

  markRead: (id) =>
    withFallback(
      () => api.patch(`/notifications/${id}/read`).then((r) => r.data),
      () => ({ data: { id, is_read: true } }),
    ),

  markAllRead: () =>
    withFallback(
      () => api.patch('/notifications/read-all').then((r) => r.data),
      () => ({ data: { updated: DUMMY_NOTIFICATIONS.length } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/notifications/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),
};
