'use client';

import React, { useMemo } from 'react';
import { fmtDate, fmtAmount } from '@/lib/formatters';
import { resolveBranchName } from '@/lib/branchUtils';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLabel = (label = '') => String(label || '').toLowerCase().trim();

export default function CompactFeeVoucher({
  studentData = {},
  feeStructure = [],
  instituteData = {},
  voucherMeta = {},
  className = '',
}) {
  const schoolName = instituteData.name || instituteData.institute_name || voucherMeta.instituteName || 'School Management System';
  const schoolAddress = instituteData.address || instituteData.campus_address || instituteData.city || '';
  const schoolPhone = instituteData.phone || instituteData.contact || '';
  
  const voucherNo = voucherMeta.voucherNumber || voucherMeta.voucher_number || voucherMeta.voucherNo || voucherMeta.id || 'N/A';
  const paymentDate = voucherMeta.paymentDate || voucherMeta.payment_date || voucherMeta.issueDate || voucherMeta.issuedDate || voucherMeta.generatedDate || new Date();
  
  const studentName = studentData.studentName || studentData.name || 'Student';
  const regNo = studentData.registrationNo || studentData.registration_no || studentData.studentId || studentData.rollNumber || null;
  const classNameVal = studentData.className || studentData.class_name || studentData.class || '';
  const sectionNameVal = studentData.sectionName || studentData.section_name || studentData.section || '';
  const classAndSection = [classNameVal, sectionNameVal].filter(Boolean).join(' - ') || 'N/A';
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

  const monthLabel = voucherMeta.month || voucherMeta.monthLabel || voucherMeta.fee_month || 'N/A';
  const yearLabel = voucherMeta.year || (new Date().getFullYear());
  const monthPeriod = `${monthLabel} ${yearLabel}`.trim();

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
      return !lower.includes('total amount') && !lower.includes('remaining amount') && !lower.includes('paid amount') && item.amount !== 0;
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
    
    // If status is paid and no explicit paid amount, default to totalAmount
    const status = String(voucherMeta.status || '').toLowerCase();
    if (status === 'paid') return totalAmount;
    return 0;
  }, [voucherMeta, totalAmount]);

  const remainingBalance = useMemo(() => {
    if (voucherMeta.remainingAmount !== undefined && voucherMeta.remainingAmount !== null) return Math.max(0, toNumber(voucherMeta.remainingAmount));
    if (voucherMeta.pending_amount !== undefined && voucherMeta.pending_amount !== null) return Math.max(0, toNumber(voucherMeta.pending_amount));
    return Math.max(0, totalAmount - paidAmount);
  }, [voucherMeta, totalAmount, paidAmount]);

  return (
    <div
      className={`compact-fee-receipt fee-voucher-print-target bg-white text-slate-900 border border-slate-300 shadow-sm mx-auto p-4 ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: '105mm',
        minHeight: '140mm',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif',
        fontSize: '11px',
        lineHeight: '1.35',
        backgroundColor: '#ffffff',
        color: '#0f172a',
      }}
    >
      {/* ── 1. HEADER ── */}
      <div className="text-center pb-2 border-b border-dashed border-slate-400">
        {instituteData.logo ? (
          <div className="flex justify-center mb-1">
            <img
              src={instituteData.logo}
              alt="Logo"
              className="h-8 w-8 object-contain"
              crossOrigin="anonymous"
            />
          </div>
        ) : null}
        <h1 className="text-sm font-black uppercase tracking-tight text-slate-950">
          {schoolName}
        </h1>
        {schoolAddress && (
          <p className="text-[9px] text-slate-600 truncate mt-0.5">{schoolAddress}</p>
        )}
        {schoolPhone && (
          <p className="text-[9px] text-slate-600 mt-0.5">Tel: {schoolPhone}</p>
        )}
        <div className="inline-block mt-1 bg-slate-900 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded tracking-wider">
          Fee Voucher / Receipt
        </div>
      </div>

      {/* ── 2. TRANSACTION DETAILS ── */}
      <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px]">
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-slate-600">Date:</span>
          <span className="font-bold text-slate-900">{fmtDate(paymentDate)}</span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-slate-600">Voucher No:</span>
          <span className="font-mono font-black text-slate-950">{voucherNo}</span>
        </div>
      </div>

      {/* ── 3. STUDENT INFORMATION ── */}
      <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px]">
        <div className="flex justify-between items-start py-0.5">
          <span className="font-semibold text-slate-600 shrink-0">Student:</span>
          <span className="font-bold text-slate-900 text-right">{studentName}</span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-slate-600">Class &amp; Section:</span>
          <span className="font-medium text-slate-900">{classAndSection}</span>
        </div>
        {branchName && (
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600">Branch:</span>
            <span className="font-medium text-slate-900">{branchName}</span>
          </div>
        )}
        {regNo && (
          <div className="flex justify-between items-center py-0.5">
            <span className="font-semibold text-slate-600">Reg #:</span>
            <span className="font-mono text-slate-800">{regNo}</span>
          </div>
        )}
      </div>

      {/* ── 4. PAID DETAILS SECTION ── */}
      <div className="py-2 border-b border-dashed border-slate-400">
        <div className="flex justify-between items-center pb-1 text-[10.5px] font-semibold text-slate-700">
          <span>Fee Month / Period:</span>
          <span className="font-bold text-slate-950">{monthPeriod}</span>
        </div>

        {/* Detailed Breakdown (if items exist) */}
        {feeRows.length > 0 && (
          <div className="my-1.5 pt-1 border-t border-dotted border-slate-300">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="text-left py-0.5">Description</th>
                  <th className="text-right py-0.5">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100/60">
                    <td className="py-0.5 text-slate-700">{row.label}</td>
                    <td className="text-right py-0.5 font-mono text-slate-900">
                      {fmtAmount(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total & Paid Summary Rows */}
        <div className="space-y-1 pt-1.5 text-[11px]">
          <div className="flex justify-between items-center font-bold">
            <span className="text-slate-800">Total Fee Amount:</span>
            <span className="font-mono text-slate-950">PKR {fmtAmount(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-emerald-700 bg-emerald-50/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
            <span>Amount Paid:</span>
            <span className="font-mono">PKR {fmtAmount(paidAmount)}</span>
          </div>
        </div>
      </div>

      {/* ── 5. UNPAID BALANCE SECTION ── */}
      <div className="my-2 p-2 rounded bg-slate-50 border border-slate-300 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="font-bold uppercase tracking-tight text-slate-700">
            Unpaid Balance:
          </span>
          <span
            className={`font-mono font-black ${
              remainingBalance > 0 ? 'text-rose-600 text-xs' : 'text-emerald-600'
            }`}
          >
            PKR {fmtAmount(remainingBalance)}
          </span>
        </div>
        {remainingBalance === 0 ? (
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5 text-right">
            ✓ Fully Settled
          </p>
        ) : (
          <p className="text-[9px] text-rose-500 font-medium mt-0.5 text-right">
            Pending dues to clear
          </p>
        )}
      </div>

      {/* ── 6. FOOTER ── */}
      <div className="pt-2 text-center text-[9.5px] font-medium text-slate-600 border-t border-dashed border-slate-400">
        <p className="tracking-tight text-slate-700 font-semibold">
          Powered by TCA The Clouds Academy | 03352778488
        </p>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
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
            padding: 4mm !important;
          }
        }
      `}</style>
    </div>
  );
}
