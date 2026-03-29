// import Link from 'next/link';
// import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';

// const FOOTER_LINKS = {
//   Product: [
//     { label: 'Features', href: '#features' },
//     { label: 'Modules', href: '#modules' },
//     { label: 'Pricing', href: '#pricing' },
//     { label: 'Changelog', href: '#' },
//     { label: 'Roadmap', href: '#' },
//   ],
//   Company: [
//     { label: 'About Us', href: '#' },
//     { label: 'Blog', href: '#' },
//     { label: 'Careers', href: '#' },
//     { label: 'Press Kit', href: '#' },
//     { label: 'Contact', href: '#' },
//   ],
//   'Support & Legal': [
//     { label: 'Help Center', href: '#' },
//     { label: 'WhatsApp Support', href: '#' },
//     { label: 'Status Page', href: '#' },
//     { label: 'Privacy Policy', href: '#' },
//     { label: 'Terms of Service', href: '#' },
//   ],
//   'Modules': [
//     { label: 'Student Management', href: '#modules' },
//     { label: 'Fee Management', href: '#modules' },
//     { label: 'Attendance System', href: '#modules' },
//     { label: 'Exam & Results', href: '#modules' },
//     { label: 'Branch Management', href: '#modules' },
//   ],
// };

// const SOCIALS = [
//   { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-400 hover:bg-blue-400/10' },
//   { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400 hover:bg-sky-400/10' },
//   { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400 hover:bg-pink-400/10' },
//   { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500 hover:bg-blue-500/10' },
//   { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-400 hover:bg-red-400/10' },
//   { icon: MessageCircle, href: 'https://wa.me/923001234567', label: 'WhatsApp', color: 'hover:text-emerald-400 hover:bg-emerald-400/10' },
// ];

// export default function Footer() {
//   return (
//     <footer className="bg-slate-950 border-t border-white/5">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Top section */}
//         <div className="py-14 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5 lg:gap-10">
//           {/* Brand */}
//           <div className="col-span-2 sm:col-span-4 lg:col-span-1">
//             <Link href="/" className="flex items-center gap-2.5 group mb-5">
//               <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
//                 <GraduationCap className="w-5 h-5 text-white" />
//               </div>
//               <div className="flex flex-col leading-none">
//                 <span className="text-sm font-bold text-white">The Clouds</span>
//                 <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">Academy</span>
//               </div>
//             </Link>
//             <p className="text-sm text-slate-400 leading-relaxed mb-5">
//               Pakistan&apos;s most trusted School Management SaaS — built for modern educational institutions.
//             </p>
//             <div className="flex flex-wrap items-center gap-2">
//               {SOCIALS.map((s) => {
//                 const Icon = s.icon;
//                 return (
//                   <a
//                     key={s.label}
//                     href={s.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     aria-label={s.label}
//                     className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all duration-200 ${s.color}`}
//                   >
//                     <Icon className="w-4 h-4" />
//                   </a>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Links */}
//           {Object.entries(FOOTER_LINKS).map(([category, links]) => (
//             <div key={category}>
//               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">{category}</p>
//               <ul className="flex flex-col gap-2.5">
//                 {links.map((link) => (
//                   <li key={link.label}>
//                     <Link
//                       href={link.href}
//                       className="text-sm text-slate-500 hover:text-white transition-colors"
//                     >
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Divider */}
//         <div className="border-t border-white/5" />

//         {/* Bottom bar */}
//         <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
//           <p className="text-sm text-slate-600">
//             © {new Date().getFullYear()} The Clouds Academy by{' '}
//             <span className="text-indigo-400 font-semibold">Globium Clouds</span>. All rights reserved.
//           </p>
//           <div className="flex items-center gap-4">
//             <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</Link>
//             <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
//             <Link href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Cookies</Link>
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 bg-emerald-500 rounded-full" />
//               <span className="text-xs text-emerald-600 font-medium">All systems operational</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }





'use client';
import Link from 'next/link';
import { 
  GraduationCap, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, MessageCircle, Heart 
} from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Modules', href: '#modules' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  'Support & Legal': [
    { label: 'Help Center', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
  ],
  'Core Modules': [
    { label: 'Student Management', href: '#modules' },
    { label: 'Fee Management', href: '#modules' },
    { label: 'Attendance System', href: '#modules' },
    { label: 'Exam & Results', href: '#modules' },
  ],
};

const SOCIALS = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
  { icon: MessageCircle, href: 'https://wa.me/923001234567', label: 'WhatsApp', color: 'hover:bg-emerald-600' },
];

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/5 relative overflow-hidden">
      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-20 grid grid-cols-2 gap-12 sm:grid-cols-4 lg:grid-cols-6 lg:gap-8">
          
          {/* Brand & Mission */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none">THE CLOUDS</span>
                <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase leading-none mt-1">Academy</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering Pakistani educational institutions with world-class management tools. Join the digital revolution today.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-transparent transition-all duration-300 ${s.color}`}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-indigo-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Bottom Bar */}
        <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} The Clouds Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Pakistan for the world.
            </div>
          </div>

          {/* System Status & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Cookies</Link>
            </div>
            <div className="px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}