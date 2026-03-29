
'use client';
import {
  Zap, Lock, Globe, BarChart3, Bell, Smartphone,
  RefreshCw, UserCheck, FileText, Database, Headphones, Layers, Sparkles
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', description: 'Built on Next.js 15 with SSR for instant loads and zero lag.', color: 'text-amber-400', bg: 'group-hover:bg-amber-500/10' },
  { icon: Lock, title: 'Bank-Level Security', description: 'JWT auth, HTTPS encryption, and role-based access control.', color: 'text-emerald-400', bg: 'group-hover:bg-emerald-500/10' },
  { icon: Globe, title: 'Multi-Branch Support', description: 'Manage multiple campuses from one centralized dashboard.', color: 'text-indigo-400', bg: 'group-hover:bg-indigo-500/10' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Interactive charts for attendance, fees, and performance.', color: 'text-violet-400', bg: 'group-hover:bg-violet-500/10' },
  { icon: Bell, title: 'Smart Notifications', description: 'Automated alerts for fee dues, exams, and school events.', color: 'text-rose-400', bg: 'group-hover:bg-rose-500/10' },
  { icon: Smartphone, title: 'Mobile Responsive', description: 'Manage your school on the go with our fully responsive UI.', color: 'text-cyan-400', bg: 'group-hover:bg-cyan-500/10' },
  { icon: RefreshCw, title: 'Real-Time Sync', description: 'Data updates instantly across all devices without refresh.', color: 'text-teal-400', bg: 'group-hover:bg-teal-500/10' },
  { icon: UserCheck, title: 'Role-Based Access', description: 'Customized views for Admins, Teachers, and Accountants.', color: 'text-purple-400', bg: 'group-hover:bg-purple-500/10' },
  { icon: FileText, title: 'Export Everything', description: 'Download reports as PDF, Excel, CSV, or JSON instantly.', color: 'text-blue-400', bg: 'group-hover:bg-blue-500/10' },
  { icon: Database, title: 'Cloud Backup', description: 'Automatic daily backups ensure your data is always safe.', color: 'text-slate-300', bg: 'group-hover:bg-slate-300/10' },
  { icon: Layers, title: 'Modular Design', description: 'Enable only the modules you need and scale as you grow.', color: 'text-orange-400', bg: 'group-hover:bg-orange-500/10' },
  { icon: Headphones, title: '24/7 Support', description: 'Dedicated Urdu & English support via WhatsApp and Chat.', color: 'text-pink-400', bg: 'group-hover:bg-pink-500/10' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Cutting-Edge Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Everything your school needs, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              crafted for Pakistan.
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Purpose-built to handle the unique challenges of local educational institutions — from Urdu notifications to local fee structures.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${f.bg} blur-2xl -z-10`} />
                
                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800 border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {f.description}
                </p>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`w-1 h-1 rounded-full ${f.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}