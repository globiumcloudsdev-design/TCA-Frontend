'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, GraduationCap, Users, BookOpen, 
  Calendar, CreditCard, ClipboardCheck, BarChart, 
  Bell, Search, Globe, ChevronRight, Check
} from 'lucide-react';

const DETAILED_FEATURES = [
  {
    category: "Institute & School Admin",
    icon: ShieldCheck,
    color: "from-indigo-500 to-blue-600",
    description: "The core ERP engine that runs your entire institution. Full control over every department.",
    sections: [
      {
        title: "Academic Management",
        details: "Manage Academic Years, Semesters, and Batches. Create dynamic Timetables and assign Subjects to specific Classes and Sections."
      },
      {
        title: "Student Life Cycle",
        details: "From Admission to Graduation. Track complete student profiles, documents, attendance history, and disciplinary records."
      },
      {
        title: "Financial Suite",
        details: "Comprehensive Fee Management. Create templates, generate invoices, track pending payments, and manage Staff Payroll with tax/allowance calculations."
      },
      {
        title: "Examination System",
        details: "Design exam types (Mid, Final, Quiz), enter marks, generate automated report cards, and manage result declarations."
      }
    ]
  },
  {
    category: "Teacher Empowerment Portal",
    icon: GraduationCap,
    color: "from-violet-500 to-purple-600",
    description: "Tools for educators to focus on teaching, not paperwork. Streamlined classroom management.",
    sections: [
      {
        title: "Smart Attendance",
        details: "Mark daily or subject-wise attendance in seconds. View monthly trends and identify absent patterns automatically."
      },
      {
        title: "Academic Resources",
        details: "Upload Notes, Study Materials, and Assignments. Set deadlines and accept student submissions digitally."
      },
      {
        title: "Communication",
        details: "Send class-wide announcements, notices, and updates directly to student and parent dashboards."
      },
      {
        title: "Schedule Tracking",
        details: "Personalized timetable view. Know exactly where and when your next class is with real-time room allocation."
      }
    ]
  },
  {
    category: "Student & Parent Experience",
    icon: Users,
    color: "from-cyan-500 to-teal-600",
    description: "Transparency and engagement for families. Keep track of progress and financial dues easily.",
    sections: [
      {
        title: "Performance Analytics",
        details: "Visual graphs of exam results and attendance. Compare performance across different semesters."
      },
      {
        title: "Fee Transparency",
        details: "View paid and upcoming fee installments. Download digital receipts and check outstanding balances."
      },
      {
        title: "Learning Hub",
        details: "Access uploaded notes, download homework assignments, and stay updated with the latest school syllabus."
      },
      {
        title: "Event Alerts",
        details: "Never miss an exam or a holiday. Centralized notice board for all school-wide events and individual alerts."
      }
    ]
  }
];

export default function FeatureDetailView() {
  return (
    <div className="space-y-16">
      {DETAILED_FEATURES.map((cat, idx) => (
        <div key={idx} className="group relative">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} shadow-lg shadow-indigo-500/20`}>
              <cat.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{cat.category}</h2>
              <p className="text-slate-400 max-w-2xl">{cat.description}</p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {cat.sections.map((section, sIdx) => (
              <div 
                key={sIdx} 
                className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-300">{section.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-11">
                  {section.details}
                </p>
              </div>
            ))}
          </div>
          
          {/* Decorative Divider */}
          {idx !== DETAILED_FEATURES.length - 1 && (
            <div className="absolute -bottom-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
        </div>
      ))}

      {/* Infrastructure Note (From your MD Technical analysis) */}
      <div className="mt-20 p-8 rounded-3xl bg-slate-900 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-32 h-32 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Enterprise-Grade Infrastructure</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
                <span className="text-indigo-400 font-mono"># Multi-Institute</span>
                <p className="text-slate-400">Supporting Schools, Coaching Centers, Academies, and Universities with type-specific workflows.</p>
            </div>
            <div className="space-y-2">
                <span className="text-indigo-400 font-mono"># Hybrid Routing</span>
                <p className="text-slate-400">Localized experience for Pakistani schools with support for Urdu names and local grading systems.</p>
            </div>
            <div className="space-y-2">
                <span className="text-indigo-400 font-mono"># Cloud Sync</span>
                <p className="text-slate-400">Real-time synchronization between Teacher mobile portal and Admin desktop dashboard.</p>
            </div>
        </div>
      </div>
    </div>
  );
}