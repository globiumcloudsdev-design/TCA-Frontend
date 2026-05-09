'use client';
import { Inter } from 'next/font/google';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import ModulesSection from './ModulesSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

const inter = Inter({ subsets: ['latin'] });

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-tca-bg text-white ${inter.className}`}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ModulesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
