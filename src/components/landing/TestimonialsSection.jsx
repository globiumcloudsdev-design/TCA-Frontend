'use client';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Muhammad Arif Khan',
    role: 'Principal',
    school: 'Al-Noor Public School, Lahore',
    avatar: 'AK',
    color: 'indigo',
    rating: 5,
    text: 'The Clouds Academy ne hamare school ki admin work bilkul badal di. Pehle fees track karne mein poora din lagta tha, ab ek click mein sab clear ho jata hai. Bohat Zabardast system hai!',
  },
  {
    name: 'Sana Mirza',
    role: 'School Administrator',
    school: 'Pearls International Academy, Karachi',
    avatar: 'SM',
    color: 'violet',
    rating: 5,
    text: 'Multi-branch feature is absolutely amazing. We have 3 campuses and managing all from one dashboard is a dream come true. The fee collection module alone saved us 15 hours per month.',
  },
  {
    name: 'Tariq Mehmood',
    role: 'Director Operations',
    school: 'Crescent Model School, Islamabad',
    avatar: 'TM',
    color: 'emerald',
    rating: 5,
    text: 'Support team responds on WhatsApp within minutes. They even came onsite for training. The attendance and exam modules are exactly what we needed. Highly recommended!',
  },
  {
    name: 'Rabia Siddiqui',
    role: 'Head of Administration',
    school: 'Scholars Hub, Faisalabad',
    avatar: 'RS',
    color: 'cyan',
    rating: 5,
    text: 'Report generation alone is worth the price. I can export attendance, fees, and results in PDF or Excel within seconds. Parents are also very happy with the transparency.',
  },
  {
    name: 'Imran Qureshi',
    role: 'Founder',
    school: 'Future Stars Network (5 Campuses)',
    avatar: 'IQ',
    color: 'amber',
    rating: 5,
    text: 'We were using 4 different softwares before. This SaaS replaced all of them. As a school network owner, the centralized dashboard showing all 5 branches in one place is invaluable.',
  },
  {
    name: 'Dr. Zainab Farooq',
    role: 'Principal',
    school: 'Ghazali International School, Multan',
    avatar: 'ZF',
    color: 'rose',
    rating: 5,
    text: 'The exam result module is exceptional. Grading, ranking, result cards — everything automated. My teachers are so relieved. The system is also very easy to use for non-technical staff.',
  },
];

const COLORS = {
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
};

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Schools that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              love The Clouds Academy
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Hear directly from principals, administrators, and directors across Pakistan.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-16 h-16 text-indigo-600" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-slate-600 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${COLORS[t.color]}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-xs text-indigo-600 font-medium">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-16 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-8 border border-indigo-100 text-center">
          <p className="text-2xl font-extrabold text-slate-900 mb-2">Join 500+ schools already using The Clouds Academy</p>
          <p className="text-slate-500 text-base">From single-campus schools to 10+ branch networks — we&apos;ve got you covered.</p>
        </div>
      </div>
    </section>
  );
}
