'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useStudentNotices } from '@/hooks/useStudentPortal';

const PRIORITIES = ['', 'high', 'medium', 'low'];

export default function StudentAnnouncementsPage() {
  const [priority, setPriority] = useState('');
  const { data: noticesRes, isLoading } = useStudentNotices(priority ? { priority } : {}, 1, 50);

  const notices = noticesRes?.data || [];

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-600" /> Announcements
        </h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRIORITIES.map((item) => (
          <button
            key={item || 'all'}
            onClick={() => setPriority(item)}
            className={`px-3 py-1.5 rounded-full text-sm border ${priority === item ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            {item ? item.toUpperCase() : 'ALL'}
          </button>
        ))}
      </div>

      {notices.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-slate-500">No announcements found.</div>
      ) : (
        <div className="space-y-3">
          {notices.map((item) => (
            <div key={item.id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">{item.priority || 'normal'}</span>
              </div>
              <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
