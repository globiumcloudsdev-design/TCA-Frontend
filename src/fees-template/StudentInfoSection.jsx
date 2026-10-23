'use client';

import React from 'react';
import { resolveBranchName } from '@/lib/branchUtils';

const InfoCell = ({ label, value, isLastInRow = false, labelWidth = '32%' }) => (
  <div
    className={`flex items-stretch border-b text-[9px] ${
      !isLastInRow ? 'border-r' : ''
    }`}
    style={{ borderColor: '#cbd5e1' }}
  >
    <div
      className="shrink-0 border-r px-1.5 py-[2px] font-semibold text-slate-600 bg-slate-50 flex items-center"
      style={{ width: labelWidth, borderColor: '#cbd5e1' }}
    >
      {label}
    </div>
    <div className="min-w-0 flex-1 px-1.5 py-[2px] font-medium text-slate-900 truncate flex items-center bg-white" title={String(value || '')}>
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
    studentData.studentName ||
    studentData.name ||
    studentData.full_name ||
    'Student';

  const fatherName =
    studentData.fatherName ||
    studentData.father_name ||
    studentData.parent_name ||
    studentData.guardian_name ||
    '—';

  const regNo =
    studentData.registrationNo ||
    studentData.registration_no ||
    studentData.rollNumber ||
    studentData.roll_no ||
    studentData.studentId ||
    studentData.id ||
    'N/A';

  const classNameVal =
    studentData.className ||
    studentData.class_name ||
    studentData.class ||
    '';

  const sectionNameVal =
    studentData.sectionName ||
    studentData.section_name ||
    studentData.section ||
    '';

  const classAndSection =
    [classNameVal, sectionNameVal].filter(Boolean).join(' - ') || 'N/A';

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
          value={branchName || voucherMeta.status || 'Active'}
          isLastInRow
        />
      </div>
    </section>
  );
}
