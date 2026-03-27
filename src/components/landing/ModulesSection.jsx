'use client';
import { useState } from 'react';
import {
  Users, GraduationCap, DollarSign, Calendar, BookOpen,
  Building2, UserCog, BarChart3, CheckCircle, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MODULES = [
  {
    id: 'students',
    icon: Users,
    title: 'Student Management',
    tagline: 'Complete student lifecycle management',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    ic: 'text-indigo-600',
    features: [
      'Student enrollment & admission forms',
      'Profile photo & document uploads',
      'Class & section assignments',
      'Parent / guardian information',
      'Academic history & progress tracking',
      'Student ID card generation',
      'Transfer in/out records',
      'Bulk import from Excel',
    ],
    preview: { label: '1,240', sublabel: 'Active Students', trend: '+18 this month' },
  },
  {
    id: 'teachers',
    icon: GraduationCap,
    title: 'Teacher Management',
    tagline: 'Hire, manage & evaluate your faculty',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    ic: 'text-violet-600',
    features: [
      'Teacher profiles & qualifications',
      'Subject and class assignments',
      'Attendance tracking',
      'Payroll & salary records',
      'Performance evaluation',
      'Leave management',
      'Timetable scheduling',
      'Document management',
    ],
    preview: { label: '68', sublabel: 'Teaching Staff', trend: '94% Attendance' },
  },
  {
    id: 'fees',
    icon: DollarSign,
    title: 'Fee Management',
    tagline: 'Automate billing and track every rupee',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    ic: 'text-emerald-600',
    features: [
      'Custom fee structures per class',
      'Monthly / quarterly / annual billing',
      'Discount & scholarship management',
      'Late fee calculations',
      'Fee voucher & receipt printing',
      'Online payment tracking',
      'Defaulter lists & reminders',
      'Monthly fee collection reports',
    ],
    preview: { label: 'PKR 2.4M', sublabel: 'Monthly Revenue', trend: '97% collected' },
  },
  {
    id: 'attendance',
    icon: Calendar,
    title: 'Attendance System',
    tagline: 'Track daily attendance with ease',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
    ic: 'text-cyan-600',
    features: [
      'Daily student & teacher attendance',
      'Class-wise attendance sheets',
      'Absent/late/present status',
      'Monthly attendance reports',
      'Automatic parent SMS alerts',
      'Attendance percentage tracking',
      'Public holiday management',
      'Annual attendance summaries',
    ],
    preview: { label: '92%', sublabel: 'Avg Attendance', trend: 'This Month' },
  },
  {
    id: 'exams',
    icon: BookOpen,
    title: 'Exam & Results',
    tagline: 'Run exams, publish results instantly',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50',
    ic: 'text-rose-600',
    features: [
      'Exam schedule management',
      'Subject-wise mark entry',
      'Automatic grade calculation',
      'Result cards & transcripts',
      'Class position & ranking',
      'Improvement tracking',
      'Progress report generation',
      'Parent portal result viewing',
    ],
    preview: { label: '87%', sublabel: 'Pass Rate', trend: 'Latest Exams' },
  },
  {
    id: 'branches',
    icon: Building2,
    title: 'Branch Management',
    tagline: 'Run multiple campuses from one place',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    ic: 'text-amber-600',
    features: [
      'Unlimited campus/branch creation',
      'Branch-level data isolation',
      'Centralized reporting',
      'Branch admin assignments',
      'Cross-branch comparisons',
      'Branch performance dashboards',
      'Individual branch settings',
      'Super admin oversight',
    ],
    preview: { label: '5', sublabel: 'Active Branches', trend: '+1 this quarter' },
  },
  {
    id: 'users',
    icon: UserCog,
    title: 'User & Role Management',
    tagline: 'Control who sees what in your system',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    ic: 'text-purple-600',
    features: [
      '5 built-in role types',
      'Custom permission sets',
      'Branch-scoped access',
      'User activity audit logs',
      'Password policies',
      'Two-factor authentication',
      'Session management',
      'Staff account lifecycle',
    ],
    preview: { label: '24', sublabel: 'System Users', trend: '5 role levels' },
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Reports & Analytics',
    tagline: 'Data-driven decisions for school leaders',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    ic: 'text-blue-600',
    features: [
      'Interactive dashboard charts',
      'Attendance trend analysis',
      'Fee collection summaries',
      'Student enrollment growth',
      'Teacher performance metrics',
      'Export PDF / Excel / CSV',
      'Date range filtering',
      'Branch comparison reports',
    ],
    preview: { label: '30+', sublabel: 'Report Types', trend: 'Export anytime' },
  },
  {
    id: 'parent-portal',
    icon: Users,
    title: 'Parent Portal',
    tagline: 'Keep parents informed and engaged',
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    ic: 'text-indigo-600',
    features: [
      'Separate parent login',
      'Child attendance tracking',
      'Fee payment status & history',
      'Exam results & report cards',
      'School announcements',
      'Multiple children support',
      'Real-time data updates',
      'Mobile-friendly interface',
    ],
    preview: { label: '500+', sublabel: 'Active Parents', trend: 'Logged in today' },
  },
  {
    id: 'student-portal',
    icon: GraduationCap,
    title: 'Student Portal',
    tagline: 'Empower students with their own data',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    ic: 'text-emerald-600',
    features: [
      'Personal student login',
      'View own attendance history',
      'Fee record & payment history',
      'Exam results & grades',
      'Class timetable view',
      'School announcements',
      'Academic progress tracking',
      'Secure & private access',
    ],
    preview: { label: '1,240+', sublabel: 'Active Students', trend: 'Via student login' },
  },
  {
    id: 'teacher-portal',
    icon: GraduationCap,
    title: 'Teacher Portal',
    tagline: 'Empower teachers to manage their classes',
    color: 'blue',
    gradient: 'from-blue-500 to-sky-500',
    bg: 'bg-blue-50',
    ic: 'text-blue-600',
    features: [
      'Dedicated teacher login',
      'Manage assigned classes',
      'Upload notes & materials',
      'Create assignments & tasks',
      'Daily homework & diary',
      'Mark student attendance',
      'View school announcements',
      'Student list per class',
    ],
    preview: { label: '68+', sublabel: 'Active Teachers', trend: 'Via teacher login' },
  },
];

export default function ModulesSection() {
  const [active, setActive] = useState('students');
  const mod = MODULES.find((m) => m.id === active);
  const Icon = mod.icon;

  return (
    <section id="modules" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Core Modules</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            A module for every{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              school need
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            11 fully integrated modules that talk to each other — no more juggling spreadsheets.
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start gap-4">

          {/* ── Mobile / Tablet: horizontal scroll chips ── */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-2">
            <div className="flex gap-2 w-max">
              {MODULES.map((m) => {
                const MIcon = m.icon;
                const isActive = m.id === active;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActive(m.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${m.gradient} text-white border-transparent shadow-md`
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-white/20' : m.bg}`}>
                      <MIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : m.ic}`} />
                    </div>
                    {m.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Desktop: vertical sidebar ── */}
          <div className="hidden lg:flex flex-col gap-2">
            {MODULES.map((m) => {
              const MIcon = m.icon;
              const isActive = m.id === active;
              return (
                <button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                    isActive
                      ? `bg-gradient-to-r ${m.gradient} text-white border-transparent shadow-md`
                      : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-white/20' : m.bg}`}>
                    <MIcon className={`w-4 h-4 ${isActive ? 'text-white' : m.ic}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{m.title}</p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{m.tagline}</p>
                  </div>
                  {isActive && <ArrowRight className="w-4 h-4 ml-auto text-white/80" />}
                </button>
              );
            })}
          </div>

          {/* Module detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${mod.gradient} p-6`}>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white">{mod.title}</h3>
                    <p className="text-sm text-white/80 mt-0.5">{mod.tagline}</p>
                  </div>
                  <div className="text-right bg-white/15 rounded-xl px-4 py-2 flex-shrink-0">
                    <p className="text-2xl font-extrabold text-white">{mod.preview.label}</p>
                    <p className="text-xs text-white/75">{mod.preview.sublabel}</p>
                    <p className="text-xs text-white/60 mt-0.5">{mod.preview.trend}</p>
                  </div>
                </div>
              </div>

              {/* Features grid */}
              <div className="p-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">What&apos;s included</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {mod.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle className={`w-4 h-4 ${mod.ic} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <Link href="/login">
                    <Button className={`bg-gradient-to-r ${mod.gradient} text-white hover:opacity-90 font-semibold gap-2`}>
                      Explore {mod.title}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-400">No setup required · Start in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
