// // components/common/NotificationContent.jsx

// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { Bell, Trash2, Check, Filter, Loader, X } from 'lucide-react';
// import { notificationService } from '@/services/notificationService';
// import { useSocket } from '@/hooks/useSocket';
// import clsx from 'clsx';

// export function NotificationContent({ onClose }) {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [selectedType, setSelectedType] = useState('all');
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState(null);
//   const socket = useSocket();

//   const NOTIFICATION_TYPES = [
//     { value: 'all', label: 'All' },
//     { value: 'fee', label: 'Fees' },
//     { value: 'attendance', label: 'Attendance' },
//     { value: 'exam', label: 'Exams' },
//     { value: 'alert', label: 'Alerts' },
//     { value: 'general', label: 'General' },
//   ];

//   const fetchNotifications = useCallback(async (pageNum = 1) => {
//     setLoading(true);
//     try {
//       const filters = { page: pageNum, limit: 10, sort: 'DESC' };
//       if (selectedType !== 'all') filters.type = selectedType;
//       const { data } = await notificationService.getAll(filters);
//       setNotifications(data || []);
//       setPage(pageNum);
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedType]);

//   const fetchUnreadCount = useCallback(async () => {
//     try {
//       const { data } = await notificationService.getUnreadCount();
//       setUnreadCount(data?.count || 0);
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   const fetchStats = useCallback(async () => {
//     try {
//       const { data } = await notificationService.getStats();
//       setStats(data);
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUnreadCount();
//     fetchStats();
//   }, [fetchUnreadCount, fetchStats]);

//   useEffect(() => {
//     fetchNotifications(1);
//   }, [selectedType, fetchNotifications]);

//   // Real-time via socket (custom event)
//   useEffect(() => {
//     const handleNewNotification = (event) => {
//       const newNotif = event.detail;
//       setNotifications(prev => [newNotif, ...prev]);
//       setUnreadCount(prev => prev + 1);
//       fetchStats(); // refresh stats
//     };
//     window.addEventListener('new-notification', handleNewNotification);
//     return () => window.removeEventListener('new-notification', handleNewNotification);
//   }, [fetchStats]);

//   const handleMarkAsRead = async (id, isRead) => {
//     try {
//       await notificationService.markRead(id);
//       setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
//       if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
//       fetchStats();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await notificationService.deleteNotification(id);
//       setNotifications(prev => prev.filter(n => n.id !== id));
//       fetchUnreadCount();
//       fetchStats();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await notificationService.markAllRead();
//       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       fetchStats();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Header with close button for modal */}
//       <div className="flex items-center justify-between border-b p-4">
//         <h3 className="text-lg font-semibold">Notifications</h3>
//         {onClose && (
//           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       {/* Stats */}
//       {stats && (
//         <div className="grid grid-cols-3 gap-2 p-4 text-xs border-b">
//           <div className="bg-gray-50 p-2 rounded text-center">
//             <div className="font-semibold">{stats.totalCount}</div>
//             <div>Total</div>
//           </div>
//           <div className="bg-blue-50 p-2 rounded text-center">
//             <div className="font-semibold text-blue-600">{stats.unreadCount}</div>
//             <div>Unread</div>
//           </div>
//           <div className="bg-green-50 p-2 rounded text-center">
//             <div className="font-semibold text-green-600">{stats.totalCount - stats.unreadCount}</div>
//             <div>Read</div>
//           </div>
//         </div>
//       )}

//       {/* Filters + Mark all read */}
//       <div className="border-b p-4">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2 overflow-x-auto">
//             <Filter size={16} className="text-gray-500 shrink-0" />
//             {NOTIFICATION_TYPES.map(type => (
//               <button
//                 key={type.value}
//                 onClick={() => setSelectedType(type.value)}
//                 className={clsx(
//                   'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
//                   selectedType === type.value
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 )}
//               >
//                 {type.label}
//               </button>
//             ))}
//           </div>
//           {unreadCount > 0 && (
//             <button
//               onClick={handleMarkAllAsRead}
//               className="text-xs text-blue-600 hover:underline"
//             >
//               Mark all read
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Notifications list */}
//       <div className="flex-1 overflow-y-auto">
//         {loading && (
//           <div className="flex justify-center py-12">
//             <Loader className="animate-spin text-gray-400" size={24} />
//           </div>
//         )}
//         {!loading && notifications.length === 0 && (
//           <div className="flex flex-col items-center py-12 text-gray-400">
//             <Bell size={40} className="mb-2 opacity-30" />
//             <p className="text-sm">No notifications</p>
//           </div>
//         )}
//         {notifications.map(notif => (
//           <div
//             key={notif.id}
//             className={clsx(
//               'px-4 py-3 border-b hover:bg-gray-50 transition-colors',
//               !notif.is_read && 'bg-blue-50'
//             )}
//           >
//             <div className="flex items-start gap-3">
//               <span className={clsx(
//                 'mt-0.5 px-2 py-0.5 rounded text-xs font-medium capitalize',
//                 notif.type === 'fee' && 'bg-green-100 text-green-700',
//                 notif.type === 'attendance' && 'bg-blue-100 text-blue-700',
//                 notif.type === 'exam' && 'bg-purple-100 text-purple-700',
//                 notif.type === 'alert' && 'bg-red-100 text-red-700',
//                 'bg-gray-100 text-gray-700'
//               )}>
//                 {notif.type}
//               </span>
//               <div className="flex-1 min-w-0">
//                 <div className="flex justify-between items-start gap-2">
//                   <h4 className="font-semibold text-sm">{notif.title}</h4>
//                   {!notif.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />}
//                 </div>
//                 <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.body}</p>
//                 <div className="text-xs text-gray-400 mt-1">
//                   {new Date(notif.createdAt || notif.created_at).toLocaleString()}
//                 </div>
//               </div>
//               <div className="flex gap-1 shrink-0">
//                 {!notif.is_read && (
//                   <button
//                     onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
//                     className="p-1 text-gray-500 hover:text-blue-600"
//                     title="Mark as read"
//                   >
//                     <Check size={14} />
//                   </button>
//                 )}
//                 <button
//                   onClick={() => handleDelete(notif.id)}
//                   className="p-1 text-gray-500 hover:text-red-600"
//                   title="Delete"
//                 >
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pagination footer */}
//       {notifications.length > 0 && (
//         <div className="border-t p-3 text-center text-xs text-gray-500">
//           Page {page} • {notifications.length} notifications
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, Trash2, Check, Filter, Loader, ChevronDown } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

export function NotificationContent({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState(null);
  const socket = useSocket();
  const initialLoadDone = useRef(false);

  const NOTIFICATION_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'fee', label: 'Fees' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'exam', label: 'Exams' },
    { value: 'alert', label: 'Alerts' },
    { value: 'general', label: 'General' },
  ];

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const filters = {
        page: pageNum,
        limit: 100,
        sort: 'DESC',
      };
      if (selectedType !== 'all') filters.type = selectedType;

      const response = await notificationService.getAll(filters);
      // API response structure:
      // { success: true, data: [...], pagination: { page, limit, total, pages } }
      const newNotifications = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || { pages: 1, page: 1 };

      if (isLoadMore) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setCurrentPage(pagination.page);
      setTotalPages(pagination.pages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedType]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationService.getUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await notificationService.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchNotifications(1);
      fetchUnreadCount();
      fetchStats();
    }
  }, [fetchNotifications, fetchUnreadCount, fetchStats]);

  // When filter changes, reset everything
  useEffect(() => {
    if (initialLoadDone.current) {
      setNotifications([]);
      setCurrentPage(1);
      setTotalPages(1);
      fetchNotifications(1);
    }
  }, [selectedType, fetchNotifications]);

  // Real-time socket update
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      fetchStats();
    };

    socket.on('notification', handleNewNotification);
    return () => socket.off('notification', handleNewNotification);
  }, [socket, fetchStats]);

  const handleMarkAsRead = async (id, isRead) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const loadMore = () => {
    if (currentPage >= totalPages || loadingMore) return;
    fetchNotifications(currentPage + 1, true);
  };

  const hasMore = currentPage < totalPages;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header - already AppModal provides title, so we keep only close button? But user wants title, so we keep it simple */}
      {/* Actually AppModal already shows title, so we don't need duplicate header. But we need close button? AppModal has its own close X. So we can remove internal header. */}
      {/* However to be safe and consistent, we remove duplicate header and rely on AppModal's header. */}
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 p-4 border-b bg-gray-50 dark:bg-gray-800/50">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
            <div className="text-xl font-bold">{stats.totalCount}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
            <div className="text-xl font-bold text-blue-600">{stats.unreadCount}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
            <div className="text-xl font-bold text-green-600">{stats.totalCount - stats.unreadCount}</div>
            <div className="text-xs text-muted-foreground">Read</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border-b px-4 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={16} className="text-muted-foreground shrink-0" />
            <div className="flex gap-1.5">
              {NOTIFICATION_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                    selectedType === type.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-7">
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-muted-foreground" size={28} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Bell size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={clsx(
                  'px-5 py-4 transition-colors hover:bg-accent/50',
                  !notif.is_read && 'bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={clsx(
                      'mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                      notif.type === 'fee' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      notif.type === 'attendance' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      notif.type === 'exam' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                      notif.type === 'alert' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    )}
                  >
                    {notif.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">{notif.title}</h4>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.body}</p>
                    <div className="text-xs text-muted-foreground/70 mt-1.5">
                      {new Date(notif.createdAt || notif.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && notifications.length > 0 && hasMore && (
          <div className="py-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore} className="gap-2">
              {loadingMore ? <Loader className="animate-spin" size={14} /> : <ChevronDown size={14} />}
              {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && !loading && (
        <div className="border-t px-5 py-2.5 text-center text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900/50">
          Showing {notifications.length} of {stats?.totalCount || notifications.length}
        </div>
      )}
    </div>
  );
}