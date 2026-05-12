'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bell, Check, Loader, CreditCard, UserCheck, 
  FileText, AlertTriangle, Info, Calendar, CheckCheck, X 
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/hooks/useSocket';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 15;

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'fee', label: 'Fees' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'exam', label: 'Exams' },
  { value: 'alert', label: 'Alerts' },
  { value: 'general', label: 'General' },
];

function StatCard({ label, value, valueClass = 'text-slate-800 dark:text-slate-100' }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
      <span className={clsx('text-2xl font-black tabular-nums tracking-tight', valueClass)}>
        {value ?? '—'}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

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
  const scrollRef = useRef(null);
  const observerTarget = useRef(null);

  const fetchNotifications = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const filters = { page: pageNum, limit: PAGE_SIZE, sort: 'DESC' };
      if (selectedType !== 'all') filters.type = selectedType;

      const response = await notificationService.getAll(filters);
      const newNotifications = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || { pages: 1, page: 1 };

      setNotifications(prev => isLoadMore ? [...prev, ...newNotifications] : newNotifications);
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
    } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await notificationService.getStats();
      setStats(data);
    } catch {}
  }, []);

  // Initial Data Load
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchNotifications(1);
      fetchUnreadCount();
      fetchStats();
    }
  }, [fetchNotifications, fetchUnreadCount, fetchStats]);

  // Reset when filter changes
  useEffect(() => {
    if (initialLoadDone.current) {
      setNotifications([]);
      setCurrentPage(1);
      setTotalPages(1);
      fetchNotifications(1);
    }
  }, [selectedType, fetchNotifications]);

  // Socket listener
  useEffect(() => {
    if (!socket) return;
    const handle = (n) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(prev => prev + 1);
      fetchStats();
    };
    socket.on('notification', handle);
    return () => socket.off('notification', handle);
  }, [socket, fetchStats]);

  const hasMore = currentPage < totalPages;

  // Infinite Scroll Observer
  useEffect(() => {
    if (!observerTarget.current || loading || loadingMore || !hasMore) return;

    const options = {
      root: scrollRef.current,
      rootMargin: '200px',
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log('Sentinel intersected! Loading page:', currentPage + 1);
        fetchNotifications(currentPage + 1, true);
      }
    }, options);

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, currentPage, hasMore, fetchNotifications]);

  const handleMarkAsRead = async (id, isRead) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      fetchStats();
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      fetchStats();
    } catch {}
  };

  const onAccordionChange = (id) => {
    if (!id) return;
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.is_read) {
      handleMarkAsRead(id, false);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'fee': return <CreditCard size={18} className="text-emerald-500" />;
      case 'attendance': return <UserCheck size={18} className="text-blue-500" />;
      case 'exam': return <FileText size={18} className="text-purple-500" />;
      case 'alert': return <AlertTriangle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-white dark:bg-slate-950">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none">
            <Bell size={20} className="text-white dark:text-slate-900" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-[11px] font-bold text-blue-500 mt-1 uppercase tracking-wider">
                {unreadCount} New Messages
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <AnimatePresence>
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 px-6 pb-4"
          >
            <StatCard label="Total" value={stats.totalCount} />
            <StatCard label="Unread" value={stats.unreadCount} valueClass="text-blue-600" />
            <StatCard label="Read" value={(stats.totalCount ?? 0) - (stats.unreadCount ?? 0)} valueClass="text-emerald-600" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-10 border-y border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-6 py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {NOTIFICATION_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 whitespace-nowrap border',
                  selectedType === type.value
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
            >
              <CheckCheck size={14} />
              Mark All
            </button>
          )}
        </div>
      </div>

      {/* ── List with Infinite Scroll ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader size={32} className="animate-spin text-slate-200 dark:text-slate-700" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Bell size={32} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          </div>
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full" onValueChange={onAccordionChange}>
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <AccordionItem 
                    value={notif.id}
                    className={clsx(
                      "border-b border-slate-100 dark:border-slate-800 transition-all duration-300",
                      !notif.is_read ? "bg-blue-50/30 dark:bg-blue-500/5" : "bg-transparent"
                    )}
                  >
                    <div className="relative">
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}
                      <AccordionTrigger className="hover:no-underline py-5 px-6 group w-full text-left">
                        <div className="flex items-start gap-4 w-full">
                          <div className={clsx(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all group-hover:scale-105",
                            notif.type === 'fee' && "bg-emerald-50 border-emerald-100",
                            notif.type === 'attendance' && "bg-blue-50 border-blue-100",
                            notif.type === 'exam' && "bg-purple-50 border-purple-100",
                            notif.type === 'alert' && "bg-red-50 border-red-100",
                            "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-white/5"
                          )}>
                            {getNotifIcon(notif.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={clsx(
                                "font-bold text-[14px] tracking-tight transition-all",
                                !notif.is_read ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
                              )}>
                                {notif.title}
                              </h4>
                              {!notif.is_read && (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-data-[state=open]:hidden" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={clsx(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                                notif.type === 'fee' && "text-emerald-600 bg-emerald-50 border-emerald-100",
                                notif.type === 'attendance' && "text-blue-600 bg-blue-50 border-blue-100",
                                notif.type === 'exam' && "text-purple-600 bg-purple-50 border-purple-100",
                                notif.type === 'alert' && "text-red-600 bg-red-50 border-red-100",
                                "text-slate-500 bg-slate-50 border-slate-100 dark:bg-slate-800"
                              )}>
                                {notif.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 tabular-nums">
                                <Calendar size={10} />
                                {new Date(notif.createdAt || notif.created_at).toLocaleString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-6 pt-0">
                        <div className="pl-[3.75rem]">
                          <div className="p-5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full opacity-50" style={{ 
                              backgroundColor: notif.type === 'fee' ? '#10b981' : 
                                             notif.type === 'attendance' ? '#3b82f6' : 
                                             notif.type === 'exam' ? '#a855f7' : 
                                             notif.type === 'alert' ? '#ef4444' : '#94a3b8' 
                            }} />
                            
                            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {notif.body}
                            </p>
                            
                            <div className="mt-5 flex items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100/50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                <Check size={12} strokeWidth={3} />
                                Seen
                              </div>
                              <span className="text-[10px] font-bold text-slate-300 tabular-nums uppercase">
                                ID: {notif.id.toString().slice(-8)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
            
            {/* Infinite Scroll Sentinel */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <Loader size={16} className="animate-spin text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading More</span>
                </div>
              )}
              {!hasMore && notifications.length > 0 && (
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">End of List</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
            Showing {notifications.length} of {stats?.totalCount ?? notifications.length} Notifications
          </p>
        </div>
      )}
    </div>
  );
}