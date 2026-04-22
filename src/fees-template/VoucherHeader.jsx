'use client';

import { fmtDate } from '@/lib/formatters';

export default function VoucherHeader({ instituteData = {}, voucherMeta = {}, copyLabel = 'PARENT COPY' }) {
  const schoolName = instituteData.name || 'ABC School';
  const generatedDate = fmtDate(voucherMeta.issueDate);

  return (
    <header className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start text-[10px] text-black">
        <div className="flex items-center gap-2 font-bold uppercase">
          {instituteData.logo ? (
            <img
              src={instituteData.logo}
              alt="Institute Logo"
              className="h-5 w-5 object-contain"
              crossOrigin="anonymous"
            />
          ) : null}
          <span>{copyLabel}</span>
        </div>

        <div className="text-center leading-tight">
          <h1 className="text-[18px] font-bold">{schoolName}</h1>
          <p className="text-[14px] font-bold">Fee Voucher</p>
        </div>

        <div className="text-right text-[10px]">
          <span className="font-semibold">Generate Date:</span> {generatedDate}
        </div>
      </div>

      <div className="text-[10px]">
        <span className="font-semibold">Voucher #:</span> {voucherMeta.voucherNumber || 'N/A'}
      </div>
    </header>
  );
}
