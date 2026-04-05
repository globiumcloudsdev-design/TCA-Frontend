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
        details: "Manage Academic Years, Semesters, and Batches. Create dynamic Timetables and assign Subjects to specific Classes and Sections. Generate conflict-free schedules with smart algorithms that respect teacher availability and room bookings.",
        subsections: [
          "• Academic year creation with start/end dates",
          "• Multi-semester/batch configuration per institute type",
          "• Class hierarchy (Primary/Secondary/Senior with sections)",
          "• Auto-generated timetable with conflict detection",
          "• Subject-teacher-class assignment management"
        ]
      },
      {
        title: "Student Life Cycle",
        details: "From Admission to Graduation. Track complete student profiles, documents, attendance history, and disciplinary records. Manage transfers, promotions, and transfers across classes and sections.",
        subsections: [
          "• Online admission form processing",
          "• Student profile with family information",
          "• Document management (school leaving certificates, certs)",
          "• Class promotion/transfer workflows",
          "• Fee history and payment tracking per student",
          "• Disciplinary records and conduct tracking"
        ]
      },
      {
        title: "Financial Suite",
        details: "Comprehensive Fee Management. Create templates with components, generate invoices, track pending payments. Manage Staff Payroll with tax/allowance calculations, salary slips, and bank transfer reports.",
        subsections: [
          "• Fee template builder (monthly/semester/custom)",
          "• Auto-generate vouchers per student per month",
          "• Multiple payment method support (Cash, Check, Online)",
          "• Late fee & penalty calculations",
          "• Payroll management with salary grades",
          "• Payslip generation & bank file export",
          "• Tax calculations (income tax, deductions)",
          "• Fee collection reports & outstanding tracking"
        ]
      },
      {
        title: "Examination System",
        details: "Design exam types (Mid, Final, Unit Test, Quiz, etc.), enter student marks, auto-calculate grades, and generate printable result cards. Manage result declarations and publish dates.",
        subsections: [
          "• Exam creation with multiple types/categories",
          "• Subject-wise schedule with dates/times/marks",
          "• Grid-based mark entry interface",
          "• Auto-calculation (percentage, grade, status)",
          "• Multiple grading systems (A-F, points, percentages)",
          "• Printable A4 result cards with institute letterhead",
          "• Result declaration with publish dates",
          "• Pass/fail analysis and category reports"
        ]
      },
      {
        title: "Comprehensive Reporting",
        details: "Generate detailed reports on students, teachers, attendance, fees, and exams. Export to PDF/Excel. Dashboard visualizations with charts and trend analysis.",
        subsections: [
          "• Student enrollment reports by class/section",
          "• Monthly attendance report (subject-wise)",
          "• Fee collection vs outstanding analysis",
          "• Exam result analysis with grade distribution",
          "• Teacher workload and class assignment reports",
          "• Custom report builder for specific needs",
          "• Export to PDF, Excel, and printable formats"
        ]
      },
      {
        title: "User & Permission Management",
        details: "Create user accounts for staff with role-based access control. Define custom roles with granular permissions (student.create, teacher.update, etc.). Track who did what and when.",
        subsections: [
          "• Create users with email-based invitations",
          "• Pre-built roles (Admin, Teacher, Accountant, etc.)",
          "• Custom role creation with permission builder",
          "• Granular permissions (view/create/edit/delete)",
          "• Activity logging for audit trails",
          "• Bulk user import from CSV",
          "• Password reset & access revocation"
        ]
      }
    ]
  },
  {
    category: "Teacher Empowerment Portal",
    icon: GraduationCap,
    color: "from-violet-500 to-purple-600",
    description: "Tools for educators to focus on teaching, not paperwork. Streamlined classroom management across all institute types.",
    sections: [
      {
        title: "Smart Attendance Marking",
        details: "Mark attendance using 3 methods: QR code scanning (real-time), CSV bulk import, or manual grid entry. Supports subject-wise or daily marking with leave type selection.",
        subsections: [
          "• QR Barcode scanning with instant feedback",
          "• Bulk import via CSV with auto-parsing",
          "• Manual grid entry (point-and-click buttons)",
          "• Leave type selection (sick, casual, unpaid)",
          "• Attendance type options (Regular, Exam, Event, Extra)",
          "• Monthly summaries and trend analytics",
          "• Auto-generate attendance reports"
        ]
      },
      {
        title: "Exam & Marks Management",
        details: "Create exams with multiple subjects, define schedules with dates/times/marks per subject. Enter student marks in a responsive grid, auto-calculate grades. Generate result cards.",
        subsections: [
          "• Create exams (mid-term, final, unit test, etc.)",
          "• Multi-subject exam with individual schedules",
          "• Mark entry grid with validation",
          "• Auto-calculate percentage, grade, status",
          "• Result analytics and grade distribution",
          "• Generate printable result cards per student",
          "• Publish results to student/parent portals"
        ]
      },
      {
        title: "Academic Resources",
        details: "Upload Notes, Study Materials, Syllabi, and Assignments. Attach PDF files, documents, and links. Organize by subject and set submission deadlines for assignments.",
        subsections: [
          "• Upload syllabus (PDF, text, or markdown)",
          "• Study material library with categorization",
          "• Assignment creation with due dates",
          "• Accept student submissions digitally",
          "• Grade submissions (marks + feedback)",
          "• Material versioning (track changes)",
          "• Resource sharing with specific classes/students"
        ]
      },
      {
        title: "Class Communication",
        details: "Send class-wide announcements, notices, and updates directly to student and parent portals. Track read receipts and engagement.",
        subsections: [
          "• Create announcements visible to selected class/section",
          "• Notices auto-visible on student/parent portals",
          "• Urgent alerts for important updates",
          "• Real-time notifications via email/SMS",
          "• Discussion threads per class/subject",
          "• Read receipts to track visibility",
          "• Archive old announcements"
        ]
      },
      {
        title: "Personal Schedule & Dashboard",
        details: "Personalized timetable view showing today's classes, coming up assignments to grade, and pending work. Real-time room allocation and class list.",
        subsections: [
          "• Today's class schedule with room info",
          "• Upcoming class preview (month view)",
          "• Pending grades and mark entry status",
          "• Assignment submissions waiting to grade",
          "• Student list with contact details per class",
          "• Quick stats on class attendance & performance",
          "• Mobile-friendly schedule view"
        ]
      },
      {
        title: "Class Performance Insights",
        details: "View class-level analytics: attendance trends, grade distribution, top/bottom performers, subject-specific performance, and historical comparisons.",
        subsections: [
          "• Attendance trend charts (subject-wise monthly)",
          "• Grade distribution (pass/fail/excellent breakdown)",
          "• Top and bottom performer identification",
          "• Subject performance comparison",
          "• Class performance vs school average",
          "• Export performance reports"
        ]
      }
    ]
  },
  {
    category: "Student Portal & Experience",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    description: "Comprehensive learning and progress tracking platform for students. Access all academic and administrative information in one place.",
    sections: [
      {
        title: "Dashboard & Overview",
        details: "Central hub showing today's classes, attendance percentage, recent grades, pending assignments, and fee status at a glance.",
        subsections: [
          "• Today's class schedule with room info",
          "• Overall attendance percentage with trend",
          "• Recent exam results and grades",
          "• Pending assignments and due dates",
          "• Outstanding fee notification",
          "• Upcoming exams and event alerts",
          "• Quick stats widgets (clickable for details)"
        ]
      },
      {
        title: "Performance Analytics",
        details: "Visual graphs and charts of exam results, attendance trends, and performance across different semesters. Compare with class average and identify improvement areas.",
        subsections: [
          "• Exam result cards with grades and percentages",
          "• Subject-wise performance comparison",
          "• Attendance trend chart (monthly/yearly)",
          "• Grade history across all exams",
          "• Class average comparison per exam",
          "• Strength and weakness identification",
          "• Performance improvement tracking"
        ]
      },
      {
        title: "Learning Resources",
        details: "Access uploaded notes, study materials, syllabi, and homework assignments from teachers. Download or view online. Track submission status for assignments.",
        subsections: [
          "• Subject-wise material organization",
          "• Searchable material library",
          "• Download or inline view option",
          "• Syllabus reference per subject",
          "• Homework/assignment list with due dates",
          "• Assignment submission upload interface",
          "• Graded assignment feedback view"
        ]
      },
      {
        title: "Fee Management",
        details: "View fee structure, payment history, and outstanding balances. Download digital receipts. Get reminders for due dates. Track installments.",
        subsections: [
          "• Fee structure breakdown (monthly/semester)",
          "• Paid vs outstanding fees visualization",
          "• Payment history with receipt download",
          "• Due date reminders",
          "• Installment tracking",
          "• Digital receipts and payment confirmations",
          "• Fee status summary"
        ]
      },
      {
        title: "Timetable & Schedule",
        details: "View personal timetable with class times, subjects, teachers, and room locations. Calendar view and weekly overview with color-coded subjects.",
        subsections: [
          "• Weekly timetable grid view",
          "• Calendar view for monthly overview",
          "• Subject color coding for easy recognition",
          "• Teacher names and contact info",
          "• Room location details",
          "• Built-in exam schedule",
          "• Mobile-friendly schedule view"
        ]
      },
      {
        title: "Notifications & Announcements",
        details: "Centralized notice board showing all school-wide events, exam schedules, holidays, and class-specific announcements. Filter by category and priority.",
        subsections: [
          "• All announcements from school/classes",
          "• Exam schedule and result announcements",
          "• Holiday calendar integration",
          "• Event invitations and details",
          "• Category filtering (Academic, Fee, Event, etc.)",
          "• Priority highlighting for urgent notices",
          "• Read/unread status tracking"
        ]
      },
      {
        title: "Attendance Tracking",
        details: "Monitor personal attendance record by subject. View monthly attendance report, absent dates, and attendance trend. Identify improvement needs.",
        subsections: [
          "• Subject-wise attendance list",
          "• Monthly attendance percentage",
          "• Absent date tracking",
          "• Attendance trend chart",
          "• Leave type breakdown (sick/casual/unpaid)",
          "• Attendance comparison with class average",
          "• Printable attendance certificate"
        ]
      }
    ]
  },
  {
    category: "Parent Portal & Family Engagement",
    icon: Users,
    color: "from-rose-500 to-pink-600",
    description: "Keep parents informed about their child's progress, financial status, and school events. Real-time engagement without overwhelming notifications.",
    sections: [
      {
        title: "Multi-Child Dashboard",
        details: "Manage multiple children in one account. Switch between children with single click. Summary cards for each child showing attendance, grades, and fee status.",
        subsections: [
          "• Child selection with quick switch",
          "• Summary card per child (attendance, grades, fees)",
          "• Consolidated dashboard for all children",
          "• Priority alerts for any child",
          "• Child profile management"
        ]
      },
      {
        title: "Performance Monitoring",
        details: "Track each child's exam results, grades, attendance, and academic progress. Visual graphs and comparisons over time. Identify areas needing improvement.",
        subsections: [
          "• Exam results with grades and percentages",
          "• Subject-wise performance breakdown",
          "• Attendance percentage and trend",
          "• Monthly progress reports",
          "• Grade history across semesters",
          "• Teacher comments and feedback",
          "• Comparative performance analysis"
        ]
      },
      {
        title: "Financial Transparency",
        details: "View fee structure, payment history, and outstanding balances for each child. Download digital receipts and email payment confirmations. Track all transactions.",
        subsections: [
          "• Fee structure per child",
          "• Payment history with dates and amounts",
          "• Outstanding balance tracking",
          "• Digital receipts download",
          "• Email payment reminders",
          "• Online payment option (if configured)",
          "• Annual fee summary per child"
        ]
      },
      {
        title: "School Communication & Events",
        details: "Receive announcements about school events, holidays, exam schedules, and important notices. Stay updated on class-specific information.",
        subsections: [
          "• All school announcements centralized",
          "• Exam schedule and result dates",
          "• Holiday calendar",
          "• Event invitations and details",
          "• Class-specific notices from teachers",
          "• Important dates and deadlines",
          "• Archive of past announcements"
        ]
      },
      {
        title: "Attendance Alerts",
        details: "Get notified about low attendance, absent days, and attendance trends. Receive alerts before attendance becomes a concern.",
        subsections: [
          "• Real-time absent notifications",
          "• Weekly attendance summary",
          "• Low attendance warnings (configurable threshold)",
          "• Monthly attendance report",
          "• Attendance trend visualization",
          "• Leave type tracking",
          "• Printable attendance certificates"
        ]
      },
      {
        title: "Teacher-Parent Communication",
        details: "Direct messaging with teachers about child's progress. Access teacher feedback on assignments and exam performance. Schedule parent-teacher meetings.",
        subsections: [
          "• Messaging with teachers (class-wise)",
          "• Assignment feedback and grades",
          "• Exam performance feedback",
          "• Quick response time standards",
          "• Meeting scheduling requests",
          "• Document sharing with teachers",
          "• Communication history per teacher"
        ]
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
                
                {/* Main description */}
                <p className="text-slate-400 text-sm leading-relaxed pl-11 mb-4">
                  {section.details}
                </p>

                {/* Subsections bullets */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="pl-11 space-y-2">
                    {section.subsections.map((sub, subIdx) => (
                      <p key={subIdx} className="text-slate-500 text-xs leading-relaxed font-mono">
                        {sub}
                      </p>
                    ))}
                  </div>
                )}
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
      <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-32 h-32 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-6">Complete Enterprise Feature Set</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-indigo-500/10">
                <span className="text-indigo-400 font-mono block mb-2">🏫 Multi-Institute</span>
                <p className="text-slate-400">Supporting Schools, Coaching Centers, Academies, Colleges & Universities with type-specific workflows and terminology.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-emerald-500/10">
                <span className="text-emerald-400 font-mono block mb-2">👥 Role-Based Access</span>
                <p className="text-slate-400">Admin, Teacher, Student, Parent roles with granular permission control. Custom roles supported.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-violet-500/10">
                <span className="text-violet-400 font-mono block mb-2">📱 Responsive Design</span>
                <p className="text-slate-400">Mobile-first design works seamlessly on phones, tablets, and desktops with adaptive layouts.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-rose-500/10">
                <span className="text-rose-400 font-mono block mb-2">🔄 Real-Time Sync</span>
                <p className="text-slate-400">Live updates across multiple portals. Attendance marked instantly, results published immediately.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-amber-500/10">
                <span className="text-amber-400 font-mono block mb-2">📊 Advanced Reporting</span>
                <p className="text-slate-400">PDF/Excel export, charts, analytics, and customizable reports for all operations.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-cyan-500/10">
                <span className="text-cyan-400 font-mono block mb-2">🔒 Secure & Reliable</span>
                <p className="text-slate-400">Enterprise-grade authentication, data encryption, and audit logs for compliance.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-teal-500/10">
                <span className="text-teal-400 font-mono block mb-2">🚀 Performance</span>
                <p className="text-slate-400">Optimized queries, caching, and pagination for fast loading even with 10,000+ students.</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-fuchsia-500/10">
                <span className="text-fuchsia-400 font-mono block mb-2">🔧 Extensible</span>
                <p className="text-slate-400">API-first architecture allows custom integrations and future feature additions.</p>
            </div>
        </div>
      </div>
    </div>
  );
}