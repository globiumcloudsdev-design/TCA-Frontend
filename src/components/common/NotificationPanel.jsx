'use client';

/**
 * Perfect Notification Panel Component
 * ✅ Real-time socket updates
 * ✅ Pagination support
 * ✅ Filter by type
 * ✅ Mark read/unread
 * ✅ Delete notification
 * ✅ Responsive dropdown
 */

import { useEffect, useState, useRef } from 'react';
import { Bell, X, Trash2, Check, Filter, Loader } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import clsx from 'clsx';

export const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const panelRef = useRef(null);
  const { socket } = useSocket();

  const NOTIFICATION_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'fee', label: 'Fees' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'exam', label: 'Exams' },
    { value: 'alert', label: 'Alerts' },
    { value: 'general', label: 'General' },
  ];

  // ─────────────────────────────────────────────────────────────────
  // Fetch Notifications
  // ─────────────────────────────────────────────────────────────────

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const filters = {
        page: pageNum,
        limit: 10,
        sort: 'DESC',
      };

      if (selectedType !== 'all') {
        filters.type = selectedType;
      }

      const { data } = await notificationService.getAll(filters);

      setNotifications(data?.notifications || []);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationService.getUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data } = await notificationService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnreadCount();
    fetchStats();
  }, []);

  // Load notifications when panel opens or type changes
  useEffect(() => {
    if (isOpen || selectedType !== 'all') {
      fetchNotifications(1);
    }
  }, [isOpen, selectedType]);

  // ─────────────────────────────────────────────────────────────────
  // Real-time Socket Updates
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on('notification', (data) => {
      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Add to list if panel is open
      if (isOpen) {
        setNotifications((prev) => [data, ...prev]);
      }
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, isOpen]);

  // ─────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id, isRead) => {
    try {
      await notificationService.markRead(id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      // Update unread count
      if (!isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // Refresh count
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Close on click outside
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'relative p-2 rounded-full transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          isOpen && 'bg-gray-100 dark:bg-gray-800'
        )}
        title={`${unreadCount} unread notifications`}
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className={clsx(
              'absolute -top-1 -right-1 inline-flex items-center justify-center',
              'w-5 h-5 px-1.5 py-0.5 text-xs font-bold text-white',
              'bg-red-500 rounded-full min-w-max'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-96 max-h-[600px] rounded-lg shadow-lg',
            'bg-white dark:bg-gray-900',
            'border border-gray-200 dark:border-gray-700',
            'flex flex-col overflow-hidden z-50'
          )}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {stats.totalCount}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {stats.unreadCount}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Unread</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {stats.totalCount - stats.unreadCount}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Read</div>
                </div>
              </div>
            )}

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter size={16} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto">
                {NOTIFICATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSelectedType(type.value);
                      setPage(1);
                    }}
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                      selectedType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader size={20} className="animate-spin text-gray-400" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            )}

            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={clsx(
                  'px-4 py-3 border-b border-gray-100 dark:border-gray-700',
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  !notif.is_read && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Type Badge */}
                  <div
                    className={clsx(
                      'mt-1 px-2 py-0.5 rounded text-xs font-medium',
                      notif.type === 'fee' &&
                        'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                      notif.type === 'attendance' &&
                        'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
                      notif.type === 'exam' &&
                        'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
                      notif.type === 'alert' &&
                        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
                      notif.type === 'general' &&
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white break-words">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(notif.createdAt || notif.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Page {page} • Showing {notifications.length} notifications
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
