'use client';

import Link from 'next/link';
import {
  Briefcase, Users, FileText, ClipboardList,
  NotebookPen, UserCheck, Bell, BookOpen,
  TrendingUp, CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';
import { useTeacherDashboard } from '@/hooks/useTeacherPortal';
import useAuthStore from '@/store/authStore';

const QUICK_LINK_DEFS = [
  { key: 'classes',     href: '/teacher/classes',       icon: Briefcase,     bg: 'bg-blue-50',    ic: 'text-blue-600' },
  { key: 'students',    href: '/teacher/students',      icon: Users,         bg: 'bg-sky-50',     ic: 'text-sky-600' },
  { key: 'notes',       href: '/teacher/notes',         icon: FileText,      bg: 'bg-indigo-50',  ic: 'text-indigo-600' },
  { key: 'assignments', href: '/teacher/assignments',   icon: ClipboardList, bg: 'bg-violet-50',  ic: 'text-violet-600' },
  { key: 'homework',    href: '/teacher/homework',      icon: NotebookPen,   bg: 'bg-cyan-50',    ic: 'text-cyan-600' },
  { key: 'attendance',  href: '/teacher/attendance',    icon: UserCheck,     bg: 'bg-teal-50',    ic: 'text-teal-600' },
  { key: 'announcements',href: '/teacher/announcements', icon: Bell,         bg: 'bg-rose-50',    ic: 'text-rose-600' },
];

export default function TeacherOverview() {
  const { data, loading } = useTeacherDashboard();
  const user = useAuthStore((state) => state.user);
  const teacher = data?.teacher || {};
  const classes = data?.my_classes || [];
  const students = data?.my_students || [];
  const assignments = data?.recent_assignments || [];
  const pendingWork = data?.pending_work || [];
  const todaySchedule = data?.today_schedule || [];
  const recentActivity = data?.recent_activity || [];
  const t = getPortalTerms(user?.institute_type || 'school');
  
  console.log('Dashboard data:', data);

  const QUICK_LINKS = QUICK_LINK_DEFS.map((ql) => ({ ...ql, label: t.nav[ql.key] || ql.key }));

  const stats = data?.statistics || {};
  const activeAssignments = assignments.filter((a) => a.is_published || a.status === 'published');
  const recentWork = assignments.slice(0, 5);

  const resolveClassSectionLabel = (item) => {
    const cls = classes.find((c) => (c.class_id || c.id) === item.class_id);
    const className = item.class_name || cls?.class_name || cls?.name || item.class || t.classLabel;

    if (item.section_name) {
      return `${className} - ${item.section_name}`;
    }

    const sectionId = item.section_id;
    if (sectionId && cls?.sections?.length) {
      const section = cls.sections.find((s) => s.id === sectionId);
      if (section?.name) {
        return `${className} - ${section.name}`;
      }
    }

    return className;
  };

  const formatWorkType = (type) => {
    const value = String(type || 'assignment').toLowerCase();
    if (value === 'homework') return t.homeworkLabel;
    if (value === 'project') return t.notesLabel;
    return t.assignmentsLabel.slice(0, -1) || 'Assignment';
  };

  const typeBadgeClass = (type) => {
    const value = String(type || 'assignment').toLowerCase();
    if (value === 'homework') return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (value === 'project') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (value === 'quiz') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-violet-100 text-violet-700 border-violet-200';
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Briefcase className="w-32 h-32" />
        </div>
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0">
            {teacher.first_name?.[0]}
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Welcome back,</p>
            <h1 className="text-2xl font-extrabold">{teacher.first_name} {teacher.last_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">{teacher.details?.designation || teacher.role || 'Teacher'}</Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs">{teacher.details?.department || 'Academics'}</Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs">{teacher.details?.branch || 'Main Campus'}</Badge>
            </div>
          </div>
        </div>
        {/* Attendance status */}
        <div className={`relative mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${teacher.attendance_marked_today ? 'bg-emerald-500/30 text-white' : 'bg-amber-500/30 text-white'}`}>
          {todaySchedule.length > 0
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Student attendance marked today</>
            : <><AlertCircle className="w-3.5 h-3.5" /> Student attendance not marked yet today</>
          }
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t.nav.classes,     value: stats.total_classes || classes.length || 0, icon: Briefcase,  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: `Total ${t.studentsLabel}`, value: stats.total_students || students.length || 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: `Total Work Items`, value: stats.total_assignments || assignments.length || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: `Active ${t.assignmentsLabel}`, value: activeAssignments.length, icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((ql) => {
            const Icon = ql.icon;
            return (
              <Link
                key={ql.href}
                href={ql.href}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${ql.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${ql.ic}`} />
                </div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{ql.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* My Classes mini */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">My Assigned {t.classesLabel}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(classes || []).map((cls) => (
            <div key={cls.id || cls.class_id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                {(cls.class_name || cls.name || 'C').split(' ')[1] || 'C'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{cls.class_name || cls.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{cls.total_students || cls.student_count || 0} {t.studentsLabel.toLowerCase()}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {(cls.sections || []).map((section) => section.name).filter(Boolean).join(', ') || 'No section mapped'}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(cls.subjects || []).map((sub) => (
                    <span key={sub} className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Today's Teaching Schedule</h2>
          <Link href="/teacher/timetable" className="text-xs text-blue-600 font-semibold hover:underline">Open timetable</Link>
        </div>
        {todaySchedule.length === 0 ? (
          <p className="text-sm text-slate-500">No periods scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.slice(0, 4).map((slot) => (
              <div key={slot.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{slot.subject || 'Subject'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{slot.time || `${slot.start_time} - ${slot.end_time}`} · {slot.class || t.classLabel}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent assignments / homework / notes */}
      {recentWork.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Recent Work Given</h2>
            <Link href="/teacher/assignments" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {recentWork.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <NotebookPen className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeClass(item.type)}`}>
                      {formatWorkType(item.type)}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.subject || 'General'}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {resolveClassSectionLabel(item)}
                    {item.due_date ? ` · Due ${item.due_date}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending work + activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Pending Review</h2>
          {pendingWork.length === 0 ? (
            <p className="text-sm text-slate-500">No pending submissions right now.</p>
          ) : (
            <div className="space-y-2">
              {pendingWork.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.subject || 'General'} · {item.pending_count || 0} pending</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.time || 'Just now'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teacher info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">My Information</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Full Name',    value: `${teacher.first_name} ${teacher.last_name}` },
            { label: 'Designation', value: teacher.details?.designation || teacher.role },
            { label: 'Department',  value: teacher.details?.department },
            // { label: 'Campus',      value: teacher.details?.branch || 'Main Campus' },
            { label: 'Phone',       value: teacher.phone },
            { label: 'Email',       value: teacher.email },
          ].map((info) => (
            <div key={info.label} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{info.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{info.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
