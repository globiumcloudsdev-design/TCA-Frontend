'use client';

import React from 'react';
import { fmtAmount } from '@/lib/formatters';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLabel = (label = '') => String(label || '').toLowerCase().trim();

const isDiscount = (label) => normalizeLabel(label).includes('discount') || normalizeLabel(label).includes('concession');
const isPaid = (label) => normalizeLabel(label).includes('paid amount') || normalizeLabel(label) === 'paid';
const isRemaining = (label) => normalizeLabel(label).includes('remaining amount') || normalizeLabel(label).includes('balance');
const isTotal = (label) => normalizeLabel(label).includes('total amount') || normalizeLabel(label) === 'total';
const isArrears = (label) => normalizeLabel(label).includes('arrear') || normalizeLabel(label).includes('previous');
const isPercent = (label) => /percent|percentage/.test(normalizeLabel(label));

export default function FeeTable({
  feeStructure = [],
  voucherMeta = {},
  isLandscape = false,
  theme,
}) {
  const normalizedRows = (Array.isArray(feeStructure) ? feeStructure : []).map((row) => ({
    feeType: row.feeType || row.label || row.name || 'Fee Item',
    amount: row.amount,
  }));

  // Filter out standalone summary rows so we calculate cleanly
  const baseRows = normalizedRows.filter(
    (row) =>
      !isPaid(row.feeType) &&
      !isRemaining(row.feeType) &&
      !isTotal(row.feeType) &&
      row.amount !== null &&
      row.amount !== undefined &&
      row.amount !== '' &&
      toNumber(row.amount) !== 0
  );

  // Calculate base total
  const chargeTotal = baseRows
    .filter((row) => !isDiscount(row.feeType) && !isPercent(row.feeType))
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const discountTotal = baseRows
    .filter((row) => isDiscount(row.feeType))
    .reduce((sum, row) => sum + Math.abs(toNumber(row.amount)), 0);

  const calculatedNet = Math.max(0, chargeTotal - discountTotal);

  // Voucher meta overrides if available
  const netAmount =
    voucherMeta.netAmount !== undefined && voucherMeta.netAmount !== null
      ? toNumber(voucherMeta.netAmount)
      : voucherMeta.net_amount !== undefined && voucherMeta.net_amount !== null
        ? toNumber(voucherMeta.net_amount)
        : voucherMeta.amount !== undefined && voucherMeta.amount !== null
          ? toNumber(voucherMeta.amount)
          : calculatedNet;

  const lateFee =
    voucherMeta.lateFee !== undefined && voucherMeta.lateFee !== null
      ? toNumber(voucherMeta.lateFee)
      : voucherMeta.late_fee !== undefined && voucherMeta.late_fee !== null
        ? toNumber(voucherMeta.late_fee)
        : 100;

  const totalAfterDue = netAmount + lateFee;

  const payments = voucherMeta.payments || voucherMeta.FeePayments;
  const paymentSum = Array.isArray(payments) && payments.length > 0
    ? payments.reduce((sum, p) => sum + toNumber(p.amount_paid || p.amount), 0)
    : 0;

  const paidAmount =
    voucherMeta.paidAmount !== undefined && voucherMeta.paidAmount !== null
      ? toNumber(voucherMeta.paidAmount)
      : voucherMeta.paid_amount !== undefined && voucherMeta.paid_amount !== null
        ? toNumber(voucherMeta.paid_amount)
        : voucherMeta.amount_paid !== undefined && voucherMeta.amount_paid !== null
          ? toNumber(voucherMeta.amount_paid)
          : paymentSum > 0
            ? paymentSum
            : String(voucherMeta.status || voucherMeta.feeStatus || '').toLowerCase() === 'paid'
              ? netAmount
              : 0;

  const remainingBalance = Math.max(0, netAmount - paidAmount);

  // Rows to display
  const displayItems = baseRows.length > 0 ? baseRows : [{ feeType: 'Tuition / Monthly Fee', amount: netAmount }];

  const headerBg = theme?.colors?.primary || '#0f4c81';

  return (
    <section className="mb-1.5 overflow-hidden rounded border" style={{ borderColor: '#cbd5e1' }}>
      <table className="w-full border-collapse text-[9.5px]">
        <thead>
          <tr style={{ backgroundColor: headerBg, color: '#ffffff' }}>
            <th className="px-2 py-1 text-left font-bold uppercase tracking-wider text-[8.5px]">
              Particulars
            </th>
            <th className="px-2 py-1 text-right font-bold uppercase tracking-wider text-[8.5px]">
              Amount (PKR)
            </th>
          </tr>
        </thead>

        <tbody>
          {displayItems.map((row, index) => {
            const isDisc = isDiscount(row.feeType);
            const isArr = isArrears(row.feeType);
            const val = toNumber(row.amount);

            return (
              <tr
                key={`${row.feeType}-${index}`}
                className="border-b"
                style={{ borderColor: '#e2e8f0', backgroundColor: index % 2 === 1 ? '#f8fafc' : '#ffffff' }}
              >
                <td className="px-2 py-[2.5px] font-medium text-slate-700 truncate max-w-[140px]">
                  {row.feeType}
                </td>
                <td
                  className={`px-2 py-[2.5px] text-right font-mono font-medium ${
                    isDisc ? 'text-emerald-700' : isArr ? 'text-amber-800' : 'text-slate-900'
                  }`}
                >
                  {isDisc ? `-${fmtAmount(Math.abs(val))}` : fmtAmount(val)}
                </td>
              </tr>
            );
          })}

          {/* ── Summary Rows ── */}
          <tr className="border-t-2 bg-slate-100 font-bold" style={{ borderColor: '#cbd5e1' }}>
            <td className="px-2 py-1 text-slate-900 uppercase text-[9px] tracking-tight">
              Payable Within Due Date:
            </td>
            <td className="px-2 py-1 text-right font-mono text-slate-950 font-black">
              PKR {fmtAmount(netAmount)}
            </td>
          </tr>

          {lateFee > 0 && (
            <tr className="border-b bg-rose-50/50 text-[8.5px]" style={{ borderColor: '#e2e8f0' }}>
              <td className="px-2 py-[2px] text-rose-700">Late Fee Fine (After Due Date):</td>
              <td className="px-2 py-[2px] text-right font-mono font-semibold text-rose-700">
                +{fmtAmount(lateFee)}
              </td>
            </tr>
          )}

          {lateFee > 0 && (
            <tr className="border-b bg-slate-50 font-semibold text-[9px]" style={{ borderColor: '#e2e8f0' }}>
              <td className="px-2 py-[2px] text-slate-800">Payable After Due Date:</td>
              <td className="px-2 py-[2px] text-right font-mono font-bold text-slate-900">
                PKR {fmtAmount(totalAfterDue)}
              </td>
            </tr>
          )}

          {paidAmount > 0 && (
            <tr className="border-b bg-emerald-50/60 text-[9px]" style={{ borderColor: '#e2e8f0' }}>
              <td className="px-2 py-[2px] font-semibold text-emerald-800">Paid Amount:</td>
              <td className="px-2 py-[2px] text-right font-mono font-bold text-emerald-700">
                PKR {fmtAmount(paidAmount)}
              </td>
            </tr>
          )}

          {paidAmount === 0 && (
            <tr className="border-b bg-rose-50/50 text-[9px]" style={{ borderColor: '#e2e8f0' }}>
              <td className="px-2 py-[2px] font-semibold text-rose-700">Payment Status:</td>
              <td className="px-2 py-[2px] text-right font-mono font-bold text-rose-700 uppercase">
                UNPAID (Pending)
              </td>
            </tr>
          )}

          {paidAmount > 0 && (
            <tr className="bg-slate-100 text-[9px]" style={{ borderColor: '#e2e8f0' }}>
              <td className="px-2 py-[2px] font-bold text-slate-800">Remaining Balance:</td>
              <td
                className={`px-2 py-[2px] text-right font-mono font-black ${
                  remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                PKR {fmtAmount(remainingBalance)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
