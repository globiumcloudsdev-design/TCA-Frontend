'use client';

import { useState } from 'react';
import { Bell, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import { DUMMY_ANNOUNCEMENTS } from '@/data/portalDummyData';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

const CATEGORY_COLORS = {
  Exam:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  Fee:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  Event:   'bg-violet-100 text-violet-700 border-violet-200',
  Meeting: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Holiday: 'bg-rose-100 text-rose-700 border-rose-200',
  General: 'bg-slate-100 text-slate-700 border-slate-200',
};

const PRIORITY_BADGE = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  low:    'bg-slate-50 text-slate-500 border border-slate-200',
};

export default function AnnouncementsPage() {
  const { portalUser } = usePortalStore();
  const t = getPortalTerms(portalUser?.institute_type);
  const [expanded, setExpanded] = useState('ann-001');
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(DUMMY_ANNOUNCEMENTS.map((a) => a.category)))];
  const filtered = filter === 'All' ? DUMMY_ANNOUNCEMENTS : DUMMY_ANNOUNCEMENTS.filter((a) => a.category === filter);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">Latest updates and notices from school administration.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcement cards */}
      <div className="space-y-3">
        {filtered.map((ann) => {
          const isOpen = expanded === ann.id;
          const catCls = CATEGORY_COLORS[ann.category] || CATEGORY_COLORS.General;
          const priCls = PRIORITY_BADGE[ann.priority] || PRIORITY_BADGE.low;

          return (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-200 shadow-sm'}`}
            >
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-4"
                onClick={() => setExpanded(isOpen ? null : ann.id)}
              >
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${catCls}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold ${isOpen ? 'text-indigo-700' : 'text-slate-900'} leading-tight`}>
                      {ann.title}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priCls}`}>
                      {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catCls}`}>
                      {ann.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {ann.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      {ann.author}
                    </span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="pl-[52px]">
                    <p className="text-sm text-slate-600 leading-relaxed">{ann.body}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
