// 'use client';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, CheckCircle, MessageCircle, Phone } from 'lucide-react';

// const BULLETS = [
//   '14-day free trial',
//   'No credit card required',
//   'Full feature access',
//   'Setup in under 10 minutes',
//   'Free data migration support',
//   'Cancel anytime',
// ];

// export default function CTASection() {
//   return (
//     <section className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-8 py-16 lg:px-16 lg:py-20">
//           {/* Grid background */}
//           <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

//           {/* Glow */}
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-600/25 blur-3xl rounded-full" />
//           <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/20 blur-3xl rounded-full" />

//           <div className="relative text-center">
//             <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-5 py-2 mb-6">
//               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
//               <span className="text-sm font-medium text-indigo-300">No hidden charges · Cancel anytime</span>
//             </div>

//             <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight max-w-3xl mx-auto">
//               Ready to transform the way your school operates?
//             </h2>
//             <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">
//               Join hundreds of Pakistani schools who have eliminated paperwork, improved fee collection, and taken back control of their institution.
//             </p>

//             {/* Bullets */}
//             <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
//               {BULLETS.map((b) => (
//                 <div key={b} className="flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
//                   <span className="text-sm text-slate-300">{b}</span>
//                 </div>
//               ))}
//             </div>

//             {/* CTAs */}
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
//               <Link href="/login">
//                 <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-xl shadow-indigo-900/60 font-bold text-base px-10 py-6 gap-2 hover:scale-105 transition-all">
//                   Start Your Free Trial
//                   <ArrowRight className="w-5 h-5" />
//                 </Button>
//               </Link>
//               <a
//                 href="https://wa.me/923001234567"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold text-base px-10 py-6 gap-2 bg-white/5">
//                   <MessageCircle className="w-5 h-5 text-emerald-400" />
//                   Chat on WhatsApp
//                 </Button>
//               </a>
//             </div>

//             {/* Contact row */}
//             <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/10">
//               <a href="tel:+923001234567" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
//                 <Phone className="w-4 h-4" />
//                 +92 300 123 4567
//               </a>
//               <a href="mailto:support@thecloudsacademy.pk" className="text-slate-400 hover:text-white transition-colors text-sm">
//                 support@thecloudsacademy.pk
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }





'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, MessageCircle, Phone, Sparkles, ShieldCheck } from 'lucide-react';

const BULLETS = [
  '14-day free trial',
  'No credit card required',
  'Setup in < 10 minutes',
  'Free data migration',
];

export default function CTASection() {
  return (
    <section className="py-24 bg-[#020617] relative overflow-hidden">
      {/* Background elements to merge with previous sections */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] overflow-hidden bg-slate-900/40 border border-white/10 px-8 py-20 lg:px-20 lg:py-24 backdrop-blur-xl shadow-2xl">
          
          {/* Animated Background Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Enterprise-Grade Security Included</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] mb-8">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Revolutionize</span> Your School?
            </h2>
            
            <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Stop fighting with spreadsheets. Join 500+ Pakistani institutions and take your school administration to the cloud today.
            </p>

            {/* Micro-Benefits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {BULLETS.map((b) => (
                <div key={b} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-300">{b}</span>
                </div>
              ))}
            </div>

            {/* Massive CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-12 bg-white text-slate-950 hover:bg-indigo-50 font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 gap-3">
                  Start Your Free Journey
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 border-white/10 text-white bg-white/5 hover:bg-white/10 font-bold text-lg rounded-2xl gap-3 backdrop-blur-md transition-all">
                  <MessageCircle className="w-6 h-6 text-emerald-400 fill-emerald-400/10" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Contact Support Footer */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                   <Phone className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Call our Support</p>
                  <p className="text-sm font-bold text-white">+92 300 123 4567</p>
                </div>
              </div>
              
              <div className="hidden md:block w-px h-8 bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Email Inquiries</p>
                  <p className="text-sm font-bold text-white">support@thecloudsacademy.pk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}