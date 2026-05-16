'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Megaphone, X, Info, AlertTriangle, 
  CheckCircle, ShieldAlert, ChevronRight 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationService } from '@/services';
import { cn } from '@/lib/utils';

const ANNOUNCEMENT_STYLES = {
  info: { 
    icon: Info, 
    bg: 'bg-blue-600', 
    text: 'text-white', 
    bar: 'bg-blue-700',
    label: 'Platform Update'
  },
  warning: { 
    icon: AlertTriangle, 
    bg: 'bg-amber-500', 
    text: 'text-white', 
    bar: 'bg-amber-600',
    label: 'System Notice'
  },
  success: { 
    icon: CheckCircle, 
    bg: 'bg-emerald-600', 
    text: 'text-white', 
    bar: 'bg-emerald-700',
    label: 'Good News'
  },
  urgent: { 
    icon: ShieldAlert, 
    bg: 'bg-rose-600', 
    text: 'text-white', 
    bar: 'bg-rose-700',
    label: 'Urgent Alert'
  },
};

export default function GlobalAnnouncementBanner() {
  const [closedIds, setClosedIds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const { data: announcementsData } = useQuery({
    queryKey: ['active-global-announcements'],
    queryFn: () => notificationService.getGlobalAnnouncements(),
    refetchInterval: 1000 * 60 * 5, // Check every 5 minutes
  });

  const activeAnnouncements = (announcementsData?.data || [])
    .filter(a => !closedIds.includes(a.id));

  // Auto-slide logic
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);


  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIdx];
  const style = ANNOUNCEMENT_STYLES[current.type] || ANNOUNCEMENT_STYLES.info;
  const Icon = style.icon;

  const handleDismiss = (id) => {
    setClosedIds(prev => [...prev, id]);
    if (currentIdx >= activeAnnouncements.length - 1) {
      setCurrentIdx(0);
    }
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % activeAnnouncements.length);
  };

  return (
    <div className={cn(
      "relative overflow-hidden transition-all duration-500 shadow-md border-b border-black/5",
      style.bg, style.text
    )}>
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-xl hidden sm:flex items-center justify-center shadow-inner", style.bar)}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 bg-white/10 px-1.5 py-0.5 rounded">
                  {style.label}
                </span>
                <h4 className="font-bold text-sm truncate sm:text-base">{current.title}</h4>
             </div>
             <p className="text-xs opacity-90 truncate font-medium mt-0.5 sm:block hidden">
               {current.content}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeAnnouncements.length > 1 && (
            <button 
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-all text-[10px] font-bold uppercase tracking-wider"
            >
              Next ({currentIdx + 1}/{activeAnnouncements.length})
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          
          <button 
            onClick={() => handleDismiss(current.id)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Decorative pulse element */}
      <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
