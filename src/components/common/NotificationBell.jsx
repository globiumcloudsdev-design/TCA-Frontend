'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppModal from '@/components/common/AppModal';
import { NotificationContent } from './NotificationContent';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import useUiStore from '@/store/uiStore';

export default function NotificationBell({ onClick }) {
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

  // When modal closes, refresh badge count
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchUnreadCount();
  };

  return (
    <>
      <Button
        onClick={(e) => {
          if (typeof onClick === 'function') onClick(e);
          setIsModalOpen(true);
        }}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
        data-testid="notification-bell"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isModalOpen && (
        <AppModal
          open={isModalOpen}
          onClose={handleModalClose}
          title="Notifications"
          description="Your recent notifications"
          size="xl"
        >
          <NotificationContent onClose={handleModalClose} />
        </AppModal>
      )}
    </>
  );
}