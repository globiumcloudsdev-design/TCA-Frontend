
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, GraduationCap, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '/features' }, // Features page link
  { label: 'Solutions', href: '#modules' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl border border-white/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tight leading-none">THE CLOUDS</span>
              <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase leading-none mt-1">Academy</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center bg-white/5 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-all relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-5 right-5 h-px bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <span className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">
                Log in
              </span>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-indigo-50 font-bold px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5">
                Join Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white transition-colors hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-slate-900 border-l border-white/10 z-[101] md:hidden transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end mb-8">
            <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-400"><X /></button>
          </div>
          
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-xl font-bold text-white p-2 hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12 rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl shadow-lg shadow-indigo-600/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}