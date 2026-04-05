'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Calendar, DollarSign, BookOpen, Bell,
  CheckCircle, AlertCircle, Clock, TrendingUp, ChevronRight,
  GraduationCap, Phone, MapPin,
} from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_PARENTS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getStatusColor(status) {
  switch (status) {
    case 'paid':    return 'text-emerald-600 bg-emerald-50';
    case 'pending': return 'text-amber-600 bg-amber-50';
    case 'overdue': return 'text-red-600 bg-red-50';
    case 'partial': return 'text-orange-600 bg-orange-50';
    default:        return 'text-slate-600 bg-slate-50';
  }
}

function ChildCard({ child, index, t }) {
  const attendance = child.attendance;
  const latestFees = child.fees?.slice(-2) || [];
  const latestResult = child.results?.[0];
  const hasPending = latestFees.some((f) => f.status !== 'paid');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`p-5 ${index === 0 ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-gradient-to-r from-violet-600 to-purple-600'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
              {child.first_name[0]}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{child.first_name} {child.last_name}</h3>
              <p className="text-sm text-white/75">{child.class_name}</p>
              <p className="text-xs text-white/60">{t.rollLabel} {child.roll_no || child.roll_number}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs">Active</Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-4 text-center">
          <p className="text-xl font-extrabold text-indigo-600">{attendance?.percentage ?? '--'}%</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.attendanceLabel}</p>
        </div>
        <div className="p-4 text-center">
          <p className={`text-xl font-extrabold ${hasPending ? 'text-amber-600' : 'text-emerald-600'}`}>
            {hasPending ? 'Pending' : 'Clear'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{t.feeLabel} Status</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xl font-extrabold text-violet-600">
            {latestResult ? `${latestResult.percentage}%` : 'N/A'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Last {t.resultLabel}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <Link href="/parent/attendance" className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          View {t.attendanceLabel}
        </Link>
        <Link href="/parent/fees" className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
          <DollarSign className="w-3.5 h-3.5" />
          {t.feesLabel}
        </Link>
        <Link href="/parent/results" className="flex items-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          {t.resultsLabel}
        </Link>
        <Link href="/parent/announcements" className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors">
          <Bell className="w-3.5 h-3.5" />
          {t.announcementsLabel}
        </Link>
      </div>
    </div>
  );
}

export default function ParentOverview() {
  const { portalUser } = usePortalStore();
  const parent = portalUser || DUMMY_PARENTS[0];
  const t = getPortalTerms(parent?.institute_type);
  const children = parent.children || [];

  // Aggregate stats across all children
  const totalFeesPending = children.flatMap((c) => c.fees || []).filter((f) => f.status !== 'paid').length;
  const avgAttendance = children.length
    ? Math.round(children.reduce((sum, c) => sum + (c.attendance?.percentage || 0), 0) / children.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10">
          <GraduationCap className="w-full h-full" />
        </div>
        <div className="relative">
          <p className="text-sm text-white/70 mb-1">Welcome back,</p>
          <h1 className="text-2xl font-extrabold">{parent.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <Users className="w-4 h-4" />
              {children.length} child{children.length !== 1 ? 'ren' : ''} enrolled
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <Phone className="w-4 h-4" />
              {parent.phone}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="w-4 h-4" />
              Main Campus, The Clouds Academy
            </span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Children Enrolled', value: children.length, icon: Users, color: 'indigo', bg: 'bg-indigo-50', ic: 'text-indigo-600' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: Calendar, color: 'cyan', bg: 'bg-cyan-50', ic: 'text-cyan-600' },
          { label: 'Pending Fees', value: totalFeesPending, icon: DollarSign, color: totalFeesPending > 0 ? 'amber' : 'emerald', bg: totalFeesPending > 0 ? 'bg-amber-50' : 'bg-emerald-50', ic: totalFeesPending > 0 ? 'text-amber-600' : 'text-emerald-600' },
          { label: 'Announcements', value: '6', icon: Bell, color: 'rose', bg: 'bg-rose-50', ic: 'text-rose-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${stat.ic}`} />
              </div>
              <p className={`text-2xl font-extrabold ${stat.ic}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Children cards */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">My Children</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {children.map((child, i) => (
            <ChildCard key={child.id} child={child} index={i} t={t} />
          ))}
        </div>
      </div>

      {/* Monthly attendance chart */}
      {children[0]?.attendance?.monthly_history && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {children[0].first_name}&apos;s Attendance Trend
          </h2>
          <div className="flex items-end gap-2 h-24">
            {children[0].attendance.monthly_history.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all"
                  style={{ height: `${m.percentage}%` }}
                />
                <span className="text-[9px] text-slate-400">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
