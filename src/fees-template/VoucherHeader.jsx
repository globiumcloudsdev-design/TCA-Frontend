'use client';

import React from 'react';
import { fmtDate } from '@/lib/formatters';

export default function VoucherHeader({
  instituteData = {},
  voucherMeta = {},
  copyLabel = 'PARENT COPY',
  isLandscape = false,
  theme,
}) {
  const schoolName =
    instituteData.name ||
    instituteData.institute_name ||
    voucherMeta.instituteName ||
    'School Management System';

  const logoUrl =
    instituteData.logo ||
    instituteData.logo_url ||
    instituteData.logoUrl ||
    voucherMeta.instituteLogo ||
    voucherMeta.logo;

  const schoolAddress =
    instituteData.address ||
    instituteData.campus_address ||
    instituteData.city ||
    '';
  const schoolPhone = instituteData.phone || instituteData.contact || '';
  const contactText = [schoolAddress, schoolPhone ? `Tel: ${schoolPhone}` : null]
    .filter(Boolean)
    .join(' | ');

  const voucherNo =
    voucherMeta.voucherNumber ||
    voucherMeta.voucher_number ||
    voucherMeta.voucherNo ||
    voucherMeta.id ||
    'N/A';

  const issueDate = fmtDate(
    voucherMeta.issueDate ||
    voucherMeta.issuedDate ||
    voucherMeta.generatedDate ||
    voucherMeta.createdAt
  );

  const dueDate = fmtDate(
    voucherMeta.dueDate ||
    voucherMeta.due_date
  );

  return (
    <header className="mb-1.5 border-b pb-1.5" style={{ borderColor: '#cbd5e1' }}>
      {/* ── Top Bar: Logo, School Name & Copy Badge ── */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className={isLandscape ? "h-6 w-6 shrink-0 object-contain" : "h-7 w-7 shrink-0 object-contain"}
              crossOrigin="anonymous"
            />
          ) : null}
          <div className="min-w-0 leading-tight">
            <h1
              className={`font-black uppercase tracking-tight text-slate-950 truncate ${
                isLandscape ? 'text-[12px]' : 'text-[14px]'
              }`}
              title={schoolName}
            >
              {schoolName}
            </h1>
            {contactText ? (
              <p className="text-[8px] text-slate-500 truncate max-w-[200px]" title={contactText}>
                {contactText}
              </p>
            ) : null}
          </div>
        </div>

        {/* Copy Badge */}
        <div className="shrink-0 text-right">
          <span className="inline-block rounded border border-slate-700 bg-slate-100 px-1.5 py-[1px] text-[8.5px] font-black uppercase tracking-wide text-slate-900 shadow-xs">
            {copyLabel}
          </span>
          <div className="text-[8px] font-semibold text-slate-500 uppercase mt-0.5">
            Fee Challan
          </div>
        </div>
      </div>

      {/* ── Metadata Strip: Voucher No, Issue Date, Due Date ── */}
      <div
        className="mt-1.5 grid grid-cols-3 gap-1 rounded bg-slate-50 px-1.5 py-1 text-[9px] border"
        style={{ borderColor: '#e2e8f0' }}
      >
        <div className="truncate">
          <span className="font-semibold text-slate-500">Challan #:</span>{' '}
          <span className="font-mono font-bold text-slate-900">{voucherNo}</span>
        </div>
        <div className="text-center truncate">
          <span className="font-semibold text-slate-500">Issue:</span>{' '}
          <span className="text-slate-800">{issueDate}</span>
        </div>
        <div className="text-right truncate">
          <span className="font-semibold text-rose-600">Due Date:</span>{' '}
          <span className="font-bold text-rose-700">{dueDate}</span>
        </div>
      </div>
    </header>
  );
}
