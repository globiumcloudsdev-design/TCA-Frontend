'use client';
import {
  Zap, Lock, Globe, BarChart3, Bell, Smartphone,
  RefreshCw, UserCheck, FileText, Database, Headphones, Layers,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Next.js 15 with server-side rendering for instant page loads and zero lag.',
    color: 'amber',
    bg: 'bg-amber-50',
    ic: 'text-amber-600',
    border: 'border-amber-100 hover:border-amber-300',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: 'JWT-based auth, HTTPS encryption, role-based access control, and audit logs keep your data safe.',
    color: 'emerald',
    bg: 'bg-emerald-50',
    ic: 'text-emerald-600',
    border: 'border-emerald-100 hover:border-emerald-300',
  },
  {
    icon: Globe,
    title: 'Multi-Branch Support',
    description: 'Manage multiple campuses from one account with isolated branch data and centralized reporting.',
    color: 'indigo',
    bg: 'bg-indigo-50',
    ic: 'text-indigo-600',
    border: 'border-indigo-100 hover:border-indigo-300',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Interactive charts for attendance trends, fee collection, enrollment growth, and student performance.',
    color: 'violet',
    bg: 'bg-violet-50',
    ic: 'text-violet-600',
    border: 'border-violet-100 hover:border-violet-300',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Automated alerts for fee due dates, exam schedules, attendance drops, and important school events.',
    color: 'rose',
    bg: 'bg-rose-50',
    ic: 'text-rose-600',
    border: 'border-rose-100 hover:border-rose-300',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Fully responsive design works perfectly on phones, tablets, and desktops — manage anywhere.',
    color: 'cyan',
    bg: 'bg-cyan-50',
    ic: 'text-cyan-600',
    border: 'border-cyan-100 hover:border-cyan-300',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Sync',
    description: 'Data updates instantly across all users and devices — no page refresh needed.',
    color: 'teal',
    bg: 'bg-teal-50',
    ic: 'text-teal-600',
    border: 'border-teal-100 hover:border-teal-300',
  },
  {
    icon: UserCheck,
    title: 'Role-Based Access',
    description: 'Super Admin, Branch Admin, Teacher, Accountant — each role sees only what they need.',
    color: 'purple',
    bg: 'bg-purple-50',
    ic: 'text-purple-600',
    border: 'border-purple-100 hover:border-purple-300',
  },
  {
    icon: FileText,
    title: 'Export Everything',
    description: 'Download any report as PDF, Excel, CSV, or JSON with custom column selection and date filters.',
    color: 'blue',
    bg: 'bg-blue-50',
    ic: 'text-blue-600',
    border: 'border-blue-100 hover:border-blue-300',
  },
  {
    icon: Database,
    title: 'Cloud Backup',
    description: 'Automatic daily backups to cloud storage — your data is always safe and recoverable.',
    color: 'slate',
    bg: 'bg-slate-50',
    ic: 'text-slate-600',
    border: 'border-slate-200 hover:border-slate-300',
  },
  {
    icon: Layers,
    title: 'Modular Design',
    description: 'Enable only the modules you need. Scale up as your school grows without extra cost.',
    color: 'orange',
    bg: 'bg-orange-50',
    ic: 'text-orange-600',
    border: 'border-orange-100 hover:border-orange-300',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated Urdu & English support via WhatsApp, email, and live chat. We are always here.',
    color: 'pink',
    bg: 'bg-pink-50',
    ic: 'text-pink-600',
    border: 'border-pink-100 hover:border-pink-300',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Why Choose Us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Everything your school needs,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              nothing it doesn&apos;t
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Purpose-built for Pakistani schools with local needs in mind — Urdu support, local banking integrations, and curriculum alignment.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative bg-white rounded-2xl p-6 border ${f.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${f.bg} mb-4`}>
                  <Icon className={`w-5 h-5 ${f.ic}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
