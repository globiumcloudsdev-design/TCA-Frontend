/**
 * useSocket — connects to the Socket.io server when user is authenticated.
 * Handles real-time notifications.
 */
'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '@/store/authStore';
import useUiStore   from '@/store/uiStore';
import { getAccessToken } from '@/lib/auth';

let socketInstance = null;

export function useSocket() {
  const isAuthenticated   = useAuthStore((s) => s.isAuthenticated);
  const incrementUnread   = useUiStore((s) => s.incrementUnread);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (socketInstance) return; // already connected

    const token = getAccessToken();
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('notification', () => {
      incrementUnread();
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
  }, [isAuthenticated, incrementUnread]);

  return socketInstance;
}
