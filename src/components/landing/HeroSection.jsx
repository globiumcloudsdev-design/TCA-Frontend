'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Play, CheckCircle, Star, Users, School, BarChart3, Shield,
} from 'lucide-react';

const HERO_BULLETS = [
  'No credit card required',
  '14-day free trial',
  'Set up in minutes',
];

const FLOATING_CARDS = [
  {
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    value: '12,400+',
    label: 'Active Students',
  },
  {
    icon: School,
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    value: '98%',
    label: 'Satisfaction Rate',
  },
  {
    icon: BarChart3,
    color: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    value: '3x',
    label: 'Faster Reports',
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="flex flex-col gap-7 text-center lg:text-left">
            <Badge className="w-fit mx-auto lg:mx-0 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 px-4 py-1.5 text-sm font-medium gap-2">
              <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              Trusted by 500+ Schools Across Pakistan
            </Badge>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                The Smarter Way to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
                  Manage Your School
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
                The Clouds Academy is a complete school management SaaS — designed for Pakistani educational institutions. Handle students, teachers, fees, attendance, exams & more from one powerful dashboard.
              </p>
            </div>

            <ul className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {HERO_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-xl shadow-indigo-900/50 font-semibold text-base px-8 gap-2 transition-all hover:scale-105">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold text-base px-8 gap-2 bg-white/5 backdrop-blur-sm">
                <Play className="w-4 h-4 fill-white" />
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-2 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-slate-950 flex items-center justify-center text-white text-xs font-bold`}>
                    {['A', 'S', 'R', 'K', 'M'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-400">4.9/5 from 200+ schools</p>
              </div>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative hidden lg:block">
            {/* Main card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/80 bg-slate-900/80 backdrop-blur-sm">
              {/* Browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800/80 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="ml-3 flex-1 bg-slate-700/60 rounded-md h-5 px-3 flex items-center">
                  <span className="text-xs text-slate-400">app.thecloudsacademy.pk/dashboard</span>
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-5 bg-slate-900">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Students', val: '1,240', textCls: 'text-indigo-400', barCls: 'bg-indigo-500/30', fillCls: 'bg-indigo-500' },
                    { label: 'Teachers', val: '68',    textCls: 'text-violet-400', barCls: 'bg-violet-500/30', fillCls: 'bg-violet-500' },
                    { label: 'Fee Rate', val: '94%',   textCls: 'text-emerald-400', barCls: 'bg-emerald-500/30', fillCls: 'bg-emerald-500' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-800/70 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] text-slate-400 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.textCls}`}>{s.val}</p>
                      <div className={`mt-1 h-1 rounded-full ${s.barCls}`}>
                        <div className={`h-1 rounded-full ${s.fillCls} w-3/4`} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart bars */}
                <div className="bg-slate-800/70 rounded-xl p-4 border border-white/5 mb-4">
                  <p className="text-xs text-slate-300 font-semibold mb-3">Monthly Attendance Overview</p>
                  <div className="flex items-end gap-2 h-20">
                    {[70,85,90,75,88,92,80,95,87,78,91,88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgb(99 102 241), rgb(139 92 246))`,
                        opacity: i === 9 ? 1 : 0.5 + (i * 0.05),
                      }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Jan','Apr','Jul','Oct'].map(m => <span key={m} className="text-[9px] text-slate-500">{m}</span>)}
                  </div>
                </div>
                {/* Recent row */}
                <div className="space-y-2">
                  {[
                    { name: 'Ali Hassan',  action: 'Fee Paid',     status: 'Paid', avatarCls: 'bg-emerald-500/20 text-emerald-400', badgeCls: 'text-emerald-400 bg-emerald-500/20' },
                    { name: 'Sara Ahmed',  action: 'Enrolled',     status: 'New',  avatarCls: 'bg-indigo-500/20 text-indigo-400',   badgeCls: 'text-indigo-400 bg-indigo-500/20' },
                    { name: 'Omar Khan',   action: 'Exam Result',  status: 'Pass', avatarCls: 'bg-violet-500/20 text-violet-400',   badgeCls: 'text-violet-400 bg-violet-500/20' },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${r.avatarCls}`}>
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="text-xs text-white font-medium">{r.name}</p>
                          <p className="text-[9px] text-slate-400">{r.action}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${r.badgeCls}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            {FLOATING_CARDS.map((card, i) => {
              const Icon = card.icon;
              const positions = [
                '-top-5 -left-8',
                '-bottom-6 -left-10',
                '-top-8 -right-6',
              ];
              return (
                <div
                  key={card.label}
                  className={`absolute ${positions[i]} bg-white rounded-xl shadow-2xl p-3.5 border border-slate-100 min-w-[130px] animate-float`}
                  style={{ animationDelay: `${i * 0.7}s` }}
                >
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              );
            })}

            {/* Shield badge */}
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-3 shadow-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-white" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Bank-level</p>
                <p className="text-[9px] text-indigo-200">Security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
