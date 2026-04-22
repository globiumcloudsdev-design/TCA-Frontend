'use client';

import { fmtAmount } from '@/lib/formatters';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeLabel = (label = '') => label.toLowerCase().trim();

const isDiscount = (label) => normalizeLabel(label).includes('discount');
const isPaid = (label) => normalizeLabel(label).includes('paid amount');
const isRemaining = (label) => normalizeLabel(label).includes('remaining amount');
const isTotal = (label) => normalizeLabel(label).includes('total amount');
const isPercent = (label) => /percent|percentage/.test(normalizeLabel(label));

const hasNonZeroValue = (label, value) => {
  if (value === null || value === undefined || value === '') return false;
  if (isPercent(label) && typeof value === 'string' && value.includes('%')) {
    const parsed = Number(String(value).replace('%', '').trim());
    return Number.isFinite(parsed) && parsed !== 0;
  }
  return toNumber(value) !== 0;
};

const formatValue = (label, amount) => {
  if (amount === '-') return '-';
  if (isPercent(label)) return `${fmtAmount(amount)}%`;
  return `PKR ${fmtAmount(amount)}`;
};

export default function FeeTable({ feeStructure = [], theme }) {
  const normalizedRows = (feeStructure || []).map((row) => ({
    feeType: row.feeType || row.label || 'Unknown Fee',
    amount: row.amount,
  }));

  const baseRows = normalizedRows.filter(
    (row) => !isPaid(row.feeType) && !isRemaining(row.feeType) && !isTotal(row.feeType) && hasNonZeroValue(row.feeType, row.amount)
  );

  const chargeTotal = baseRows
    .filter((row) => !isDiscount(row.feeType) && !isPercent(row.feeType))
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const discount = baseRows
    .filter((row) => isDiscount(row.feeType))
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const paidAmount = normalizedRows
    .filter((row) => isPaid(row.feeType) && hasNonZeroValue(row.feeType, row.amount))
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const totalAmount = chargeTotal - discount;
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  const summaryRows = [];
  if (totalAmount !== 0) summaryRows.push({ feeType: 'Total Amount', amount: totalAmount });
  if (paidAmount !== 0) summaryRows.push({ feeType: 'Paid Amount', amount: paidAmount });
  if (remainingAmount !== 0) summaryRows.push({ feeType: 'Remaining Amount', amount: remainingAmount });

  const displayRows = [...baseRows, ...summaryRows];

  const rowsToRender = displayRows.length
    ? displayRows
    : [{ feeType: 'No fee lines', amount: '-' }];

  return (
    <section className="mt-1 border" style={{ borderColor: '#bcbcbc' }}>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="border px-2 py-[2px] text-left font-semibold text-white" style={{ borderColor: '#bcbcbc', backgroundColor: '#0f7138' }}>
              Fee Type
            </th>
            <th className="border px-2 py-[2px] text-center font-semibold text-white" style={{ borderColor: '#bcbcbc', backgroundColor: '#0f7138' }}>
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {rowsToRender.map((row, index) => {
            const lower = normalizeLabel(row.feeType);
            const isSummary = lower.includes('total amount') || lower.includes('remaining amount') || lower.includes('paid amount');

            return (
              <tr key={`${row.feeType}-${index}`}>
                <td
                  className="border px-2 py-[2px]"
                  style={{
                    borderColor: '#bcbcbc',
                    fontWeight: isSummary ? 600 : 400,
                    backgroundColor: '#ffffff',
                  }}
                >
                  {row.feeType}
                </td>
                <td
                  className="border px-2 py-[2px] text-right"
                  style={{
                    borderColor: '#bcbcbc',
                    fontWeight: isSummary ? 600 : 400,
                    backgroundColor: '#ffffff',
                  }}
                >
                  {formatValue(row.feeType, row.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
