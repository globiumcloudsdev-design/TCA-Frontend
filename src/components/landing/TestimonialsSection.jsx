// 'use client';
// import { Star, Quote } from 'lucide-react';

// const TESTIMONIALS = [
//   {
//     name: 'Muhammad Arif Khan',
//     role: 'Principal',
//     school: 'Al-Noor Public School, Lahore',
//     avatar: 'AK',
//     color: 'indigo',
//     rating: 5,
//     text: 'The Clouds Academy ne hamare school ki admin work bilkul badal di. Pehle fees track karne mein poora din lagta tha, ab ek click mein sab clear ho jata hai. Bohat Zabardast system hai!',
//   },
//   {
//     name: 'Sana Mirza',
//     role: 'School Administrator',
//     school: 'Pearls International Academy, Karachi',
//     avatar: 'SM',
//     color: 'violet',
//     rating: 5,
//     text: 'Multi-branch feature is absolutely amazing. We have 3 campuses and managing all from one dashboard is a dream come true. The fee collection module alone saved us 15 hours per month.',
//   },
//   {
//     name: 'Tariq Mehmood',
//     role: 'Director Operations',
//     school: 'Crescent Model School, Islamabad',
//     avatar: 'TM',
//     color: 'emerald',
//     rating: 5,
//     text: 'Support team responds on WhatsApp within minutes. They even came onsite for training. The attendance and exam modules are exactly what we needed. Highly recommended!',
//   },
//   {
//     name: 'Rabia Siddiqui',
//     role: 'Head of Administration',
//     school: 'Scholars Hub, Faisalabad',
//     avatar: 'RS',
//     color: 'cyan',
//     rating: 5,
//     text: 'Report generation alone is worth the price. I can export attendance, fees, and results in PDF or Excel within seconds. Parents are also very happy with the transparency.',
//   },
//   {
//     name: 'Imran Qureshi',
//     role: 'Founder',
//     school: 'Future Stars Network (5 Campuses)',
//     avatar: 'IQ',
//     color: 'amber',
//     rating: 5,
//     text: 'We were using 4 different softwares before. This SaaS replaced all of them. As a school network owner, the centralized dashboard showing all 5 branches in one place is invaluable.',
//   },
//   {
//     name: 'Dr. Zainab Farooq',
//     role: 'Principal',
//     school: 'Ghazali International School, Multan',
//     avatar: 'ZF',
//     color: 'rose',
//     rating: 5,
//     text: 'The exam result module is exceptional. Grading, ranking, result cards — everything automated. My teachers are so relieved. The system is also very easy to use for non-technical staff.',
//   },
// ];

// const COLORS = {
//   indigo: 'bg-indigo-100 text-indigo-700',
//   violet: 'bg-violet-100 text-violet-700',
//   emerald: 'bg-emerald-100 text-emerald-700',
//   cyan: 'bg-cyan-100 text-cyan-700',
//   amber: 'bg-amber-100 text-amber-700',
//   rose: 'bg-rose-100 text-rose-700',
// };

// export default function TestimonialsSection() {
//   return (
//     <section id="testimonials" className="py-24 bg-white overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-14 max-w-3xl mx-auto">
//           <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Testimonials</p>
//           <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
//             Schools that{' '}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
//               love The Clouds Academy
//             </span>
//           </h2>
//           <p className="mt-4 text-lg text-slate-500">
//             Hear directly from principals, administrators, and directors across Pakistan.
//           </p>
//         </div>

//         {/* Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {TESTIMONIALS.map((t) => (
//             <div
//               key={t.name}
//               className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
//             >
//               {/* Quote icon */}
//               <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
//                 <Quote className="w-16 h-16 text-indigo-600" />
//               </div>

//               {/* Stars */}
//               <div className="flex items-center gap-0.5 mb-4">
//                 {[...Array(t.rating)].map((_, i) => (
//                   <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
//                 ))}
//               </div>

//               {/* Text */}
//               <p className="text-sm text-slate-600 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

//               {/* Author */}
//               <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${COLORS[t.color]}`}>
//                   {t.avatar}
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-slate-900">{t.name}</p>
//                   <p className="text-xs text-slate-500">{t.role}</p>
//                   <p className="text-xs text-indigo-600 font-medium">{t.school}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Bottom trust bar */}
//         <div className="mt-16 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-8 border border-indigo-100 text-center">
//           <p className="text-2xl font-extrabold text-slate-900 mb-2">Join 500+ schools already using The Clouds Academy</p>
//           <p className="text-slate-500 text-base">From single-campus schools to 10+ branch networks — we&apos;ve got you covered.</p>
//         </div>
//       </div>
//     </section>
//   );
// }







'use client';
import { Star, Quote, Sparkles, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TESTIMONIALS = [
  {
    name: 'Muhammad Arif Khan',
    role: 'Principal',
    school: 'Al-Noor Public School, Lahore',
    avatar: 'AK',
    color: 'from-indigo-500 to-blue-600',
    text: 'The Clouds Academy ne hamare school ki admin work bilkul badal di. Pehle fees track karne mein poora din lagta tha, ab ek click mein sab clear ho jata hai. Bohat Zabardast system hai!',
  },
  {
    name: 'Sana Mirza',
    role: 'School Administrator',
    school: 'Pearls International Academy, Karachi',
    avatar: 'SM',
    color: 'from-violet-500 to-purple-600',
    text: 'Multi-branch feature is absolutely amazing. We have 3 campuses and managing all from one dashboard is a dream come true. The fee collection module alone saved us 15 hours per month.',
  },
  {
    name: 'Tariq Mehmood',
    role: 'Director Operations',
    school: 'Crescent Model School, Islamabad',
    avatar: 'TM',
    color: 'from-emerald-500 to-teal-600',
    text: 'Support team responds on WhatsApp within minutes. They even came onsite for training. The attendance and exam modules are exactly what we needed. Highly recommended!',
  },
  {
    name: 'Rabia Siddiqui',
    role: 'Head of Administration',
    school: 'Scholars Hub, Faisalabad',
    avatar: 'RS',
    color: 'from-cyan-500 to-blue-500',
    text: 'Report generation alone is worth the price. I can export attendance, fees, and results in PDF or Excel within seconds. Parents are also very happy with the transparency.',
  },
  {
    name: 'Imran Qureshi',
    role: 'Founder',
    school: 'Future Stars Network (5 Campuses)',
    avatar: 'IQ',
    color: 'from-amber-500 to-orange-600',
    text: 'We were using 4 different softwares before. This SaaS replaced all of them. As a school network owner, the centralized dashboard showing all 5 branches in one place is invaluable.',
  },
  {
    name: 'Dr. Zainab Farooq',
    role: 'Principal',
    school: 'Ghazali International School, Multan',
    avatar: 'ZF',
    color: 'from-rose-500 to-pink-600',
    text: 'The exam result module is exceptional. Grading, ranking, result cards — everything automated. My teachers are so relieved. The system is also very easy to use for non-technical staff.',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-[#020617] relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1">
            <MessageSquare className="w-3 h-3 mr-2" />
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Educational Leaders</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From Lahore to Karachi, school administrators are transforming their institutions with The Clouds Academy.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="break-inside-avoid relative group p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-500 backdrop-blur-sm"
            >
              {/* Quote Icon Background */}
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />

              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed italic mb-8 relative z-10">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-gradient-to-br ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm leading-none mb-1">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-1">{t.role}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Trust Box */}
        <div className="mt-20 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-10 md:p-16 text-center backdrop-blur-xl">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Join 500+ Schools?
            </h3>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
              Start your 14-day free trial today. No credit card required. 
              Our team will assist you with onboarding and data migration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl shadow-indigo-600/20">
                Get Started for Free
              </button>
              <button className="h-14 px-10 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}