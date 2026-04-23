'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
}) {
  const { resolvedTheme } = useTheme();
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
    setCopyMode(initialCopyMode);
  }, [initialCopyMode, open]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const voucherNo = voucherMeta?.voucherNumber || voucherMeta?.voucher_number || 'download';
      await downloadVoucherFromNode(voucherRef.current, `fee-voucher-${voucherNo}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="fee-voucher-modal-shell !max-w-[96vw] border p-0 sm:!max-w-[96vw]">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="text-base font-semibold">Fee Voucher Preview</DialogTitle>

            <div className="fee-voucher-modal-actions flex flex-wrap items-center gap-2">
              {allowCopyToggle ? (
                <label className="mr-1 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
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

              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-auto bg-slate-100 p-4">
          <div className="mx-auto mb-4 w-full max-w-[210mm] rounded-lg border bg-white p-0 shadow-sm">
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
              <p className="text-xs text-slate-500">No fee breakdown available for this voucher.</p>
            )}
          </div>

          <div className="mx-auto w-fit">
            <div ref={voucherRef} className="fee-voucher-print-target">
              <FeeVoucher
                studentData={studentData}
                feeStructure={feeStructure}
                instituteData={instituteData}
                voucherMeta={voucherMeta}
                copyMode={copyMode}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .fee-voucher-print-target,
          .fee-voucher-print-target * {
            visibility: visible !important;
          }

          .fee-voucher-print-target {
            position: absolute !important;
            inset: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .fee-voucher-print-target th:first-child,
          .fee-voucher-print-target .month-row {
            display: none !important;
          }

          .fee-voucher-modal-shell,
          .fee-voucher-modal-actions,
          [data-radix-dialog-overlay] {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </Dialog>
  );
}
