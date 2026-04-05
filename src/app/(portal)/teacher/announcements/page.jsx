'use client';

import { useState } from 'react';
import { Bell, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { useTeacherNotices } from '@/hooks/useTeacherPortal';
import useAuthStore from '@/store/authStore';

const CATEGORY_COLORS = {
  Exam: 'bg-violet-100 text-violet-700',
  Fee: 'bg-emerald-100 text-emerald-700',
  Event: 'bg-blue-100   text-blue-700',
  Meeting: 'bg-amber-100  text-amber-700',
  Holiday: 'bg-pink-100   text-pink-700',
  General: 'bg-slate-100  text-slate-600',
};

const PRIORITY_COLORS = {
  high: 'bg-red-100   text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-500',
};

export default function TeacherAnnouncementsPage() {
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  const { notices, loading } = useTeacherNotices(50);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const categoryOptions = ['All', ...new Set(notices.map((n) => n.category || 'General'))];

  const filtered = activeCategory === 'All'
    ? notices
    : notices.filter((a) => (a.category || 'General') === activeCategory);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" /> {t.announcementsLabel}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Latest notices and important updates from administration</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-slate-500">Loading announcements...</div>}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No announcements in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ann) => {
            const isOpen = expanded === ann.id;
            return (
              <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(ann.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[ann.category] || 'bg-slate-100 text-slate-600'}`}>
                        {ann.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ann.priority] || ''}`}>
                        {ann.priority?.toUpperCase()} priority
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{ann.title}</p>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {ann.date}
                      </span>
                      {ann.author && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {ann.author}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed mt-3 whitespace-pre-line">
                      {ann.content || ann.body || ann.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
