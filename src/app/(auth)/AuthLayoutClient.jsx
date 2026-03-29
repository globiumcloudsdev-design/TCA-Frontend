'use client';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayoutClient({ children }) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Branding Area */}
      <div className="relative z-20 mb-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform border border-white/10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white leading-none tracking-tight">THE CLOUDS</h1>
            <p className="text-[11px] font-bold text-indigo-400 tracking-[0.3em] uppercase mt-1.5">Academy</p>
          </div>
        </Link>
        <div className="mt-4 h-px w-12 bg-indigo-500/50 mx-auto" />
      </div>

      <main className="w-full max-w-lg relative z-10">
        {children}
      </main>

      <p className="mt-10 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] relative z-10">
        Secure Institute Management System
      </p>
    </div>
  );
}