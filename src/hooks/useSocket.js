/**
 * useSocket — connects to the Socket.io server when user is authenticated.
 * Handles real-time notifications and system maintenance updates.
 */
'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '@/store/authStore';
import usePortalStore from '@/store/portalStore';
import useUiStore from '@/store/uiStore';
import { getAccessToken } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BellRing, ShieldAlert } from 'lucide-react';

let socketInstance = null;
let audioCtxInstance = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtxInstance) {
    audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtxInstance;
};

// Auto-resume AudioContext on first user interaction (bypasses browser autoplay policy)
if (typeof window !== 'undefined') {
  const resumeAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        console.log('🔊 [Socket Chime] AudioContext resumed successfully on user gesture!');
        cleanup();
      }).catch((e) => {
        console.warn('⚠️ [Socket Chime] Failed to resume AudioContext:', e.message);
      });
    } else if (ctx) {
      cleanup();
    }
  };

  const cleanup = () => {
    window.removeEventListener('click', resumeAudio);
    window.removeEventListener('keydown', resumeAudio);
    window.removeEventListener('touchstart', resumeAudio);
  };

  window.addEventListener('click', resumeAudio);
  window.addEventListener('keydown', resumeAudio);
  window.addEventListener('touchstart', resumeAudio);
}

// Premium double-tone synthesizer audio chime using the Web Audio API (Zero assets required)
const playChime = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const playNote = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.12);       // C5
    playNote(659.25, now + 0.08, 0.25); // E5
  } catch (e) {
    console.warn('[Socket Chime] Audio blocked by browser policy:', e.message);
  }
};

export function useSocket() {
  const isAuthAdmin = useAuthStore((s) => s.isAuthenticated);
  const portalUser = usePortalStore((s) => s.portalUser);
  const isAuthenticated = isAuthAdmin || !!portalUser;
  
  const incrementUnread = useUiStore((s) => s.incrementUnread);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (socketInstance) return; // already connected

    const token = getAccessToken();
    if (!token) return;

    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 10,
    });

    console.log('🔌 [Socket] Initializing real-time websocket connection...');

    // 1. Live Notification Handler
    socketInstance.on('notification', (data) => {
      console.log('📬 [Socket] Received notification:', data);
      incrementUnread();
      playChime();
      
      // Gorgeous popup notification with Sonner
      toast(data.title || 'New Notification', {
        description: data.body || 'You have received a new update.',
        icon: <BellRing className="w-5.5 h-5.5 text-indigo-500 animate-bounce" />,
        duration: 6000,
      });
    });

    // 2. Real-time Platform & Maintenance Updates Handler
    socketInstance.on('platform_settings:update', ({ key, value }) => {
      console.log(`⚡ [Socket] Live Platform Update Received: [${key}]`, value);
      
      // Update global platform status in React Query cache instantly!
      queryClient.setQueryData(['global-status-public'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            [key]: value
          }
        };
      });

      // Show real-time warnings to alert active users
      if (key === 'maintenance_mode' && value?.enabled) {
        playChime();
        toast.warning('System Maintenance Mode Activated', {
          description: value.message || 'The system is going under maintenance shortly.',
          icon: <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />,
          duration: 10000,
        });
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socketInstance.on('connect', () => {
      console.log('✅ [Socket] Connected successfully!');
    });

    return () => {
      if (socketInstance) {
        console.log('🔌 [Socket] Disconnecting real-time websocket session...');
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, [isAuthenticated, incrementUnread, queryClient]);

  return socketInstance;
}
