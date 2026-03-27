'use client';
import { useState } from 'react';
import { CheckCircle, X, Zap, Crown, Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const PLANS = [
  {
    id: 'starter',
    icon: Zap,
    name: 'Starter',
    tagline: 'Perfect for small schools',
    priceMonthly: 4999,
    priceYearly: 3999,
    color: 'slate',
    gradient: 'from-slate-600 to-slate-700',
    popular: false,
    features: [
      { text: 'Up to 300 students', included: true },
      { text: '1 campus / branch', included: true },
      { text: 'Student management', included: true },
      { text: 'Fee management', included: true },
      { text: 'Attendance tracking', included: true },
      { text: 'Basic reports (PDF/CSV)', included: true },
      { text: '3 user accounts', included: true },
      { text: 'Email support', included: true },
      { text: 'Exam management', included: false },
      { text: 'Multi-branch', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'growth',
    icon: Star,
    name: 'Growth',
    tagline: 'Most popular for growing schools',
    priceMonthly: 9999,
    priceYearly: 7999,
    color: 'indigo',
    gradient: 'from-indigo-600 to-violet-600',
    popular: true,
    features: [
      { text: 'Up to 1,500 students', included: true },
      { text: 'Up to 3 branches', included: true },
      { text: 'All Starter features', included: true },
      { text: 'Exam & results module', included: true },
      { text: 'Advanced analytics & charts', included: true },
      { text: 'Export PDF/Excel/CSV/JSON', included: true },
      { text: '15 user accounts', included: true },
      { text: 'WhatsApp + email support', included: true },
      { text: 'Custom fee structures', included: true },
      { text: 'Role-based access control', included: true },
      { text: 'White-label branding', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    id: 'enterprise',
    icon: Crown,
    name: 'Enterprise',
    tagline: 'For large networks & chains',
    priceMonthly: null,
    priceYearly: null,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    popular: false,
    features: [
      { text: 'Unlimited students', included: true },
      { text: 'Unlimited branches', included: true },
      { text: 'All Growth features', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Custom integrations (API)', included: true },
      { text: 'SLA with 99.9% uptime', included: true },
      { text: 'Unlimited user accounts', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'On-site training & setup', included: true },
      { text: 'Custom report builder', included: true },
      { text: 'Priority 24/7 support', included: true },
      { text: 'Custom data migration', included: true },
    ],
  },
];

function PriceTag({ plan, yearly }) {
  if (!plan.priceMonthly) {
    return (
      <div className="my-5">
        <p className="text-4xl font-extrabold text-slate-900">Custom</p>
        <p className="text-sm text-slate-500 mt-1">Contact us for pricing</p>
      </div>
    );
  }
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  return (
    <div className="my-5">
      <div className="flex items-end gap-1">
        <span className="text-lg font-semibold text-slate-500">PKR</span>
        <span className="text-4xl font-extrabold text-slate-900">{price.toLocaleString()}</span>
        <span className="text-slate-500 mb-1">/mo</span>
      </div>
      {yearly && (
        <p className="text-xs text-emerald-600 font-semibold mt-1">
          Save PKR {((plan.priceMonthly - plan.priceYearly) * 12).toLocaleString()}/year
        </p>
      )}
    </div>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            No hidden charges, no surprise bills. Pay monthly or save 20% with annual billing.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? 'bg-indigo-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${yearly ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? 'text-white' : 'text-slate-500'}`}>
              Yearly
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white shadow-2xl shadow-indigo-900/50 lg:scale-105 ring-2 ring-indigo-500'
                    : 'bg-slate-800/60 border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-center py-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Most Popular</span>
                  </div>
                )}

                <div className="p-7">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${plan.popular ? 'text-slate-900' : 'text-white'}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>{plan.tagline}</p>

                  <PriceTag plan={plan} yearly={yearly} />

                  <Link href="/login">
                    <Button
                      className={`w-full font-semibold mb-6 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                          : plan.id === 'enterprise'
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`
                          : 'bg-slate-700 text-white hover:bg-slate-600 border border-white/20'
                      }`}
                    >
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </Link>

                  <div className="space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2.5">
                        {f.included ? (
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-indigo-600' : 'text-emerald-500'}`} />
                        ) : (
                          <X className="w-4 h-4 flex-shrink-0 text-slate-600" />
                        )}
                        <span className={`text-sm ${f.included ? (plan.popular ? 'text-slate-700' : 'text-slate-300') : 'text-slate-600 line-through'}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Below */}
        <p className="text-center text-slate-500 text-sm mt-10">
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
