// // /**
// //  * NotificationBell — Bell icon with unread count badge
// //  * ─────────────────────────────────────────────────────────────────
// //  * Connects to uiStore for unread count.
// //  * Clicking opens a simple notification dropdown (extend later).
// //  *
// //  * Props:
// //  *   onClick  () => void   optional click override
// //  *
// //  * Usage:
// //  *   <NotificationBell />
// //  */
// // 'use client';

// // import { Bell } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import useUiStore from '@/store/uiStore';

// // export default function NotificationBell({ onClick }) {
// //   const unreadCount = useUiStore((s) => s.unreadCount);

// //   return (
// //     <Button
// //       variant="ghost"
// //       size="icon"
// //       className="relative"
// //       onClick={onClick}
// //       aria-label="Notifications"
// //     >
// //       <Bell size={18} />
// //       {unreadCount > 0 && (
// //         <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
// //           {unreadCount > 9 ? '9+' : unreadCount}
// //         </span>
// //       )}
// //     </Button>
// //   );
// // }


// 'use client';
// import { useState } from 'react';
// import { Bell } from 'lucide-react';
// import AppModal from '@/components/common/AppModal';
// import { NotificationContent } from './NotificationContent';
// import { Button } from '../ui/button';

// export default function NotificationBell() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <>
//       <Button
//         onClick={() => setIsModalOpen(true)}
//         variant="ghost"
//         size="icon"
//         className="relative"
//         aria-label="Notifications"     
//   >
//         <Bell size={20} className="text-gray-700 dark:text-gray-300" />
//       {/* Badge logic yahan bhi add kar sakte ho – ya phir NotificationContent se fetch karke */}
//     </Button >

//       <AppModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Notifications"
//         size="xl"
//       >
//         <NotificationContent onClose={() => setIsModalOpen(false)} />
//       </AppModal>
//     </>
//   );
// }






'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppModal from '@/components/common/AppModal';
import { NotificationContent } from './NotificationContent';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import useUiStore from '@/store/uiStore';

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { unreadCount: globalUnreadCount, incrementUnread, resetUnread } = useUiStore();
  const socket = useSocket();

  // Fetch unread count on mount & when modal closes (to refresh)
  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationService.getUnreadCount();
      const count = data?.count || 0;
      setUnreadCount(count);
      // Optional: sync with global store if needed
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Listen for real-time notifications to update badge
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification', handleNewNotification);
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket]);

  // When modal opens, we can optionally mark as read later, but we just show
  // When modal closes, refresh badge count
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchUnreadCount(); // refresh badge after closing (user might have read some)
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <AppModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Notifications"
        description="Your recent notifications"
        size="xl"
      >
        <NotificationContent onClose={handleModalClose} />
      </AppModal>
    </>
  );
}