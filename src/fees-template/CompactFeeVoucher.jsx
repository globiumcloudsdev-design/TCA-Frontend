'use client';

import React, { useMemo } from 'react';
import { fmtDate, fmtAmount } from '@/lib/formatters';
import { resolveBranchName } from '@/lib/branchUtils';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLabel = (label = '') => String(label || '').toLowerCase().trim();

const cleanString = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (/^n\/?a$/i.test(trimmed) || /^undefined$/i.test(trimmed) || /^null$/i.test(trimmed) || trimmed === '—') {
    return '';
  }
  return trimmed;
};

export default function CompactFeeVoucher({
  studentData = {},
  feeStructure = [],
  instituteData = {},
  voucherMeta = {},
  pageSize = null,
  orientation = null,
  className = '',
}) {
  const schoolName =
    cleanString(instituteData.name) ||
    cleanString(instituteData.institute_name) ||
    cleanString(voucherMeta.instituteName) ||
    'The Clouds Academy';

  const logoUrl =
    instituteData.logo ||
    instituteData.logo_url ||
    instituteData.logoUrl ||
    voucherMeta.instituteLogo ||
    voucherMeta.logo;

  const schoolAddress =
    cleanString(instituteData.address) ||
    cleanString(instituteData.campus_address) ||
    cleanString(instituteData.city) ||
    '';
  const schoolPhone = cleanString(instituteData.phone) || cleanString(instituteData.contact) || '';
  
  const voucherNo =
    cleanString(voucherMeta.voucherNumber) ||
    cleanString(voucherMeta.voucher_number) ||
    cleanString(voucherMeta.voucherNo) ||
    cleanString(voucherMeta.id) ||
    'N/A';

  const paymentDate =
    voucherMeta.paymentDate ||
    voucherMeta.payment_date ||
    voucherMeta.issueDate ||
    voucherMeta.issuedDate ||
    voucherMeta.generatedDate ||
    new Date();

  const dueDate = voucherMeta.dueDate || voucherMeta.due_date;
  
  // Student data resolution
  const studentName =
    cleanString(studentData.studentName) ||
    cleanString(studentData.name) ||
    cleanString(studentData.full_name) ||
    'Student';

  const fatherName =
    cleanString(studentData.fatherName) ||
    cleanString(studentData.father_name) ||
    cleanString(studentData.parent_name) ||
    cleanString(studentData.guardian_name) ||
    cleanString(voucherMeta.fatherName) ||
    cleanString(voucherMeta.father_name) ||
    '';

  const rawClassName =
    cleanString(studentData.className) ||
    cleanString(studentData.class_name) ||
    cleanString(studentData.class) ||
    cleanString(voucherMeta.className) ||
    cleanString(voucherMeta.class_name) ||
    '';

  const rawSectionName =
    cleanString(studentData.sectionName) ||
    cleanString(studentData.section_name) ||
    cleanString(studentData.section) ||
    cleanString(voucherMeta.sectionName) ||
    cleanString(voucherMeta.section_name) ||
    '';

  const classAndSection = rawClassName && rawSectionName
    ? `${rawClassName} - ${rawSectionName}`
    : rawClassName || rawSectionName || 'General';

  const regNo =
    cleanString(studentData.registrationNo) ||
    cleanString(studentData.registration_no) ||
    cleanString(studentData.rollNumber) ||
    cleanString(studentData.studentId) ||
    cleanString(voucherMeta.registrationNo) ||
    'N/A';

  const branchName = resolveBranchName(
    studentData.branch ||
    studentData.branch_name ||
    studentData.branch_id ||
    voucherMeta.branch ||
    voucherMeta.branch_name ||
    voucherMeta.branch_id ||
    instituteData.branch ||
    instituteData.branch_name ||
    instituteData.branch_id,
    null
  );

  const monthLabel = voucherMeta.month || voucherMeta.monthLabel || voucherMeta.fee_month || '';
  const yearLabel = voucherMeta.year || (new Date().getFullYear());
  const monthPeriod = [monthLabel, yearLabel].filter(Boolean).join(' ') || 'Current Period';

  const resolvedPageSize = String(pageSize || voucherMeta?.pageSize || voucherMeta?.page_size || instituteData?.settings?.print_settings?.page_size || 'A6').toUpperCase();
  const resolvedOrientation = String(orientation || voucherMeta?.orientation || instituteData?.settings?.print_settings?.orientation || instituteData?.print_settings?.orientation || 'portrait').toLowerCase();
  const isLandscape = resolvedOrientation === 'landscape' || resolvedOrientation === 'l';

  // Normalize fee items
  const feeRows = useMemo(() => {
    const rawList = Array.isArray(feeStructure) && feeStructure.length > 0
      ? feeStructure
      : [];

    return rawList.map((row) => ({
      label: row.feeType || row.label || row.name || 'Fee Item',
      amount: toNumber(row.amount),
    })).filter((item) => {
      const lower = normalizeLabel(item.label);
      return (
        !lower.includes('total amount') &&
        !lower.includes('remaining amount') &&
        !lower.includes('paid amount') &&
        !lower.includes('balance') &&
        item.amount !== 0
      );
    });
  }, [feeStructure]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    if (voucherMeta.netAmount !== undefined && voucherMeta.netAmount !== null) return toNumber(voucherMeta.netAmount);
    if (voucherMeta.net_amount !== undefined && voucherMeta.net_amount !== null) return toNumber(voucherMeta.net_amount);
    if (voucherMeta.amount !== undefined && voucherMeta.amount !== null) return toNumber(voucherMeta.amount);
    
    // Sum from feeRows
    const sum = feeRows.reduce((acc, row) => {
      const lower = normalizeLabel(row.label);
      if (lower.includes('discount') || lower.includes('concession')) {
        return acc - Math.abs(row.amount);
      }
      return acc + row.amount;
    }, 0);
    return Math.max(0, sum);
  }, [voucherMeta, feeRows]);

  const paidAmount = useMemo(() => {
    if (voucherMeta.paidAmount !== undefined && voucherMeta.paidAmount !== null) return toNumber(voucherMeta.paidAmount);
    if (voucherMeta.paid_amount !== undefined && voucherMeta.paid_amount !== null) return toNumber(voucherMeta.paid_amount);
    if (voucherMeta.amount_paid !== undefined && voucherMeta.amount_paid !== null) return toNumber(voucherMeta.amount_paid);

    // Sum from payment records if present
    const payments = voucherMeta.payments || voucherMeta.FeePayments;
    if (Array.isArray(payments) && payments.length > 0) {
      return payments.reduce((sum, p) => sum + toNumber(p.amount_paid || p.amount), 0);
    }

    // Check feeStructure for a Paid Amount row
    if (Array.isArray(feeStructure)) {
      const paidRow = feeStructure.find((r) => normalizeLabel(r.feeType || r.label).includes('paid'));
      if (paidRow && toNumber(paidRow.amount) > 0) {
        return toNumber(paidRow.amount);
      }
    }
    
    // If status is paid and no explicit paid amount, default to totalAmount
    const status = String(voucherMeta.status || voucherMeta.feeStatus || '').toLowerCase();
    if (status === 'paid' && totalAmount > 0) return totalAmount;
    return 0;
  }, [voucherMeta, totalAmount, feeStructure]);

  const remainingBalance = useMemo(() => {
    if (voucherMeta.remainingAmount !== undefined && voucherMeta.remainingAmount !== null) return Math.max(0, toNumber(voucherMeta.remainingAmount));
    if (voucherMeta.pending_amount !== undefined && voucherMeta.pending_amount !== null) return Math.max(0, toNumber(voucherMeta.pending_amount));
    return Math.max(0, totalAmount - paidAmount);
  }, [voucherMeta, totalAmount, paidAmount]);

  const rawStatus = String(voucherMeta.status || voucherMeta.feeStatus || '').toLowerCase();
  const isPaid = remainingBalance === 0 && (paidAmount > 0 || rawStatus === 'paid');
  const isPartial = paidAmount > 0 && remainingBalance > 0;
  const isUnpaid = !isPaid && !isPartial;

  return (
    <div
      className={`compact-fee-receipt fee-voucher-print-target flex flex-col justify-between bg-white text-slate-900 border border-slate-300 shadow-sm mx-auto ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: isLandscape ? '148mm' : (resolvedPageSize === 'A5' ? '148mm' : '105mm'),
        minHeight: isLandscape ? '100mm' : (resolvedPageSize === 'A5' ? '190mm' : '142mm'),
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '10px',
        lineHeight: '1.3',
        padding: '3mm 3.5mm',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        boxSizing: 'border-box',
      }}
    >
      {/* ── MAIN CONTENT (Header, Student Info, Fee Items, Totals) ── */}
      <div className="flex-1 flex flex-col justify-start min-w-0">
        {/* ── 1. HEADER ── */}
        <div className="text-center pb-1.5 border-b border-dashed border-slate-400">
          {logoUrl ? (
            <div className="flex justify-center mb-0.5">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-6 w-6 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          ) : null}
          <h1 className="text-xs font-black uppercase tracking-tight text-slate-950 truncate" title={schoolName}>
            {schoolName}
          </h1>
          {schoolAddress && (
            <p className="text-[8px] text-slate-600 truncate mt-0.5">{schoolAddress}</p>
          )}
          {schoolPhone && (
            <p className="text-[8px] text-slate-600 mt-0.5">Tel: {schoolPhone}</p>
          )}
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="inline-block bg-slate-900 text-white font-bold text-[8.5px] uppercase px-2 py-0.5 rounded tracking-wider">
              {isPaid ? 'Fee Payment Receipt' : isPartial ? 'Partial Fee Receipt' : 'Fee Voucher / Challan'}
            </span>
            <span
              className={`inline-block font-black text-[8px] uppercase px-1.5 py-0.5 rounded border ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : isPartial
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID'}
            </span>
          </div>
        </div>

        {/* ── 2. TRANSACTION DETAILS ── */}
        <div className="py-1 border-b border-dashed border-slate-300 text-[9px]">
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600">Issue Date:</span>
            <span className="font-bold text-slate-900">{fmtDate(paymentDate)}</span>
          </div>
          {dueDate && (
            <div className="flex justify-between items-center py-0.5">
              <span className="font-semibold text-rose-600">Due Date:</span>
              <span className="font-bold text-rose-700">{fmtDate(dueDate)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600">Voucher No:</span>
            <span className="font-mono font-black text-slate-950">{voucherNo}</span>
          </div>
        </div>

        {/* ── 3. STUDENT INFORMATION ── */}
        <div className="py-1 border-b border-dashed border-slate-300 text-[9px]">
          <div className="flex justify-between items-start py-0.5">
            <span className="font-semibold text-slate-600 shrink-0">Student:</span>
            <span className="font-bold text-slate-900 text-right truncate ml-2">{studentName}</span>
          </div>
          {fatherName && (
            <div className="flex justify-between items-start py-0.5">
              <span className="font-semibold text-slate-600 shrink-0">Father Name:</span>
              <span className="font-medium text-slate-800 text-right truncate ml-2">{fatherName}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600 shrink-0">Class &amp; Section:</span>
            <span className="font-bold text-slate-900 text-right">{classAndSection}</span>
          </div>
          {branchName && (
            <div className="flex justify-between items-center py-0.5">
              <span className="font-semibold text-slate-600 shrink-0">Branch:</span>
              <span className="font-medium text-slate-800 text-right">{branchName}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600 shrink-0">Roll / Reg #:</span>
            <span className="font-mono text-slate-900">{regNo}</span>
          </div>
        </div>

        {/* ── 4. FEE PARTICULARS TABLE ── */}
        <div className="py-1">
          <div className="flex justify-between items-center pb-0.5 text-[9px] font-semibold text-slate-700">
            <span>Fee Month:</span>
            <span className="font-bold text-slate-950">{monthPeriod}</span>
          </div>

          {/* Description Breakdown Table */}
          {feeRows.length > 0 && (
            <div className="my-1 rounded border border-slate-200 overflow-hidden">
              <table className="w-full text-[8.5px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="text-left px-1.5 py-0.5">Description</th>
                    <th className="text-right px-1.5 py-0.5">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRows.map((row, idx) => {
                    const isDisc = normalizeLabel(row.label).includes('discount') || normalizeLabel(row.label).includes('concession');
                    return (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-1.5 py-0.5 text-slate-700 truncate max-w-[120px]">{row.label}</td>
                        <td className={`px-1.5 py-0.5 text-right font-mono font-medium ${isDisc ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {isDisc ? `-${fmtAmount(Math.abs(row.amount))}` : fmtAmount(row.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 5. TOTALS & PAYMENT SUMMARY BOX ── */}
          <div className="rounded border border-slate-300 bg-slate-50 p-1.5 space-y-1 text-[9.5px]">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-800">Total Fee Amount:</span>
              <span className="font-mono text-slate-950 font-black">PKR {fmtAmount(totalAmount)}</span>
            </div>

            {/* If Paid or Partial: Show Paid Amount */}
            {!isUnpaid && (
              <div className="flex justify-between items-center font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                <span>Amount Paid:</span>
                <span className="font-mono font-black">PKR {fmtAmount(paidAmount)}</span>
              </div>
            )}

            {/* If Unpaid: Show Status clearly */}
            {isUnpaid && (
              <div className="flex justify-between items-center font-semibold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                <span>Payment Status:</span>
                <span className="font-bold uppercase tracking-wider">UNPAID (Pending)</span>
              </div>
            )}

            {/* Remaining Balance row */}
            <div className="flex justify-between items-center pt-0.5 border-t border-slate-200 text-[9px] font-bold">
              <span className="text-slate-700">Remaining Balance:</span>
              <span className={`font-mono font-black ${remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                PKR {fmtAmount(remainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. FOOTER (Strictly pinned at bottom via mt-auto, no overlap) ── */}
      <footer className="mt-auto pt-2 shrink-0 border-t border-dashed border-slate-400 text-center">
        <div className="flex items-end justify-between px-1 pb-1 text-[7.5px] text-slate-500">
          <div>
            <span>Verified By: ____________</span>
          </div>
          <div>
            <span>Authorized Signature: ____________</span>
          </div>
        </div>
        <p className="text-[8px] font-semibold tracking-tight text-slate-700">
          Powered by TCA The Clouds Academy
        </p>
      </footer>

      <style jsx global>{`
        @media print {
          @page {
            size: ${resolvedPageSize === 'A6' ? (isLandscape ? '148mm 105mm' : '105mm 148mm') : resolvedPageSize === 'A5' ? (isLandscape ? '210mm 148mm' : '148mm 210mm') : (isLandscape ? '148mm 105mm' : '80mm auto')};
            margin: 0mm;
          }

          body {
            background: #ffffff !important;
          }

          .compact-fee-receipt {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 3mm !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
