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
 * Get all notifications for current user with optional filters
 * @param {Object} filters - { is_read, type, page, limit, sort }
 */
export const getAll = (filters = {}) =>
  withFallback(
    () => api.get('/notifications', { params: filters }).then((r) => r.data),
    () => {
      let data = [...DUMMY_NOTIFICATIONS];
      
      // Filter by read status
      if (filters.is_read !== undefined) {
        const isRead = filters.is_read === 'true' || filters.is_read === true;
        data = data.filter((n) => n.is_read === isRead);
      }
      
      // Filter by type
      if (filters.type) {
        data = data.filter((n) => n.type === filters.type);
      }
      
      // Sort
      const sort = filters.sort === 'ASC' ? 'ASC' : 'DESC';
      data.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.created_at).getTime();
        const timeB = new Date(b.createdAt || b.created_at).getTime();
        return sort === 'DESC' ? timeB - timeA : timeA - timeB;
      });
      
      return paginate(data, filters.page, filters.limit);
    }
  );

/**
 * Get count of unread notifications
 */
export const getUnreadCount = () =>
  withFallback(
    () => api.get('/notifications/unread-count').then((r) => r.data),
    () => ({
      data: {
        count: DUMMY_NOTIFICATIONS.filter((n) => !n.is_read).length,
      },
    })
  );

/**
 * Get notification statistics
 */
export const getStats = () =>
  withFallback(
    () => api.get('/notifications/stats').then((r) => r.data),
    () => {
      const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => !n.is_read).length;
      const byType = {};
      DUMMY_NOTIFICATIONS.forEach((n) => {
        byType[n.type] = (byType[n.type] || 0) + 1;
      });
      return {
        data: {
          unreadCount,
          totalCount: DUMMY_NOTIFICATIONS.length,
          byType,
        },
      };
    }
  );

/**
 * Mark single notification as read
 */
export const markRead = (id) =>
  withFallback(
    () => api.patch(`/notifications/${id}/read`).then((r) => r.data),
    () => ({ data: { id, is_read: true } })
  );

/**
 * Mark all notifications as read
 */
export const markAllRead = () =>
  withFallback(
    () => api.patch('/notifications/mark-all-read').then((r) => r.data),
    () => ({ data: { updated: DUMMY_NOTIFICATIONS.length } })
  );

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

export const notificationService = {
  getAll,
  getUnreadCount,
  getStats,
  markRead,
  markAllRead,
  delete: deleteNotification,
  cleanupOld: cleanupOldNotifications,
  send: sendNotification,
  broadcast: broadcastNotification,
};
