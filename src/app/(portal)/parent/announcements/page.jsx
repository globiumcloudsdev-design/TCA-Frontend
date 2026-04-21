// frontend/src/app/(portal)/parent/announcements/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { parentPortalService } from '@/services/parentPortalService';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const { user } = useAuthStore();
  const [children, setChildren] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const selectedChild = children[selectedChildIndex];

  // Fetch children list
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await parentPortalService.getChildren();
        const childrenList = res.data || res;
        setChildren(childrenList);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load children');
      }
    };
    if (user?.user_type === 'PARENT') {
      fetchChildren();
    }
  }, [user]);

  // Fetch announcements when child changes
  useEffect(() => {
    if (!selectedChild?.id) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await parentPortalService.getNoticesForChild(selectedChild.id, {
          type: categoryFilter !== 'all' ? categoryFilter : undefined
        });
        let data = res.data || res;
        if (data.data) data = data.data;
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [selectedChild, categoryFilter]);

  // Get unique categories from announcements
  const categories = ['all', ...new Set(announcements.map(a => a.category))];
  const filteredAnnouncements = categoryFilter === 'all'
    ? announcements
    : announcements.filter(a => a.category === categoryFilter);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!selectedChild) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">Important updates and notices from school administration</p>
      </div>

      {/* Child Selector (same as Fees page) */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedChildIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {child.first_name} {child.last_name}
            </button>
          ))}
        </div>
      )}

      {/* Child Info Card (same as Fees page) */}
      {selectedChild && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                {selectedChild.first_name} {selectedChild.last_name}
              </h2>
              <p className="text-sm text-slate-500">
                Reg: {selectedChild.registration_no} | Class: {selectedChild.class} | 
                Section: {selectedChild.section} | Roll: {selectedChild.roll_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat.toLowerCase())}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-slate-500">No announcements found</p>
          <p className="text-sm text-slate-400 mt-1">
            {selectedChild ? `No notices for ${selectedChild.first_name} at the moment` : 'Select a child to view announcements'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const isOpen = expandedId === ann.id;
            const catCls = CATEGORY_COLORS[ann.category] || CATEGORY_COLORS.General;
            const priCls = PRIORITY_BADGE[ann.priority] || PRIORITY_BADGE.low;

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-200 shadow-sm'
                }`}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-start gap-4"
                  onClick={() => toggleExpand(ann.id)}
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
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                    </div>
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