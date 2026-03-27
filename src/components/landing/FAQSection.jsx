'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is there a free trial available?',
    a: 'Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start. You can explore the complete system before deciding.',
  },
  {
    q: 'Can I manage multiple school branches from one account?',
    a: 'Absolutely. Our Growth and Enterprise plans support multiple branches. Each branch has its own isolated data but you can view centralized reports and analytics across all branches from a single super admin account.',
  },
  {
    q: 'Is the system available in Urdu?',
    a: 'Our support team communicates fully in Urdu via WhatsApp and email. The interface is in English for now, but an Urdu interface is on our roadmap for Q3 2026.',
  },
  {
    q: 'How secure is my school data?',
    a: 'We use industry-standard JWT authentication, HTTPS encryption in transit, daily encrypted cloud backups, and role-based access control. Your data is hosted on enterprise-grade servers with 99.9% uptime SLA.',
  },
  {
    q: 'Can I import existing student data from Excel?',
    a: 'Yes! We provide an Excel template for bulk import of students, teachers, fees, and attendance records. Our onboarding team also offers free data migration assistance for Enterprise plans.',
  },
  {
    q: 'What modules are included in each plan?',
    a: 'All plans include student management, fee management, and attendance. The Growth plan adds exams, advanced analytics, multi-branch, and export features. Enterprise includes everything plus custom integrations and white-label options.',
  },
  {
    q: 'Do you offer on-site training?',
    a: 'Yes! Enterprise plan customers get on-site training and setup. Starter and Growth customers get recorded video tutorials, documentation, and live support via WhatsApp.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel anytime from your account settings. For monthly plans, cancellation takes effect at the end of the billing period. Annual plans are non-refundable but data can be exported before cancellation.',
  },
  {
    q: 'Is this suitable for a school with only 100 students?',
    a: 'Absolutely! Our Starter plan supports up to 300 students and is priced affordably for smaller schools. Many single-teacher schools also use the system effectively.',
  },
  {
    q: 'How does the fee management module work?',
    a: 'You define fee structures per class (tuition, transport, activity, etc.). The system automatically generates monthly vouchers, tracks payments, calculates late fees, prints receipts, and generates defaulter lists — all automated.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Everything you need to know before getting started.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={`text-base font-semibold ${isOpen ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen ? 'bg-indigo-600 rotate-180' : 'bg-slate-100'
                  }`}>
                    <ChevronDown className={`w-3.5 h-3.5 ${isOpen ? 'text-white' : 'text-slate-500'}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
          Still have questions?{' '}
          <a href="mailto:support@thecloudsacademy.pk" className="text-indigo-600 font-semibold hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </section>
  );
}
