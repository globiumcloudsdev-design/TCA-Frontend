'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Printer, X, FileText, Receipt, Compass } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AppModal from '@/components/common/AppModal';
import FeeVoucher from '@/fees-template/FeeVoucher';
import { getFeeTheme } from '@/fees-template/styles/feeTheme';
import { downloadVoucherFromNode } from '@/fees-template/utils/voucherPdfExport';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatBreakdownAmount = (feeType, amount) => {
  const normalizedType = String(feeType || '').toLowerCase();
  if (normalizedType.includes('percent') || normalizedType.includes('percentage')) {
    return `${toNumber(amount).toLocaleString()}%`;
  }
  return `PKR ${toNumber(amount).toLocaleString()}`;
};

export default function FeeVoucherPreviewModal({
  open,
  onClose,
  studentData,
  feeStructure,
  instituteData,
  voucherMeta,
  initialCopyMode = 'triple',
  allowCopyToggle = true,
  copyToggleLabel = 'Triple Copy',
  initialFormat,
}) {
  const { resolvedTheme } = useTheme();

  // Resolve initial format from institute settings or voucherMeta or prop
  const detectedFormat = useMemo(() => {
    if (initialFormat) return initialFormat;
    const raw =
      voucherMeta?.voucher_format ||
      voucherMeta?.voucherFormat ||
      voucherMeta?.format ||
      instituteData?.settings?.print_settings?.voucher_format ||
      instituteData?.settings?.voucher_format ||
      instituteData?.voucher_format;
    return raw === 'compact' || raw === 'compact_receipt' ? 'compact' : 'three_part';
  }, [initialFormat, voucherMeta, instituteData]);

  // Resolve initial page size
  const detectedPageSize = useMemo(() => {
    const raw =
      voucherMeta?.pageSize ||
      voucherMeta?.page_size ||
      instituteData?.settings?.print_settings?.page_size ||
      instituteData?.print_settings?.page_size ||
      'A4';
    return String(raw).toUpperCase();
  }, [voucherMeta, instituteData]);

  // Resolve initial orientation
  const detectedOrientation = useMemo(() => {
    const raw =
      voucherMeta?.orientation ||
      instituteData?.settings?.print_settings?.orientation ||
      instituteData?.print_settings?.orientation ||
      'portrait';
    return String(raw).toLowerCase() === 'landscape' ? 'landscape' : 'portrait';
  }, [voucherMeta, instituteData]);

  const [activeFormat, setActiveFormat] = useState(detectedFormat);
  const [activePageSize, setActivePageSize] = useState(detectedPageSize);
  const [activeOrientation, setActiveOrientation] = useState(detectedOrientation);
  const [copyMode, setCopyMode] = useState(initialCopyMode);
  const [isDownloading, setIsDownloading] = useState(false);
  const voucherRef = useRef(null);
  const theme = useMemo(() => getFeeTheme(resolvedTheme), [resolvedTheme]);

  const breakdownRows = useMemo(
    () =>
      (feeStructure || []).map((row) => ({
        feeType: row?.feeType || row?.label || 'Fee Item',
        amount: row?.amount,
      })),
    [feeStructure]
  );

  useEffect(() => {
    setActiveFormat(detectedFormat);
  }, [detectedFormat, open]);

  useEffect(() => {
    setActivePageSize(detectedPageSize);
  }, [detectedPageSize, open]);

  useEffect(() => {
    setActiveOrientation(detectedOrientation);
  }, [detectedOrientation, open]);

  useEffect(() => {
    setCopyMode(initialCopyMode);
  }, [initialCopyMode, open]);

  const handlePrint = () => {
    window.print();
  };

  const isCompact = activeFormat === 'compact';
  const isLandscape = activeOrientation === 'landscape';

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const voucherNo = voucherMeta?.voucherNumber || voucherMeta?.voucher_number || 'download';
      const fileName = isCompact ? `compact-receipt-${voucherNo}.pdf` : `fee-voucher-${voucherNo}.pdf`;
      await downloadVoucherFromNode(voucherRef.current, fileName, isCompact, activePageSize, activeOrientation);
    } finally {
      setIsDownloading(false);
    }
  };

  const modalFooter = (
    <div className="fee-voucher-modal-actions flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Layout Format Selector Toggle */}
        <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveFormat('three_part')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              activeFormat === 'three_part'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Three-Part Slip
          </button>
          <button
            type="button"
            onClick={() => setActiveFormat('compact')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              activeFormat === 'compact'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            Compact Receipt
          </button>
        </div>

        {/* Paper Size Selector (A4, A5, A6) */}
        <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1">
          {['A4', 'A5', 'A6'].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setActivePageSize(size)}
              className={`rounded-md px-2 py-0.5 text-xs font-semibold transition-all ${
                activePageSize === size
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Orientation Toggle (Portrait vs Landscape) */}
        <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveOrientation('portrait')}
            className={`rounded-md px-2 py-0.5 text-xs font-semibold transition-all ${
              activeOrientation === 'portrait'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Portrait
          </button>
          <button
            type="button"
            onClick={() => setActiveOrientation('landscape')}
            className={`rounded-md px-2 py-0.5 text-xs font-semibold transition-all ${
              activeOrientation === 'landscape'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Landscape
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {allowCopyToggle && !isCompact && !isLandscape ? (
          <label className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
            <span>{copyToggleLabel}</span>
            <Switch
              checked={copyMode === 'triple'}
              onCheckedChange={(checked) => setCopyMode(checked ? 'triple' : 'single')}
            />
          </label>
        ) : null}

        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>

        <Button variant="outline" size="sm" onClick={() => onClose?.()}>
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={() => onClose?.()}
      title={`Fee Voucher Preview — ${isCompact ? 'Compact Receipt' : 'Three-Part Slip'} (${activePageSize} ${activeOrientation.charAt(0).toUpperCase() + activeOrientation.slice(1)})`}
      size="xl"
      className="fee-voucher-modal-shell !max-w-[96vw] sm:!max-w-[96vw]"
      footer={modalFooter}
    >
      <div className="bg-slate-100 p-4 -mx-5 -my-4 h-full min-h-[50vh]">
        {!isCompact && (
          <div className="print:hidden mx-auto mb-4 w-full max-w-[210mm] rounded-lg border bg-white p-0 shadow-sm">
            <div className="border-b bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
              Fee Breakdown
            </div>
            {breakdownRows.length ? (
              <div className="divide-y">
                {breakdownRows.map((row, index) => (
                  <div key={`${row.feeType}-${index}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-xs">
                    <span className="font-medium text-slate-700">{row.feeType}</span>
                    <span className="font-semibold text-slate-900">{formatBreakdownAmount(row.feeType, row.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-xs text-slate-500">No fee breakdown available for this voucher.</p>
            )}
          </div>
        )}

        <div className="mx-auto w-fit pb-8 print:pb-0 overflow-x-auto max-w-full">
          <div ref={voucherRef} className="fee-voucher-print-target">
            <FeeVoucher
              studentData={studentData}
              feeStructure={feeStructure}
              instituteData={instituteData}
              voucherMeta={voucherMeta}
              copyMode={copyMode}
              format={activeFormat}
              pageSize={activePageSize}
              orientation={activeOrientation}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .fee-voucher-print-target,
          .fee-voucher-print-target * {
            visibility: visible !important;
          }

          [role="dialog"],
          .fee-voucher-modal-shell,
          .fee-voucher-modal-shell > div {
            transform: none !important;
            position: static !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            width: auto !important;
            max-width: none !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .fee-voucher-print-target {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${
              isCompact
                ? (isLandscape ? '148mm' : '105mm')
                : (isLandscape ? '297mm' : '210mm')
            } !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
            z-index: 9999 !important;
          }

          ${!isCompact && !isLandscape ? `
            .fee-voucher-print-target th:first-child,
            .fee-voucher-print-target .month-row {
              display: none !important;
            }
          ` : ''}

          .fee-voucher-modal-actions,
          [data-radix-dialog-overlay] {
            display: none !important;
          }

          @page {
            size: ${
              activePageSize === 'A6'
                ? (isLandscape ? '148mm 105mm' : '105mm 148mm')
                : activePageSize === 'A5'
                  ? (isLandscape ? '210mm 148mm' : '148mm 210mm')
                  : isCompact
                    ? (isLandscape ? '148mm 105mm' : '80mm auto')
                    : (isLandscape ? 'A4 landscape' : 'A4 portrait')
            };
            margin: 0;
          }
        }
      `}</style>
    </AppModal>
  );
}
