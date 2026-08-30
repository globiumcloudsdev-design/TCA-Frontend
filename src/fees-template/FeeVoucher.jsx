'use client';

import VoucherHeader from './VoucherHeader';
import StudentInfoSection from './StudentInfoSection';
import FeeTable from './FeeTable';
import VoucherFooter from './VoucherFooter';
import CompactFeeVoucher from './CompactFeeVoucher';

const A4_WIDTH_MM = '210mm';
const A4_HEIGHT_MM = '297mm';

export default function FeeVoucher({
  studentData = {},
  feeStructure = [],
  instituteData = {},
  voucherMeta = {},
  theme,
  copyMode = 'single',
  format,
  className = '',
}) {
  const resolvedFormat =
    format ||
    voucherMeta?.voucher_format ||
    voucherMeta?.voucherFormat ||
    voucherMeta?.format ||
    instituteData?.settings?.print_settings?.voucher_format ||
    instituteData?.settings?.voucher_format ||
    instituteData?.voucher_format ||
    'three_part';

  if (resolvedFormat === 'compact' || resolvedFormat === 'compact_receipt') {
    return (
      <CompactFeeVoucher
        studentData={studentData}
        feeStructure={feeStructure}
        instituteData={instituteData}
        voucherMeta={voucherMeta}
        className={className}
      />
    );
  }

  const copyLabels =
    copyMode === 'triple'
      ? ['BANK COPY', 'SCHOOL COPY', 'PARENT COPY']
      : copyMode === 'double'
        ? [voucherMeta.firstCopyLabel || 'SCHOOL COPY', voucherMeta.secondCopyLabel || 'PARENT COPY']
        : [voucherMeta.copyLabel || 'PARENT COPY'];

  return (
    <div
      className={`fee-voucher-print-target fee-voucher-sheet mx-auto bg-white ${className}`.trim()}
      style={{
        width: A4_WIDTH_MM,
        minHeight: A4_HEIGHT_MM,
        color: theme?.colors?.text || '#0f172a',
        backgroundColor: '#ffffff',
        padding: '4mm',
      }}
    >
      <div className="flex h-full flex-col gap-1">
        {copyLabels.map((label, index) => (
          <section
            key={label}
            className="flex flex-1 flex-col border p-2"
            style={{
              borderColor: '#8a8a8a',
              borderBottom: index === copyLabels.length - 1 ? 'none' : `1px dashed ${theme?.colors?.border || '#cbd5e1'}`,
              paddingBottom: index === copyLabels.length - 1 ? '8px' : '10px',
            }}
          >
            <VoucherHeader instituteData={instituteData} voucherMeta={voucherMeta} theme={theme} copyLabel={label} />
            <StudentInfoSection studentData={studentData} voucherMeta={voucherMeta} theme={theme} />
            <FeeTable feeStructure={feeStructure} theme={theme} />
            <VoucherFooter voucherMeta={voucherMeta} theme={theme} />
          </section>
        ))}
      </div>
    </div>
  );
}
