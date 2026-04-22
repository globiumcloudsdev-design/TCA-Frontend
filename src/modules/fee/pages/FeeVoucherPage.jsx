'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import FeeVoucher from '../components/FeeVoucher';
import FeeVoucherPreviewModal from '../components/FeeVoucherPreviewModal';
import useFeeVoucherData from '../store/useFeeVoucherData';
import { getFeeTheme } from '../styles/feeTheme';

export default function FeeVoucherPage({ voucherId = '', studentId = '' }) {
  const [queryVoucherId, setQueryVoucherId] = useState(voucherId || '');
  const [activeVoucherId, setActiveVoucherId] = useState(voucherId || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copyMode, setCopyMode] = useState('double');

  const { resolvedTheme } = useTheme();
  const theme = useMemo(() => getFeeTheme(resolvedTheme), [resolvedTheme]);

  const {
    instituteData,
    studentData,
    voucherMeta,
    feeStructure,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFeeVoucherData({ voucherId: activeVoucherId, studentId });

  useEffect(() => {
    if (voucherId) {
      setQueryVoucherId(voucherId);
      setActiveVoucherId(voucherId);
    }
  }, [voucherId]);

  const handleLoadVoucher = () => {
    const trimmed = queryVoucherId.trim();
    if (!trimmed) return;
    setActiveVoucherId(trimmed);
  };

  const hasVoucher = Boolean(activeVoucherId && voucherMeta?.voucherNumber && voucherMeta.voucherNumber !== 'N/A');

  return (
    <section className="space-y-5">
      <div className="rounded-xl border bg-background p-4">
        <h2 className="text-lg font-semibold">School Fee Voucher Module</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter Voucher ID to load live data from API. Institute details are resolved from Auth Store or Institute Store.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={queryVoucherId}
            onChange={(event) => setQueryVoucherId(event.target.value)}
            placeholder="Enter voucher ID"
            className="input-base h-10 max-w-md"
          />

          <Button onClick={handleLoadVoucher} disabled={!queryVoucherId.trim() || isFetching}>
            <Search className="h-4 w-4" />
            Load Voucher
          </Button>

          <Button variant="outline" onClick={refetch} disabled={!activeVoucherId || isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" onClick={() => setIsPreviewOpen(true)} disabled={!hasVoucher || isLoading}>
            <Eye className="h-4 w-4" />
            Open Preview
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            Failed to load voucher: {error?.message || 'Unknown API error'}
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-slate-100 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Inline A4 Preview</h3>
          <span className="text-xs text-muted-foreground">{copyMode === 'double' ? 'Double Copy Mode' : 'Single Copy Mode'}</span>
        </div>

        {isLoading && activeVoucherId ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">Loading voucher from API...</div>
        ) : hasVoucher ? (
          <div className="overflow-auto rounded-lg border bg-slate-200 p-3">
            <div className="mx-auto w-fit origin-top scale-[0.58] sm:scale-75 md:scale-90 lg:scale-100">
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
        ) : (
          <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
            No voucher loaded. Provide a valid voucher ID to fetch API data and render the A4 voucher.
          </div>
        )}
      </div>

      <FeeVoucherPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        studentData={studentData}
        feeStructure={feeStructure}
        instituteData={instituteData}
        voucherMeta={voucherMeta}
        copyMode={copyMode}
        onCopyModeChange={setCopyMode}
      />
    </section>
  );
}
