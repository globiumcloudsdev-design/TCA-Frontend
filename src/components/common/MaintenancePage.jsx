'use client';

import { Cog, Construction, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage({ maintenance }) {
  const message = maintenance?.message;
  const duration = maintenance?.duration;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Animated Icon Set */}
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
            <Construction className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 bg-white p-2 rounded-lg shadow-xl animate-bounce">
            <Cog className="w-6 h-6 text-amber-500 animate-[spin_4s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-white p-2 rounded-lg shadow-xl delay-700 animate-bounce">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            System Under <span className="text-primary italic underline decoration-amber-400">Maintenance</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            {message || "We're performing some essential system upgrades to provide you with a better experience. We'll be back shortly!"}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl shadow-primary/5 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10 group-hover:bg-primary transition-colors" />
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-left space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="font-bold text-slate-900">Upgrading Core Modules</span>
              </div>
            </div>
            
            <div className="h-10 w-px bg-slate-100 hidden md:block" />

            <div className="text-left space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Return</p>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                 <span>{duration || 'Shortly'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
             <Button 
               variant="outline" 
               className="rounded-xl px-8 h-12 font-bold"
               onClick={() => window.location.reload()}
             >
               Retry Connection
             </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4" />
          Secure Platform Migration in Progress
        </div>
      </div>
    </div>
  );
}
