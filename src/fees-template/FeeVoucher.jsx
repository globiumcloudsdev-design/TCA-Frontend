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
  pageSize = null,
  orientation = null,
  className = '',
}) {
  const resolvedPageSize = String(
    pageSize ||
    voucherMeta?.pageSize ||
    voucherMeta?.page_size ||
    instituteData?.settings?.print_settings?.page_size ||
    ''
  ).toUpperCase();

  const resolvedOrientation = String(
    orientation ||
    voucherMeta?.orientation ||
    instituteData?.settings?.print_settings?.orientation ||
    instituteData?.print_settings?.orientation ||
    'portrait'
  ).toLowerCase();
  const isLandscape = resolvedOrientation === 'landscape' || resolvedOrientation === 'l';

  const resolvedFormat =
    format ||
    (resolvedPageSize === 'A6' || resolvedPageSize === 'A5' ? 'compact' : null) ||
    voucherMeta?.voucher_format ||
    voucherMeta?.voucherFormat ||
    voucherMeta?.format ||
    instituteData?.settings?.print_settings?.voucher_format ||
    instituteData?.settings?.voucher_format ||
    instituteData?.voucher_format ||
    'three_part';

  if (resolvedFormat === 'compact' || resolvedFormat === 'compact_receipt' || resolvedPageSize === 'A6' || resolvedPageSize === 'A5') {
    return (
      <CompactFeeVoucher
        studentData={studentData}
        feeStructure={feeStructure}
        instituteData={instituteData}
        voucherMeta={voucherMeta}
        pageSize={resolvedPageSize}
        orientation={resolvedOrientation}
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

  const containerWidth = isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM;
  const containerHeight = isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM;

  return (
    <div
      className={`fee-voucher-print-target fee-voucher-sheet mx-auto bg-white ${className}`.trim()}
      style={{
        width: containerWidth,
        minHeight: containerHeight,
        color: theme?.colors?.text || '#0f172a',
        backgroundColor: '#ffffff',
        padding: isLandscape ? '4mm 3mm' : '4mm',
      }}
    >
      <div className={`flex h-full ${isLandscape ? 'flex-row gap-2' : 'flex-col gap-1'}`}>
        {copyLabels.map((label, index) => (
          <section
            key={label}
            className="flex flex-1 flex-col border p-2 text-xs"
            style={{
              borderColor: '#8a8a8a',
              borderBottom: !isLandscape && index !== copyLabels.length - 1 ? `1px dashed ${theme?.colors?.border || '#cbd5e1'}` : undefined,
              borderRight: isLandscape && index !== copyLabels.length - 1 ? `1px dashed ${theme?.colors?.border || '#cbd5e1'}` : undefined,
              paddingBottom: !isLandscape && index === copyLabels.length - 1 ? '8px' : '10px',
              paddingRight: isLandscape && index !== copyLabels.length - 1 ? '8px' : '6px',
            }}
          >
            <VoucherHeader instituteData={instituteData} voucherMeta={voucherMeta} theme={theme} copyLabel={label} isLandscape={isLandscape} />
            <StudentInfoSection studentData={studentData} voucherMeta={voucherMeta} theme={theme} isLandscape={isLandscape} />
            <FeeTable feeStructure={feeStructure} theme={theme} isLandscape={isLandscape} />
            <VoucherFooter voucherMeta={voucherMeta} theme={theme} isLandscape={isLandscape} />
          </section>
        ))}
      </div>
    </div>
  );
}
