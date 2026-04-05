'use client';

import { DollarSign, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useStudentFees, useStudentProfile } from '@/hooks/useStudentPortal';

export default function StudentFeesPage() {
  const { data: feesRes, isLoading } = useStudentFees();
  const { data: profileRes } = useStudentProfile();

  const fees = feesRes?.data || {};
  const summary = fees.summary || {};
  const vouchers = fees.vouchers || [];
  const profile = profileRes?.data || {};

  if (isLoading) {
    return <div className="max-w-4xl mx-auto text-sm text-slate-500">Loading fee record...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" /> Fee Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">{profile.name || 'Student'} | {profile.class_name || '-'}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric label="Total Due" value={summary.total_due || 0} />
        <Metric label="Total Paid" value={summary.total_paid || 0} color="text-emerald-600" />
        <Metric label="Pending Vouchers" value={summary.pending_vouchers || 0} color="text-amber-600" />
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-800">Vouchers</h2>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No fee vouchers found.</div>
        ) : (
          <div className="divide-y">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{voucher.title || 'Voucher'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Due: {voucher.due_date ? new Date(voucher.due_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">PKR {Number(voucher.amount || 0).toLocaleString()}</p>
                  <Status status={voucher.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, color = 'text-slate-800' }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className={`text-2xl font-bold ${color}`}>PKR {Number(value || 0).toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function Status({ status }) {
  if (status === 'paid') return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Paid</span>;
  if (status === 'overdue') return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Overdue</span>;
  return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>;
}
