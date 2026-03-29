'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, CheckCircle, Star, Users, School, BarChart3, Shield, Sparkles, Zap
} from 'lucide-react';

const HERO_BULLETS = ['No credit card required', '14-day free trial', 'Set up in minutes'];

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#020617] pt-20">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        {/* Animated Glows */}
        <div className="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-violet-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col gap-8 text-center lg:text-left z-10">
            <div className="space-y-4">
              <Badge className="w-fit mx-auto lg:mx-0 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Trusted by 500+ Institutions in Pakistan
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-gradient">
                  School Growth
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Automate your admissions, fees, and exams with the most powerful SaaS designed for Pakistani schools.
              </p>
            </div>

            <ul className="flex flex-wrap gap-y-2 gap-x-6 justify-center lg:justify-start">
              {HERO_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <div className="p-0.5 rounded-full bg-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-bold gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 text-white bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl text-base font-bold gap-2 transition-all">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 justify-center lg:justify-start pt-4 border-t border-white/5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {['S', 'A', 'K', 'M'][i-1]}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#020617] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  +200
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Leading School Management SaaS</p>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative hidden lg:block group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-colors" />
            
            {/* Dashboard Wrapper */}
            <div className="relative rounded-3xl p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-2xl shadow-2xl">
              <div className="overflow-hidden rounded-2xl bg-slate-950 border border-white/5 shadow-inner">
                {/* Browser UI */}
                <div className="flex items-center gap-2 px-5 py-4 bg-slate-900/50 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto bg-slate-800/50 rounded-lg h-7 flex items-center px-3 gap-2">
                    <Shield className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-400 font-medium">thecloudsacademy.pk/dashboard</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { l: 'Total Students', v: '2,840', c: 'text-indigo-400' },
                      { l: 'Revenue', v: '92%', c: 'text-emerald-400' },
                      { l: 'Active Staff', v: '124', c: 'text-violet-400' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{s.l}</p>
                        <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Visual Chart Placeholder */}
                  <div className="h-40 w-full bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end gap-3">
                    <div className="flex items-end gap-2 h-full">
                      {[40, 70, 55, 90, 65, 80, 45, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg opacity-80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Interaction Cards */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 animate-bounce transition-all duration-1000">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold leading-none">Efficiency</p>
                    <p className="text-lg font-black text-slate-900">+42%</p>
                  </div>
               </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-2xl">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-tighter">New Admissions</p>
                    <p className="text-lg font-black text-white leading-none">Ready</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}