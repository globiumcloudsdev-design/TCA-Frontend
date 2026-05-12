'use client';
import { useState } from 'react';
import { CheckCircle, X, Zap, Star, Crown, Sparkles, PhoneCall, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { publicService } from '@/services';
import { useQuery } from '@tanstack/react-query';

// Helper to format features from the database JSON
const formatFeatures = (featuresJson, limits) => {
  const list = [
    { text: `${limits?.max_students || 0} Students Limit`, included: true },
    { text: `${limits?.max_branches || 1} Campus / Branch`, included: true },
    { text: 'Student Management', included: !!featuresJson?.student_management },
    { text: 'Fee Management', included: !!featuresJson?.fee_management },
    { text: 'Attendance System', included: !!featuresJson?.attendance_system },
    { text: 'Parent Portal Access', included: !!featuresJson?.parent_portal },
    { text: 'Teacher Portal Access', included: !!featuresJson?.teacher_portal },
    { text: 'Exam & Result Module', included: !!featuresJson?.exam_management },
    { text: 'Reports & Analytics', included: !!featuresJson?.basic_reports },
    { text: 'WhatsApp/SMS Alerts', included: !!featuresJson?.sms_notifications || !!featuresJson?.whatsapp_integration },
  ];
  return list;
};

const PLAN_ICONS = {
  BASIC: Zap,
  STANDARD: Star,
  PREMIUM: Crown,
  ENTERPRISE: Crown,
};

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['public-pricing-plans'],
    queryFn: () => publicService.getPricingPlans(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section id="pricing" className="py-24 bg-tca-bg relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-tca-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-tca-primary/10 text-tca-primary border-tca-primary/10 px-4 py-1">
            Flexible Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-tca-primary to-tca-primary">School's Future</span>
          </h2>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-bold ${!yearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-14 h-7 rounded-full bg-slate-800 border border-white/10 transition-colors p-1"
            >
              <div className={`w-5 h-5 bg-tca-primary rounded-full transition-transform duration-300 ${yearly ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${yearly ? 'text-white' : 'text-slate-500'}`}>
              Yearly <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">SAVE 20%</Badge>
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-tca-primary" />
            <p className="font-medium">Fetching best plans for you...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.code] || Star;
              const features = formatFeatures(plan.features, plan.limits);
              const displayPrice = yearly ? (plan.price * 10) : plan.price;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col ${
                    plan.is_popular 
                    ? 'bg-slate-900 border-2 border-tca-primary shadow-[0_0_40px_rgba(79,70,229,0.2)] scale-105 z-10' 
                    : 'bg-slate-900/50 border border-white/5 hover:border-white/20'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-tca-dark to-tca-primary text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.is_popular ? 'bg-tca-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-2">{plan.description || 'Professional school management solution.'}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-400 text-sm font-bold">{plan.currency || 'PKR'}</span>
                      <span className="text-5xl font-black text-white tracking-tighter">
                        {Number(displayPrice).toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm font-medium">/{yearly ? 'yr' : 'mo'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {f.included ? (
                          <CheckCircle className={`w-5 h-5 mt-0.5 ${plan.is_popular ? 'text-tca-primary' : 'text-emerald-500'}`} />
                        ) : (
                          <X className="w-5 h-5 mt-0.5 text-slate-700" />
                        )}
                        <span className={`text-sm font-medium ${f.included ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href="/login" className="mt-auto">
                    <Button 
                      className={`w-full h-14 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        plan.is_popular 
                        ? 'bg-tca-primary hover:bg-tca-primary text-white shadow-lg shadow-tca-primary/10' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      Start {plan.trial_days}-Day Free Trial
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison Note */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4" /> 
            Need a custom plan for 5+ branches? <Link href="/login" className="text-tca-primary hover:underline font-bold">Talk to our experts</Link>
          </p>
        </div>
      </div>
    </section>
  );
}