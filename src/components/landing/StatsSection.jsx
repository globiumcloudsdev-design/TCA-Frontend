'use client';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Award, Building2, Clock } from 'lucide-react';

const STATS = [
  {
    icon: Building2,
    value: 500,
    suffix: '+',
    label: 'Schools Onboarded',
    description: 'Across Pakistan and growing fast',
    textColor: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    cornerBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  },
  {
    icon: TrendingUp,
    value: 120,
    suffix: 'K+',
    label: 'Students Managed',
    description: 'Active student records in the system',
    textColor: 'text-violet-600',
    gradient: 'from-violet-500 to-violet-600',
    cornerBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
  },
  {
    icon: Award,
    value: 98,
    suffix: '%',
    label: 'Customer Satisfaction',
    description: 'Based on verified school reviews',
    textColor: 'text-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600',
    cornerBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  },
  {
    icon: Clock,
    value: 80,
    suffix: '%',
    label: 'Time Saved',
    description: 'On administrative paperwork',
    textColor: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    cornerBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
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
  const count = useCountUp(stat.value, 1800, started);
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Gradient corner */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] ${stat.cornerBg} opacity-5 group-hover:opacity-10 transition-opacity`} />

      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} mb-5 shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className={`text-4xl font-extrabold ${stat.textColor} mb-1`}>
        {count}{stat.suffix}
      </div>
      <p className="text-lg font-bold text-slate-800 mb-1">{stat.label}</p>
      <p className="text-sm text-slate-500">{stat.description}</p>

      {/* Bottom bar */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`} />
    </div>
  );
}

export default function StatsSection() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">By The Numbers</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Trusted by schools nationwide
          </h2>
          <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
            Real impact delivered to real schools across Pakistan every single day.
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
