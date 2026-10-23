'use client';

import React from 'react';

export default function VoucherFooter({
  instituteData = {},
  voucherMeta = {},
  isLandscape = false,
  theme,
}) {
  const bankDetails =
    instituteData?.settings?.bank_details ||
    instituteData?.bank_account ||
    instituteData?.bank_name ||
    voucherMeta?.bankDetails ||
    null;

  return (
    <footer className="mt-auto pt-1 text-[8px] text-slate-600">
      {/* ── Bank / Instructions Note ── */}
      <div className="space-y-0.5 border-t pt-1" style={{ borderColor: '#e2e8f0' }}>
        {bankDetails ? (
          <p className="font-semibold text-slate-800 truncate" title={String(bankDetails)}>
            Deposit at: {bankDetails}
          </p>
        ) : null}
        <p className="text-[7.5px] leading-tight text-slate-500">
          • Deposit on or before due date to avoid fine. Fee is non-refundable.
        </p>
      </div>

      {/* ── Signature Lines ── */}
      <div className="mt-4 flex items-end justify-between px-1">
        <div className="text-center">
          <div className="mb-0.5 w-16 border-b border-slate-500" />
          <span className="text-[7.5px] font-bold text-slate-700">Cashier / Bank</span>
        </div>

        <div className="text-center">
          <div className="mb-0.5 w-16 border-b border-slate-500" />
          <span className="text-[7.5px] font-bold text-slate-700">Authorized Sign</span>
        </div>
      </div>
    </footer>
  );
}
