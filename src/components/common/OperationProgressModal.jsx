'use client';

/**
 * OperationProgressModal
 *
 * A modern, polished progress modal with:
 * - Dynamic animated progress bar with smooth easing and gradient shimmer
 * - Step-by-step stage tracker (validating, calculating, writing, indexing)
 * - Live countdown timer ("Estimated ~X seconds remaining")
 * - Dedicated styles for 'upload' (students/files) and 'voucher' (fee creation)
 * - Celebratory completion view with summary stats
 * - Clear error presentation with retry/close
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileSpreadsheet,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperationProgressModal({
  open = false,
  onClose,
  type = 'upload', // 'upload' | 'voucher' | 'general'
  title = 'Processing...',
  subtitle = 'Please wait while your request is being processed.',
  stages = [],
  estimatedSeconds = 4,
  status = 'processing', // 'processing' | 'success' | 'error'
  statusMessage = '',
  errorMessage = '',
  result = null, // { total, count, imported, generated, failed, details }
  onDone,
  doneText = 'Done',
}) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(estimatedSeconds);
  const startTimeRef = useRef(Date.now());

  const defaultStages = type === 'voucher'
    ? [
        'Preparing fee templates and academic parameters',
        'Calculating student base fees & concession discounts',
        'Verifying previous arrears and unpaid balances',
        'Generating voucher records & unique voucher codes',
        'Finalizing and indexing database records',
      ]
    : [
        'Reading and parsing spreadsheet records',
        'Validating format, emails and required columns',
        'Enrolling students and allocating academic units',
        'Creating student profiles & user credentials',
        'Finalizing database records and search indexes',
      ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;

  // Reset and drive smooth progression when opened
  useEffect(() => {
    if (!open) {
      setInternalProgress(0);
      setCurrentStageIndex(0);
      setSecondsRemaining(estimatedSeconds);
      return;
    }

    if (status === 'success') {
      setInternalProgress(100);
      setCurrentStageIndex(activeStages.length - 1);
      setSecondsRemaining(0);
      return;
    }

    if (status === 'error') {
      return;
    }

    startTimeRef.current = Date.now();
    setSecondsRemaining(estimatedSeconds);

    const totalDurationMs = Math.max(estimatedSeconds * 1000, 2500);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressRatio = Math.min(elapsed / totalDurationMs, 0.94);

      // Realistic non-linear progress easing
      const eased = Math.round(Math.sin((progressRatio * Math.PI) / 2) * 94);
      setInternalProgress((prev) => (prev < eased ? eased : prev));

      // Calculate stage index proportional to progress
      const stageIdx = Math.min(
        Math.floor(progressRatio * (activeStages.length - 1)),
        activeStages.length - 2
      );
      setCurrentStageIndex(stageIdx);

      // Countdown remaining seconds
      const leftSec = Math.max(1, Math.ceil((totalDurationMs - elapsed) / 1000));
      setSecondsRemaining(leftSec);
    }, 120);

    return () => clearInterval(interval);
  }, [open, status, estimatedSeconds, activeStages.length]);

  // When operation completes successfully, instantly smoothly bump to 100%
  useEffect(() => {
    if (status === 'success') {
      setInternalProgress(100);
      setCurrentStageIndex(activeStages.length - 1);
      setSecondsRemaining(0);
    }
  }, [status, activeStages.length]);

  const isVoucher = type === 'voucher';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && status !== 'processing') onClose?.(); }}>
      <DialogContent
        className="w-[95vw] sm:max-w-lg p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl bg-white dark:bg-slate-900"
        onPointerDownOutside={(e) => { if (status === 'processing') e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (status === 'processing') e.preventDefault(); }}
      >
        {/* Top Decorative Banner */}
        <div
          className={cn(
            'px-6 pt-6 pb-5 relative overflow-hidden transition-colors duration-500',
            status === 'success'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50'
              : status === 'error'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50'
              : isVoucher
              ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-slate-100 dark:border-slate-800'
              : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-b border-slate-100 dark:border-slate-800'
          )}
        >
          <div className="flex items-start gap-4 relative z-10">
            {/* Animated Icon Avatar */}
            <div
              className={cn(
                'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-300',
                status === 'success'
                  ? 'bg-emerald-600 text-white scale-105'
                  : status === 'error'
                  ? 'bg-rose-600 text-white'
                  : isVoucher
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-indigo-600 text-white animate-pulse'
              )}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : status === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : isVoucher ? (
                <DollarSign className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {status === 'success'
                    ? (isVoucher ? 'Vouchers Created Successfully!' : 'Upload Completed Successfully!')
                    : status === 'error'
                    ? 'Operation Failed'
                    : title}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {status === 'success'
                  ? statusMessage || (isVoucher ? 'All vouchers have been generated and recorded.' : 'All student records have been processed.')
                  : status === 'error'
                  ? errorMessage || 'An error occurred during processing. Please try again.'
                  : subtitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Progress Bar & Numerical Readout */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {status === 'processing' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                )}
                {status === 'success' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Completed
                  </span>
                ) : status === 'error' ? (
                  <span className="text-rose-600 dark:text-rose-400">Halted</span>
                ) : (
                  <span>Processing...</span>
                )}
              </span>

              {status === 'processing' && (
                <Badge
                  variant="outline"
                  className="gap-1.5 font-semibold text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                >
                  <Clock className="w-3 h-3 text-indigo-500" />
                  ~{secondsRemaining}s left
                </Badge>
              )}

              {status !== 'processing' && (
                <span className="text-slate-500 text-xs font-bold">{internalProgress}%</span>
              )}
            </div>

            {/* Styled Progress Bar */}
            <div className="relative w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 h-3">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden',
                  status === 'success'
                    ? 'bg-emerald-500'
                    : status === 'error'
                    ? 'bg-rose-500'
                    : isVoucher
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500'
                )}
                style={{ width: `${internalProgress}%` }}
              >
                {status === 'processing' && (
                  <div className="absolute inset-0 bg-white/25 w-full animate-[shimmer_1.5s_infinite] -skew-x-12" />
                )}
              </div>
            </div>
          </div>

          {/* Stage Progression List */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Process Stages
            </p>
            <div className="space-y-2.5">
              {activeStages.map((stage, idx) => {
                const isCompleted = status === 'success' || idx < currentStageIndex;
                const isCurrent = status === 'processing' && idx === currentStageIndex;
                const isPending = idx > currentStageIndex && status !== 'success';

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 text-xs transition-colors duration-200',
                      isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : isCurrent
                        ? 'text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] transition-all',
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 ring-2 ring-indigo-400/30 ring-offset-1'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="truncate">{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Summary Details (When Completed) */}
          {status === 'success' && result && (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              {result.total !== undefined && (
                <div className="space-y-0.5">
                  <p className="text-slate-400 font-medium">Total Processed</p>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{result.total}</p>
                </div>
              )}
              {(result.generated !== undefined || result.imported !== undefined) && (
                <div className="space-y-0.5">
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">Successful</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {result.generated ?? result.imported}
                  </p>
                </div>
              )}
              {result.failed !== undefined && result.failed > 0 && (
                <div className="space-y-0.5 col-span-2 pt-1 border-t border-emerald-500/10 flex items-center justify-between">
                  <span className="text-amber-600 font-medium">Skipped / Failed:</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    {result.failed} records
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-end gap-2">
          {status === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl px-5"
            >
              Close
            </Button>
          )}

          {status === 'success' && (
            <Button
              onClick={() => {
                onDone?.();
                onClose?.();
              }}
              size="sm"
              className={cn(
                'rounded-xl px-6 font-bold shadow-lg gap-2 text-white',
                isVoucher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              )}
            >
              {doneText} <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {status === 'processing' && (
            <p className="text-xs text-slate-400 italic text-center w-full">
              Please keep this page open while processing completes...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
