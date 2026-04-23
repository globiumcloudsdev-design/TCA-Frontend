'use client';

import { fmtDate } from '@/lib/formatters';

const Cell = ({ label, value, borderedRight = false, labelWidth = '66px' }) => (
  <td className={`p-0 text-[10px] ${borderedRight ? 'border-r' : ''}`} style={{ borderColor: '#bcbcbc' }}>
    <div className="grid h-full" style={{ gridTemplateColumns: `${labelWidth} 1fr` }}>
      <span className="border-r px-1 py-[2px] font-semibold" style={{ borderColor: '#bcbcbc', backgroundColor: '#f6f6f6' }}>
        {label}
      </span>
      <span className="px-1 py-[2px]">{value}</span>
    </div>
  </td>
);

export default function StudentInfoSection({ studentData = {}, voucherMeta = {} }) {
  return (
    <section className="border" style={{ borderColor: '#bcbcbc' }}>
      <table className="w-full border-collapse">
        <tbody>
          <tr className="border-b" style={{ borderColor: '#bcbcbc' }}>
            <Cell label="Student" value={studentData.studentName} borderedRight />
            <Cell label="Reg #" value={studentData.studentId || studentData.rollNumber} />
          </tr>
          <tr className="border-b" style={{ borderColor: '#bcbcbc' }}>
            <Cell label="Class" value={studentData.className || studentData.class_name } borderedRight />
            <Cell label="Section" value={studentData.sectionName || studentData.section_name} />
          </tr>
          <tr className="month-row border-b" style={{ borderColor: '#bcbcbc' }}>
            <Cell label="Generate Date" value={fmtDate(voucherMeta.issueDate)} borderedRight />
            <Cell label="Due Date" value={fmtDate(voucherMeta.dueDate)} />
          </tr>
          <tr>
            <Cell label="Month" value={voucherMeta.month} borderedRight />
            <Cell label="Year" value={voucherMeta.year} />
          </tr>
        </tbody>
      </table>
    </section>
  );
}
