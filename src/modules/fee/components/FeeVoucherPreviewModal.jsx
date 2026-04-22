'use client';

import { useMemo, useRef, useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import FeeVoucher from './FeeVoucher';
import { getFeeTheme } from '../styles/feeTheme';

const captureVoucherCanvas = async (sourceNode) => {
  const exportHost = document.createElement('div');
  exportHost.style.position = 'fixed';
  exportHost.style.left = '-100000px';
  exportHost.style.top = '0';
  exportHost.style.background = '#ffffff';
  exportHost.style.padding = '0';
  exportHost.style.zIndex = '-1';

  const exportNode = sourceNode.cloneNode(true);
  exportNode.style.transform = 'none';
  exportNode.style.width = '210mm';
  exportNode.style.minHeight = '297mm';
  exportNode.style.margin = '0';

  exportHost.appendChild(exportNode);
  document.body.appendChild(exportHost);

  try {
    return await html2canvas(exportNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
    });
  } finally {
    document.body.removeChild(exportHost);
  }
};

const saveCanvasAsA4Pdf = (canvas, fileName) => {
  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};

export default function FeeVoucherPreviewModal({
  open,
  onClose,
  studentData,
  feeStructure,
  instituteData,
  voucherMeta,
  copyMode = 'single',
  onCopyModeChange,
}) {
  const { resolvedTheme } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const voucherRef = useRef(null);
  const theme = useMemo(() => getFeeTheme(resolvedTheme), [resolvedTheme]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await captureVoucherCanvas(voucherRef.current);
      saveCanvasAsA4Pdf(canvas, `fee-voucher-${voucherMeta?.voucherNumber || 'download'}.pdf`);
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
              <label className="mr-1 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                <span>Double Copy</span>
                <Switch checked={copyMode === 'double'} onCheckedChange={(checked) => onCopyModeChange?.(checked ? 'double' : 'single')} />
              </label>

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
          <div className="mx-auto w-fit origin-top scale-[0.62] sm:scale-75 md:scale-90 lg:scale-100">
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
