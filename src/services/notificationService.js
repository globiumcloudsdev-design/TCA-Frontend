/**
 * Notification API Service (Perfect Edition)
 *
 * ✅ GET    /notifications (with filters & pagination)
 * ✅ GET    /notifications/unread-count
 * ✅ GET    /notifications/stats
 * ✅ PATCH  /notifications/:id/read
 * ✅ PATCH  /notifications/mark-all-read
 * ✅ DELETE /notifications/:id
 * ✅ DELETE /notifications/cleanup-old
 * ✅ POST   /notifications/send (send to specific user)
 * ✅ POST   /notifications/broadcast (broadcast to multiple users)
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_NOTIFICATIONS, paginate } from '@/data/dummyData';

/**
 * Inbox (real backend only: no demo/dummy fallback, so the bell never shows fake items)
 * @param {Object} filters - { is_read, type, page, limit, sort }
 */
export const getAll = (filters = {}) => api.get('/notifications', { params: filters }).then((r) => r.data);

/** Count of unread notifications -> { data: { count } } */
export const getUnreadCount = () => api.get('/notifications/unread-count').then((r) => r.data);

/** Notification statistics */
export const getStats = () => api.get('/notifications/stats').then((r) => r.data);

/** Mark a single notification as read */
export const markRead = (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data);

/** Mark all notifications as read */
export const markAllRead = () => api.patch('/notifications/mark-all-read').then((r) => r.data);

/**
 * Admin composer: POST /notifications/send
 * @param {{ title: string, body: string, audience: object, data?: object }} payload  (see lib/notificationAudience.js)
 */
export const sendToAudience = (payload) => api.post('/notifications/send', payload).then((r) => r.data);

/** Recipient count before sending -> { data: { count, by_role } } */
export const previewAudience = (audience) => api.post('/notifications/audience/preview', { audience }).then((r) => r.data);

/**
 * Delete a notification
 */
export const deleteNotification = (id) =>
  withFallback(
    () => api.delete(`/notifications/${id}`).then((r) => r.data),
    () => ({ data: { id, deleted: true } })
  );

/**
 * Clean up old read notifications
 * @param {Number} daysOld - Delete notifications older than X days (default: 30)
 */
export const cleanupOldNotifications = (daysOld = 30) =>
  withFallback(
    () =>
      api
        .delete('/notifications/cleanup-old', {
          params: { daysOld },
        })
        .then((r) => r.data),
    () => ({ data: { deleted: 0 } })
  );

/**
 * Send notification to specific user
 * @param {Object} data - { user_id, title, body, type?, channel?, data? }
 */
export const sendNotification = (data) =>
  withFallback(
    () => api.post('/notifications/send', data).then((r) => r.data),
    () => ({ data: { ...data, id: Math.random().toString() } })
  );

/**
 * Broadcast notification to multiple users
 * @param {Object} data - { recipient_type, title, body, type?, channel?, data?, branch_id? }
 */
export const broadcastNotification = (data) =>
  withFallback(
    () => api.post('/notifications/broadcast', data).then((r) => r.data),
    () => ({ data: { ...data, count: 10, notificationIds: [] } })
  );

/**
 * Get active global announcements for the current institute
 */
export const getGlobalAnnouncements = () =>
  withFallback(
    () => api.get('/notifications/global').then((r) => r.data),
    () => ({ data: [] })
  );

export const notificationService = {
  getAll,
  getUnreadCount,
  getStats,
  markRead,
  markAllRead,
  delete: deleteNotification,
  deleteNotification,
  cleanupOld: cleanupOldNotifications,
  send: sendNotification,
  sendToAudience,
  previewAudience,
  broadcast: broadcastNotification,
  getGlobalAnnouncements,
};
