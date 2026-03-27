'use client';

import Link from 'next/link';
import { Calendar, DollarSign, BookOpen, ClipboardList, Bell, UserCircle } from 'lucide-react';
import { useStudentDashboard, useStudentProfile } from '@/hooks/useStudentPortal';

export default function StudentOverview() {
  const { data: dashboardRes, isLoading: dashboardLoading } = useStudentDashboard();
  const { data: profileRes, isLoading: profileLoading } = useStudentProfile();

  const dashboard = dashboardRes?.data || {};
  const profile = profileRes?.data || {};
  const activeSession = profile.active_academic_session || {};

  const displayClass = activeSession.class_name || profile.class_name || '-';
  const displaySection = activeSession.section_name || profile.section_name || '-';
  const displayRoll = activeSession.roll_no || profile.roll_number || '-';

  if (dashboardLoading || profileLoading) {
    return <div className="max-w-5xl mx-auto text-sm text-slate-500">Loading student portal...</div>;
  }

  const todayClasses = dashboard.today_classes || [];
  const assignments = dashboard.upcoming_assignments || [];
  const feeStatus = dashboard.fee_status || {};
  const attendance = dashboard.recent_attendance || {};
  const results = dashboard.recent_results || [];
  const notices = dashboard.notices || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <UserCircle className="w-10 h-10 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.name || 'Student Dashboard'}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Class: {displayClass} | Section: {displaySection} | Roll: {displayRoll}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${attendance.percentage ?? 0}%`} icon={Calendar} />
        <StatCard label="Upcoming Assignments" value={assignments.length} icon={ClipboardList} />
        <StatCard label="Pending Fees" value={feeStatus.due_count ?? 0} icon={DollarSign} />
        <StatCard label="Recent Results" value={results.length} icon={BookOpen} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Today Classes</h2>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No classes for today.</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.slice(0, 5).map((item) => (
                <div key={item.id || `${item.subject}-${item.time}`} className="text-sm p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-800">{item.subject}</p>
                  <p className="text-slate-500">{item.time} | {item.teacher || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Announcements</h2>
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No announcements available.</p>
          ) : (
            <div className="space-y-2">
              {notices.slice(0, 5).map((item) => (
                <div key={item.id} className="text-sm p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-slate-500">{item.date || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickLink href="/student/attendance" icon={Calendar} label="Attendance" />
        <QuickLink href="/student/assignments" icon={ClipboardList} label="Assignments" />
        <QuickLink href="/student/fees" icon={DollarSign} label="Fees" />
        <QuickLink href="/student/announcements" icon={Bell} label="Announcements" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <Icon className="w-5 h-5 text-emerald-600 mb-2" />
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="bg-white border rounded-xl p-4 hover:border-emerald-300 transition-colors">
      <Icon className="w-5 h-5 text-emerald-600 mb-2" />
      <p className="text-sm font-semibold text-slate-800">{label}</p>
    </Link>
  );
}
