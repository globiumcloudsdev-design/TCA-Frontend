'use client';

import React from 'react';
import { resolveBranchName } from '@/lib/branchUtils';

const cleanString = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (/^n\/?a$/i.test(trimmed) || /^undefined$/i.test(trimmed) || /^null$/i.test(trimmed) || trimmed === '—') {
    return '';
  }
  return trimmed;
};

const InfoCell = ({ label, value, isLastInRow = false, labelWidth = '32%' }) => (
  <div
    className={`flex items-stretch border-b text-[9px] ${
      !isLastInRow ? 'border-r' : ''
    }`}
    style={{ borderColor: '#cbd5e1' }}
  >
    <div
      className="shrink-0 border-r px-1.5 py-[2.5px] font-semibold text-slate-600 bg-slate-50 flex items-center"
      style={{ width: labelWidth, borderColor: '#cbd5e1' }}
    >
      {label}
    </div>
    <div className="min-w-0 flex-1 px-1.5 py-[2.5px] font-medium text-slate-900 truncate flex items-center bg-white" title={String(value || '')}>
      {value || '—'}
    </div>
  </div>
);

export default function StudentInfoSection({
  studentData = {},
  voucherMeta = {},
  isLandscape = false,
  theme,
}) {
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
    '—';

  const regNo =
    cleanString(studentData.registrationNo) ||
    cleanString(studentData.registration_no) ||
    cleanString(studentData.rollNumber) ||
    cleanString(studentData.roll_no) ||
    cleanString(studentData.studentId) ||
    cleanString(studentData.id) ||
    cleanString(voucherMeta.registrationNo) ||
    'N/A';

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

  const branchName = resolveBranchName(
    studentData.branch ||
    studentData.branch_name ||
    studentData.branch_id ||
    voucherMeta.branch ||
    voucherMeta.branch_name ||
    voucherMeta.branch_id,
    null
  );

  const monthLabel =
    voucherMeta.month ||
    voucherMeta.monthLabel ||
    voucherMeta.fee_month ||
    '';

  const yearLabel =
    voucherMeta.year ||
    (voucherMeta.issueDate ? new Date(voucherMeta.issueDate).getFullYear() : '');

  const feePeriod = [monthLabel, yearLabel].filter(Boolean).join(' ') || 'Current';

  const rawStatus = String(voucherMeta.status || voucherMeta.feeStatus || '').toUpperCase();
  const statusLabel = rawStatus === 'PAID' ? 'PAID' : rawStatus === 'PARTIAL' ? 'PARTIAL' : 'UNPAID';

  return (
    <section
      className="mb-1.5 overflow-hidden rounded border"
      style={{ borderColor: '#cbd5e1' }}
    >
      <div className="grid grid-cols-2">
        <InfoCell label="Student" value={studentName} />
        <InfoCell label="Roll / Reg #" value={regNo} isLastInRow />

        <InfoCell label="Father Name" value={fatherName} />
        <InfoCell label="Class / Sec" value={classAndSection} isLastInRow />

        <InfoCell label="Fee Period" value={feePeriod} />
        <InfoCell
          label={branchName ? 'Branch' : 'Status'}
          value={branchName || statusLabel}
          isLastInRow
        />
      </div>
    </section>
  );
}
