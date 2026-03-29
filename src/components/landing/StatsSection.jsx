
'use client';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Award, Building2, Clock, Users2 } from 'lucide-react';

const STATS = [
  {
    icon: Building2,
    value: 500,
    suffix: '+',
    label: 'Schools Onboarded',
    description: 'Trusted across Pakistan',
    color: 'text-indigo-400',
    border: 'group-hover:border-indigo-500/50',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Users2,
    value: 120,
    suffix: 'K+',
    label: 'Students Managed',
    description: 'Active records in system',
    color: 'text-violet-400',
    border: 'group-hover:border-violet-500/50',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Award,
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Verified school reviews',
    color: 'text-cyan-400',
    border: 'group-hover:border-cyan-500/50',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Clock,
    value: 80,
    suffix: '%',
    label: 'Admin Time Saved',
    description: 'Less paperwork, more teaching',
    color: 'text-emerald-400',
    border: 'group-hover:border-emerald-500/50',
    bg: 'bg-emerald-500/10',
  },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ stat, started }) {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000, started);
  
  return (
    <div className={`group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 transition-all duration-500 hover:bg-slate-900/60 ${stat.border} overflow-hidden`}>
      {/* Background Glow Effect */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${stat.bg}`} />
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${stat.bg} border border-white/5 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className={`w-7 h-7 ${stat.color}`} />
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {count}{stat.suffix}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-200 mb-1">{stat.label}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{stat.description}</p>
      </div>

      {/* Decorative Corner Line */}
      <div className={`absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-l from-transparent to-transparent group-hover:from-white/20 transition-all duration-700`} />
      <div className={`absolute top-0 right-0 h-16 w-[1px] bg-gradient-to-b from-transparent to-transparent group-hover:from-white/20 transition-all duration-700`} />
    </div>
  );
}

export default function StatsSection() {
  const [started, setStarted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#020617] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-[1px] bg-indigo-500" />
              <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Platform Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Real Results for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Forward-Thinking Schools
              </span>
            </h2>
          </div>
          <p className="text-lg text-slate-400 max-w-sm">
            Empowering educational institutions across Pakistan with data-driven management tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}