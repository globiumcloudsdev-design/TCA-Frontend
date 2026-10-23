'use client';

import React from 'react';
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
      className={`fee-voucher-print-target fee-voucher-sheet mx-auto bg-white border border-slate-300 shadow-sm print:border-none print:shadow-none ${className}`.trim()}
      style={{
        width: containerWidth,
        minHeight: containerHeight,
        color: '#0f172a',
        backgroundColor: '#ffffff',
        padding: isLandscape ? '4mm 3mm' : '4mm',
        boxSizing: 'border-box',
      }}
    >
      <div className={`flex h-full ${isLandscape ? 'flex-row gap-2' : 'flex-col gap-2'}`}>
        {copyLabels.map((label, index) => (
          <React.Fragment key={label}>
            {/* Cut Line Indicator between copies */}
            {index > 0 && (
              isLandscape ? (
                <div className="flex flex-col items-center justify-center text-[10px] text-slate-400 select-none px-0.5 print:text-slate-400">
                  <div className="h-full border-r border-dashed border-slate-400 flex flex-col justify-between py-2 items-center">
                    <span className="text-[11px] transform -rotate-90">✂</span>
                    <span className="text-[8px] font-mono transform -rotate-90 tracking-widest text-slate-400">CUT HERE</span>
                    <span className="text-[11px] transform -rotate-90">✂</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-[10px] text-slate-400 select-none py-0.5 print:text-slate-400">
                  <div className="w-full border-t border-dashed border-slate-400 flex justify-between px-4 items-center">
                    <span className="text-[11px] bg-white px-1">✂</span>
                    <span className="text-[8px] font-mono tracking-widest text-slate-400 bg-white px-2">CUT HERE</span>
                    <span className="text-[11px] bg-white px-1">✂</span>
                  </div>
                </div>
              )
            )}

            {/* Individual Voucher Copy Section */}
            <section
              className="flex flex-1 flex-col rounded border p-2 text-xs bg-white"
              style={{
                borderColor: '#cbd5e1',
                minWidth: 0,
              }}
            >
              <VoucherHeader
                instituteData={instituteData}
                voucherMeta={voucherMeta}
                theme={theme}
                copyLabel={label}
                isLandscape={isLandscape}
              />
              <StudentInfoSection
                studentData={studentData}
                voucherMeta={voucherMeta}
                theme={theme}
                isLandscape={isLandscape}
              />
              <FeeTable
                feeStructure={feeStructure}
                voucherMeta={voucherMeta}
                theme={theme}
                isLandscape={isLandscape}
              />
              <VoucherFooter
                instituteData={instituteData}
                voucherMeta={voucherMeta}
                theme={theme}
                isLandscape={isLandscape}
              />
            </section>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
