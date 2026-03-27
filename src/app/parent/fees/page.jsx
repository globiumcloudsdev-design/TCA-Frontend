'use client';

import { useState } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import usePortalStore from '@/store/portalStore';
import { DUMMY_PARENTS } from '@/data/portalDummyData';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import { Badge } from '@/components/ui/badge';

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS = {
  paid:    { label: 'Paid',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle,  ic: 'text-emerald-600' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200',       icon: Clock,        ic: 'text-amber-600'   },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700 border-red-200',             icon: AlertCircle,  ic: 'text-red-600'     },
  partial: { label: 'Partial', cls: 'bg-orange-100 text-orange-700 border-orange-200',    icon: AlertCircle,  ic: 'text-orange-600'  },
};

export default function ParentFeesPage() {
  const { portalUser } = usePortalStore();
  const parent = portalUser || DUMMY_PARENTS[0];
  const t = getPortalTerms(parent?.institute_type);
  const children = parent.children || [];
  const [selectedChild, setSelectedChild] = useState(0);

  const child = children[selectedChild];
  const fees = child?.fees || [];

  const totalPaid    = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.amount - (f.discount || 0)), 0);
  const totalPending = fees.filter((f) => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Fee Record</h1>
        <p className="text-sm text-slate-500 mt-1">Monthly fee status and payment history.</p>
      </div>

      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c, i) => (
            <button key={c.id} onClick={() => setSelectedChild(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedChild === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
              {c.first_name} {c.last_name}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Paid</p>
          <p className="text-2xl font-extrabold text-emerald-600">PKR {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Pending / Overdue</p>
          <p className="text-2xl font-extrabold text-amber-600">PKR {totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Invoiced</p>
          <p className="text-2xl font-extrabold text-slate-700">PKR {fees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Fee table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Fee History — {child?.first_name}</h2>
          <span className="text-xs text-slate-400">{fees.length} records</span>
        </div>
        <div className="divide-y divide-slate-50">
          {fees.length === 0 && (
            <p className="text-sm text-slate-400 p-6 text-center">No fee records found.</p>
          )}
          {fees.map((fee) => {
            const st = STATUS[fee.status] || STATUS.pending;
            const StIcon = st.icon;
            const netAmount = fee.amount - (fee.discount || 0);
            return (
              <div key={fee.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.cls}`}>
                    <StIcon className={`w-4 h-4 ${st.ic}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {MONTHS[fee.month]} {fee.year}
                    </p>
                    <p className="text-xs text-slate-400">
                      Due: {fee.due_date}
                      {fee.discount > 0 && <span className="ml-2 text-emerald-600">Discount: PKR {fee.discount.toLocaleString()}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">PKR {netAmount.toLocaleString()}</p>
                    {fee.paid_on && <p className="text-[10px] text-slate-400">Paid: {fee.paid_on}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Outstanding Payment Required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              PKR {totalPending.toLocaleString()} is outstanding. Please clear dues before the next due date to avoid late fee charges. Contact the accounts office for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
