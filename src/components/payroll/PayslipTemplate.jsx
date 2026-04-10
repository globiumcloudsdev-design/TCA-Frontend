'use client';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import Image from 'next/image';
import { MONTHS } from '@/constants';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const MONTH_MAP = Object.fromEntries((MONTHS ?? []).map((m) => [String(m.value), m.label]));

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const monthLabel = (month) => MONTH_MAP[String(month)] ?? String(month ?? '____________________');

const employeeName = (record) => record?.employee_name ?? record?.teacher_name ?? record?.staff_name ?? record?.name ?? '____________________';
const employeeId = (record) => record?.employee_id ?? record?.teacher_id ?? '____________________';
const designation = (record) => record?.designation ?? record?.role ?? record?.title ?? '____________________';
const orgNameFrom = (org) => org?.name ?? org?.institute_name ?? org?.title ?? 'Your Institute Name';

const safeText = (value, fallback = '____________________') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

export default function PayslipTemplate({ record, className }) {
  const authStore = useAuthStore();
  const instituteStore = useInstituteStore();

  if (!record) return null;

  const institute = authStore.getInstitute();
  const logoUrl = instituteStore.instituteLogo() || authStore.instituteLogo() || null;
  const orgName = orgNameFrom(institute);
  const orgAddress = institute?.address || '';
  const orgPhone = institute?.phone || '';
  const orgEmail = institute?.email || 'hr@yourinstitute.edu';

  const basicSalary = toNumber(record.basic_salary ?? record.basic);
  const allowances = toNumber(record.allowances);
  const bonus = toNumber(record.bonus);
  const overtime = toNumber(record.overtime);
  const grossSalary = basicSalary + allowances + bonus + overtime;

  const lateDeduction = toNumber(record.late_deduction);
  const leaveDeduction = toNumber(record.leave_deduction);
  const loanDeduction = toNumber(record.loan_deduction);
  const otherDeductions = toNumber(record.other_deductions ?? record.deductions ?? record.total_deductions);

  const totalEarnings = grossSalary;
  const totalDeductions = lateDeduction + leaveDeduction + loanDeduction + otherDeductions;
  const netPay = toNumber(record.net_salary ?? record.net ?? record.net_pay ?? totalEarnings - totalDeductions);

  const payPeriod = `${monthLabel(record.month)} ${record.year ?? ''}`.trim();
  const paymentDate = record.paid_on ?? record.paid_date ?? record.paidDate;
  const periodStart = record.period_start ?? record.start_date;
  const periodEnd = record.period_end ?? record.end_date;
  const periodText =
    periodStart && periodEnd
      ? `${formatDate(periodStart)} - ${formatDate(periodEnd)}`
      : payPeriod || '____________________';

  return (
    <section className={cn('payslip-print mx-auto w-full max-w-[860px] rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg', className)}>
      <header className="border-b border-slate-200 px-6 py-5 sm:px-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
            {logoUrl ? (
              <Image src={logoUrl} alt="Organization logo" width={48} height={48} className="object-contain" priority />
            ) : (
              <span className="text-[10px] font-semibold text-slate-500">LOGO</span>
            )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{safeText(institute?.code, 'Institute')}</p>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">PAYSLIP</h2>
              <p className="mt-1 text-sm text-slate-600">
                {orgEmail} {orgPhone ? `| ${orgPhone}` : ''}
                {orgAddress ? ` | ${orgAddress}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Document No.</p>
            <p className="font-semibold text-slate-800">PS-{safeText(record.id, 'N/A')}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Payment Date</p>
            <p className="font-medium text-slate-800">{paymentDate ? formatDate(paymentDate) : 'Pending'}</p>
          </div>
        </div>
      </header>

      <div className="px-6 py-7 text-sm sm:px-10">
        <div className="text-center">
          <h3 className="text-5xl font-bold tracking-tight text-slate-900">Payslip</h3>
          <p className="mt-3 text-lg text-slate-700">
            <span className="font-semibold">Pay Period:</span> {periodText}
          </p>
        </div>

        <div className="mt-10 grid gap-2 text-xl leading-relaxed text-slate-900 sm:grid-cols-2 sm:text-2xl">
          <InfoLine label="Employee Name" value={employeeName(record)} />
          <InfoLine label="Employee SSN" value={safeText(record?.employee_ssn ?? record?.cnic)} />
          <InfoLine label="Employee ID" value={employeeId(record)} />
          <InfoLine label="Position" value={designation(record)} />
          <InfoLine label="Department" value={safeText(record?.department)} />
          <InfoLine label="Organization" value={safeText(orgName)} />
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-slate-300">
          <table className="w-full border-collapse text-xl sm:text-2xl">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Earnings</th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">Amount</th>
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Deductions</th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <DualMoneyRow leftLabel="Base Salary" leftValue={basicSalary} rightLabel="Taxes" rightValue={loanDeduction} />
              <DualMoneyRow leftLabel="Overtime Pay" leftValue={overtime} rightLabel="Late Penalties" rightValue={lateDeduction} />
              <DualMoneyRow leftLabel="Bonuses" leftValue={bonus} rightLabel="Absences" rightValue={leaveDeduction} />
              <DualMoneyRow leftLabel="Allowances" leftValue={allowances} rightLabel="Other Deductions" rightValue={otherDeductions} />
              <DualMoneyRow leftLabel="Gross Salary" leftValue={grossSalary} rightLabel="Total Deductions" rightValue={totalDeductions} bold />
              <DualMoneyRow leftLabel="Total" leftValue={totalEarnings} rightLabel="Total" rightValue={totalDeductions} bold />
            </tbody>
          </table>
        </div>

        <div className="mt-7 overflow-hidden rounded-md border border-slate-300">
          <table className="w-full border-collapse text-xl sm:text-2xl">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Net Pay</th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-3 font-semibold text-slate-900">Net Pay</td>
                <td className="border border-slate-300 px-3 py-3 text-right font-bold text-slate-900">{formatCurrency(netPay)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-700 sm:text-lg">
          <p>
            This is a system generated payslip for payroll record keeping. If you need further assistance, please feel free to contact HR at {orgEmail}.
          </p>
          <p className="mt-2">
            Please verify all figures carefully. Report any discrepancy within 3 working days from issue date.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <SignatureLine label="Authorized Signature" />
          <SignatureLine label="Employee Signature" />
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Generated by {orgName} payroll system on {formatDate(new Date())}
        </p>
      </div>
    </section>
  );
}

function InfoLine({ label, value }) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

function DualMoneyRow({ leftLabel, leftValue, rightLabel, rightValue, bold = false }) {
  const labelClass = bold ? 'font-semibold text-slate-900' : 'text-slate-800';
  const valueClass = bold ? 'font-semibold text-slate-900' : 'font-medium text-slate-800';

  return (
    <tr>
      <td className={cn('border border-slate-300 px-3 py-2.5', labelClass)}>{leftLabel}</td>
      <td className={cn('border border-slate-300 px-3 py-2.5 text-right', valueClass)}>{formatCurrency(leftValue)}</td>
      <td className={cn('border border-slate-300 px-3 py-2.5', labelClass)}>{rightLabel}</td>
      <td className={cn('border border-slate-300 px-3 py-2.5 text-right', valueClass)}>{formatCurrency(rightValue)}</td>
    </tr>
  );
}

function SignatureLine({ label }) {
  return (
    <div className="rounded-md border border-slate-300 px-3 py-4">
      <div className="mb-7 h-px w-full bg-slate-300" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
}
