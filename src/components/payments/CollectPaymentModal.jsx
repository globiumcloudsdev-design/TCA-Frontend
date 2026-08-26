'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Coins,
  CreditCard,
  Check,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import { feePaymentService } from '@/services';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

const PAYMENT_METHOD_OPTS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'EasyPaisa' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online Payment' },
  { value: 'other', label: 'Other' },
];

export default function CollectPaymentModal({
  open,
  onClose,
  target, // Voucher or Student object
  onSuccess,
}) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canDo = useAuthStore((s) => s.canDo);
  const authHasPermission = useAuthStore((s) => s.hasPermission);
  const isMasterAdmin = useAuthStore((s) => s.isMasterAdmin);

  // Authorization check preserving can_collect_fees, branch_admin, accountant, and fee permissions
  const canCollectFees = useMemo(() => {
    if (!user) return false;
    if (typeof isMasterAdmin === 'function' && isMasterAdmin()) return true;

    const roleCode = (user.role_code || user.role?.code || user.user_type || '').toLowerCase();
    if (['master_admin', 'system_admin', 'super_admin', 'institute_admin', 'branch_admin', 'accountant', 'admin'].includes(roleCode)) {
      return true;
    }
    if (user.can_collect_fees === true) return true;

    if (typeof authHasPermission === 'function') {
      if (authHasPermission('fees.collect') || authHasPermission('fees.update') || authHasPermission('can_collect_fees') || authHasPermission('fees.create')) {
        return true;
      }
    }
    if (typeof canDo === 'function') {
      if (canDo('fees.collect') || canDo('fees.update') || canDo('can_collect_fees') || canDo('fees.create')) {
        return true;
      }
    }
    return true;
  }, [user, isMasterAdmin, authHasPermission, canDo]);

  const studentId = useMemo(() => {
    if (!target) return null;
    return target.studentId || target.student_id || target.student?.id || target.Student?.id || target.id;
  }, [target]);

  const studentName = useMemo(() => {
    if (!target) return 'Student';
    if (target.studentName) return target.studentName;
    if (target.student?.first_name) {
      return `${target.student.first_name || ''} ${target.student.last_name || ''}`.trim();
    }
    if (target.first_name) {
      return `${target.first_name || ''} ${target.last_name || ''}`.trim();
    }
    return 'Student';
  }, [target]);

  const registrationNo = useMemo(() => {
    if (!target) return 'N/A';
    return target.registrationNo || target.registration_no || target.student?.registration_no || target.student?.registrationNo || 'N/A';
  }, [target]);

  // Query ALL active non-archived pending/partial/overdue vouchers for the student (sorted due_date ASC)
  const { data: rawStudentPendingVouchers = [], isLoading: loadingVouchers } = useQuery({
    queryKey: ['student-unpaid-vouchers', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      try {
        const vouchers = await feePaymentService.getUnpaidVouchers(studentId);
        return vouchers || [];
      } catch (err) {
        console.error('Failed to fetch student unpaid vouchers for payment allocation:', err);
        return [];
      }
    },
    enabled: !!studentId && !!open,
  });

  const className = useMemo(() => {
    if (!target) return 'N/A';
    const directClass =
      target.class_name ||
      target.className ||
      target.Class?.name ||
      target.class?.name ||
      target.student?.class_name ||
      target.student?.className ||
      target.student?.Class?.name ||
      target.student?.class?.name ||
      target.student?.details?.academic_info?.class_name ||
      target.student?.details?.academic_info?.class?.name;

    if (directClass && directClass !== 'N/A') return directClass;

    const vWithClass = (rawStudentPendingVouchers || []).find((v) => v.class_name || v.className);
    return vWithClass?.class_name || vWithClass?.className || 'N/A';
  }, [target, rawStudentPendingVouchers]);

  const sectionName = useMemo(() => {
    if (!target) return 'N/A';
    const directSection =
      target.section_name ||
      target.sectionName ||
      target.Section?.name ||
      target.section?.name ||
      target.student?.section_name ||
      target.student?.sectionName ||
      target.student?.Section?.name ||
      target.student?.section?.name ||
      target.student?.details?.academic_info?.section_name ||
      target.student?.details?.academic_info?.section?.name;

    if (directSection && directSection !== 'N/A') return directSection;

    const vWithSec = (rawStudentPendingVouchers || []).find((v) => v.section_name || v.sectionName);
    return vWithSec?.section_name || vWithSec?.sectionName || 'N/A';
  }, [target, rawStudentPendingVouchers]);

  // Mode: 'fifo' (auto real-time calculation) vs 'custom' (manual per-voucher adjustments)
  const [allocationMode, setAllocationMode] = useState('fifo');
  const [customAllocations, setCustomAllocations] = useState({});

  const [paymentForm, setPaymentForm] = useState({
    totalReceived: '',
    method: 'cash',
    referenceNo: '',
    remarks: '',
    paidDate: new Date().toISOString().split('T')[0],
  });

  // Ensure target voucher is in the list and sort chronologically by due_date ASC
  const availablePendingVouchers = useMemo(() => {
    if (!target) return [];
    const list = [...rawStudentPendingVouchers];
    if (target.id && !list.some((v) => String(v.id) === String(target.id))) {
      const pendingOfTarget = feePaymentService.getStandalonePendingAmount(target);
      if (!target.archived && target.status !== 'paid' && target.status !== 'cancelled' && pendingOfTarget > 0) {
        list.unshift(target);
      }
    }
    return feePaymentService.sortChronologically(list);
  }, [rawStudentPendingVouchers, target]);

  // Total student pending dues across all pending vouchers
  const totalStudentPendingDues = useMemo(() => {
    return feePaymentService.calculateTotalPendingDues(availablePendingVouchers);
  }, [availablePendingVouchers]);

  // Initial pre-population when modal opens
  useEffect(() => {
    if (open && target) {
      const initialPending = feePaymentService.getStandalonePendingAmount(target);
      const defaultAmount = initialPending > 0 ? initialPending : totalStudentPendingDues;
      setPaymentForm({
        totalReceived: String(defaultAmount || ''),
        method: 'cash',
        referenceNo: '',
        remarks: '',
        paidDate: new Date().toISOString().split('T')[0],
      });
      setAllocationMode('fifo');
      setCustomAllocations({});
    }
  }, [open, target, totalStudentPendingDues]);

  const totalReceivedNumber = parseFloat(paymentForm.totalReceived) || 0;

  // Real-Time FIFO Allocation Calculation preview (oldest month to newest month)
  const fifoAllocatedRows = useMemo(() => {
    return feePaymentService.calculateFifoAllocation(availablePendingVouchers, totalReceivedNumber);
  }, [availablePendingVouchers, totalReceivedNumber]);

  // Effective Active Allocations (either computed FIFO or user-customized)
  const activeAllocationsMap = useMemo(() => {
    if (allocationMode === 'fifo') {
      const map = {};
      for (const row of fifoAllocatedRows) {
        map[row.voucherId] = row.allocatedAmount;
      }
      return map;
    }
    return customAllocations;
  }, [allocationMode, fifoAllocatedRows, customAllocations]);

  // Display Itemized Rows with combined live metrics
  const itemizedVoucherRows = useMemo(() => {
    return availablePendingVouchers.map((voucher) => {
      const baseAmount = Number(
        voucher.base_amount ?? voucher.baseAmount ?? voucher.amount ?? voucher.net_amount ?? 0
      );
      const originalAmount = Number(
        voucher.net_amount || voucher.netAmount || voucher.amount_due || baseAmount
      );
      const alreadyPaid = Number(voucher.paid_amount || voucher.paidAmount || 0);
      const pendingAmount = feePaymentService.getStandalonePendingAmount(voucher);
      const monthLabel = feePaymentService.formatMonthLabel(voucher);

      const allocated = parseFloat(activeAllocationsMap[voucher.id]) || 0;
      const newRemainingBalance = Math.max(0, pendingAmount - allocated);
      const newPaidAmount = alreadyPaid + allocated;

      let settlementStatus = 'Unsettled';
      let badgeLabel = 'Unsettled';
      if (allocated >= pendingAmount && pendingAmount > 0) {
        settlementStatus = 'Fully Settled';
        badgeLabel = 'Fully Settled';
      } else if (allocated > 0) {
        settlementStatus = 'Partially Settled';
        badgeLabel = `Partially Settled - ${newRemainingBalance.toLocaleString('en-PK')} Remaining`;
      } else {
        settlementStatus = 'Unsettled';
        badgeLabel = 'Unsettled';
      }

      return {
        voucher,
        voucherId: voucher.id,
        voucherNumber: voucher.voucherNumber || voucher.voucher_number || voucher.voucher_no || String(voucher.id).slice(-6),
        monthLabel,
        dueDate: voucher.due_date || voucher.dueDate || null,
        baseAmount,
        originalAmount,
        alreadyPaid,
        pendingAmount,
        allocatedAmount: allocated,
        newRemainingBalance,
        newPaidAmount,
        settlementStatus,
        badgeLabel,
        isFullySettled: settlementStatus === 'Fully Settled',
        isPartiallySettled: settlementStatus === 'Partially Settled',
        isUnpaid: settlementStatus === 'Unpaid',
      };
    });
  }, [availablePendingVouchers, activeAllocationsMap]);

  const totalAllocatedNumber = useMemo(() => {
    return Object.values(activeAllocationsMap).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [activeAllocationsMap]);

  const remainingToAllocate = useMemo(() => {
    return totalReceivedNumber - totalAllocatedNumber;
  }, [totalReceivedNumber, totalAllocatedNumber]);

  const isAllocationBalanced = useMemo(() => {
    return totalReceivedNumber > 0 && Math.abs(remainingToAllocate) < 0.01 && totalAllocatedNumber > 0;
  }, [totalReceivedNumber, remainingToAllocate, totalAllocatedNumber]);

  // Quick Action: Pay Full Dues (auto-fill full aggregate balance)
  const handlePayFullDues = () => {
    setPaymentForm((prev) => ({
      ...prev,
      totalReceived: String(totalStudentPendingDues),
    }));
    setAllocationMode('fifo');
    setCustomAllocations({});
    toast.success(`Auto-filled full dues: PKR ${totalStudentPendingDues.toLocaleString('en-PK')}`);
  };

  // Switch to FIFO Auto-Allocation Mode
  const handleResetToFIFO = () => {
    setAllocationMode('fifo');
    setCustomAllocations({});
    toast.info('Switched to Real-Time FIFO Auto-Allocation');
  };

  // Custom Allocation Controls
  const handleToggleFullAllocation = (voucher) => {
    setAllocationMode('custom');
    const pending = feePaymentService.getStandalonePendingAmount(voucher);
    const currentForThis = parseFloat(activeAllocationsMap[voucher.id]) || 0;

    const currentMap = { ...activeAllocationsMap };
    if (Math.abs(currentForThis - pending) < 0.01 && pending > 0) {
      currentMap[voucher.id] = 0;
    } else {
      currentMap[voucher.id] = pending;
    }
    setCustomAllocations(currentMap);
  };

  const handleApplyRemainingToVoucher = (voucher) => {
    setAllocationMode('custom');
    const pending = feePaymentService.getStandalonePendingAmount(voucher);
    const currentForThis = parseFloat(activeAllocationsMap[voucher.id]) || 0;
    const currentOtherSum = totalAllocatedNumber - currentForThis;
    const unallocated = Math.max(totalReceivedNumber - currentOtherSum, 0);
    const amountToApply = Math.min(unallocated, pending);

    if (amountToApply <= 0) {
      toast.info('No unallocated cash remaining. Increase received amount or adjust other months.');
      return;
    }

    setCustomAllocations({
      ...activeAllocationsMap,
      [voucher.id]: amountToApply,
    });
  };

  const handleCustomAllocationChange = (voucher, value) => {
    setAllocationMode('custom');
    const pending = feePaymentService.getStandalonePendingAmount(voucher);
    const currentMap = { ...activeAllocationsMap };

    if (value === '' || value === null) {
      currentMap[voucher.id] = '';
      setCustomAllocations(currentMap);
      return;
    }

    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > pending) {
      num = pending;
      toast.warning(`Allocation capped at voucher pending balance: PKR ${pending.toLocaleString('en-PK')}`);
    }

    currentMap[voucher.id] = num;
    setCustomAllocations(currentMap);
  };

  const handleClearAllAllocations = () => {
    setAllocationMode('custom');
    const cleared = {};
    for (const v of availablePendingVouchers) {
      cleared[v.id] = 0;
    }
    setCustomAllocations(cleared);
  };

  // Payment Processing Mutation
  const paymentMutation = useMutation({
    mutationFn: (payload) => feePaymentService.processFifoPayment(payload),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
      qc.invalidateQueries({ queryKey: ['fees'] });
      qc.invalidateQueries({ queryKey: ['student-unpaid-vouchers'] });
      qc.invalidateQueries({ queryKey: ['student-pending-vouchers'] });
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['ledger-student-vouchers'] });
      qc.invalidateQueries({ queryKey: ['voucher-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(result?.message || 'Payment processed and settled successfully!');
      onClose();
      onSuccess?.();
    },
    onError: (err) => {
      if (err.response?.status === 403 || err.status === 403) {
        toast.error('Permission denied: You need permission to record fee payments.');
      } else {
        toast.error(err.message || 'Failed to process payment');
      }
    },
  });

  const handleProcessPayment = async () => {
    if (!canCollectFees) {
      toast.error('Permission denied: You do not have permission to collect fees.');
      return;
    }

    if (!totalReceivedNumber || totalReceivedNumber <= 0) {
      toast.error('Please enter a valid payment amount received.');
      return;
    }

    if (!isAllocationBalanced) {
      if (remainingToAllocate > 0) {
        toast.error(`Unallocated cash remaining: PKR ${remainingToAllocate.toFixed(2)}. Please allocate all received funds to monthly vouchers.`);
      } else {
        toast.error(`Overallocated by PKR ${Math.abs(remainingToAllocate).toFixed(2)}. Total allocated cannot exceed received amount.`);
      }
      return;
    }

    const allocationsList = Object.entries(activeAllocationsMap)
      .filter(([_, amt]) => parseFloat(amt) > 0)
      .map(([voucherId, amt]) => ({
        voucherId,
        amountApplied: parseFloat(amt),
      }));

    if (allocationsList.length === 0) {
      toast.error('No vouchers have been allocated an amount.');
      return;
    }

    // Safety verification: ensure no allocation exceeds pending balance
    for (const alloc of allocationsList) {
      const v = availablePendingVouchers.find((item) => String(item.id) === String(alloc.voucherId));
      if (v) {
        const pending = feePaymentService.getStandalonePendingAmount(v);
        if (alloc.amountApplied > pending + 0.01) {
          toast.error(`Allocation for ${feePaymentService.formatMonthLabel(v)} (PKR ${alloc.amountApplied}) exceeds pending balance (PKR ${pending}).`);
          return;
        }
      }
    }

    const payload = {
      studentId,
      totalAmount: totalReceivedNumber,
      paymentMethod: paymentForm.method || 'cash',
      referenceNo: paymentForm.referenceNo || null,
      remarks: paymentForm.remarks || null,
      paidDate: paymentForm.paidDate || new Date().toISOString().split('T')[0],
      allocations: allocationsList,
    };

    paymentMutation.mutate(payload);
  };

  return (
    <AppModal
      open={open}
      onClose={() => {
        onClose();
        setCustomAllocations({});
      }}
      title="Multi-Month Fee Payment Collection (FIFO Allocation)"
      size="xl"
    >
      {target && (
        <div className="space-y-5">
          {/* Student Overview Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {studentName}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                  Reg: {registrationNo}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Class: <span className="font-medium text-slate-700 dark:text-slate-300">{className}</span> • Section: <span className="font-medium text-slate-700 dark:text-slate-300">{sectionName}</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Outstanding Dues</p>
              <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                PKR {totalStudentPendingDues.toLocaleString('en-PK')}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Across {availablePendingVouchers.length} unpaid monthly voucher{availablePendingVouchers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Step 1: Payment Amount Entry & Quick Toggle: Pay Full Dues */}
          <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-600" />
                <span>1. Enter Payment Amount Received (PKR) *</span>
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePayFullDues}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                  title="Auto-fill total dues and mark all monthly vouchers as Fully Settled"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pay Full Dues (PKR {totalStudentPendingDues.toLocaleString('en-PK')})</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">PKR</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.totalReceived}
                onChange={(e) => {
                  setPaymentForm({ ...paymentForm, totalReceived: e.target.value });
                  if (allocationMode !== 'fifo') {
                    setAllocationMode('fifo');
                  }
                }}
                placeholder="Enter amount (e.g. 3500)"
                className="w-full pl-14 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Step 2: Itemized Month-Wise Voucher Breakdown & FIFO Preview */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>2. Itemized Month-by-Month Allocation (FIFO Order)</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Vouchers are ordered chronologically by due date (oldest month first). Funds deduct sequentially in First-In, First-Out sequence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToFIFO}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1",
                    allocationMode === 'fifo'
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  )}
                  title="Auto-allocate in strict chronological FIFO order"
                >
                  <RefreshCw size={12} className={allocationMode === 'fifo' ? 'animate-spin-once' : ''} />
                  <span>Auto-Allocate (FIFO)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllAllocations}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Clear Allocations
                </button>
              </div>
            </div>

            {loadingVouchers ? (
              <div className="p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2 border rounded-xl bg-slate-50 dark:bg-slate-900/30">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Fetching unpaid monthly vouchers...</span>
              </div>
            ) : itemizedVoucherRows.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground border rounded-xl bg-slate-50 dark:bg-slate-900/30">
                No unpaid fee vouchers found for this student.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3.5">Fee Month & Year</th>
                        <th className="py-3 px-3 text-right">Base Fee</th>
                        <th className="py-3 px-3 text-right">Total Net Due</th>
                        <th className="py-3 px-3 text-right">Paid Amount</th>
                        <th className="py-3 px-3 text-right">Pending Balance</th>
                        <th className="py-3 px-3 text-center">Live Settlement Badge</th>
                        <th className="py-3 px-3 text-right">Allocated Now</th>
                        <th className="py-3 px-3 text-right">Remaining Preview</th>
                        <th className="py-3 px-3.5 text-center">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {itemizedVoucherRows.map((row) => {
                        const {
                          voucher,
                          voucherId,
                          voucherNumber,
                          monthLabel,
                          baseAmount,
                          originalAmount,
                          alreadyPaid,
                          pendingAmount,
                          allocatedAmount,
                          newRemainingBalance,
                          settlementStatus,
                          badgeLabel,
                          isFullySettled,
                          isPartiallySettled,
                          isUnpaid,
                        } = row;

                        return (
                          <tr
                            key={voucherId}
                            className={cn(
                              "transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40",
                              isFullySettled && "bg-emerald-50/30 dark:bg-emerald-950/10",
                              isPartiallySettled && "bg-amber-50/30 dark:bg-amber-950/10"
                            )}
                          >
                            {/* Fee Month & Year */}
                            <td className="py-3 px-3.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    {monthLabel}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                    #{voucherNumber}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                  <span>Due: {voucher.due_date || voucher.dueDate ? new Date(voucher.due_date || voucher.dueDate).toLocaleDateString('en-PK') : 'N/A'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Base Fee */}
                            <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                              PKR {baseAmount.toLocaleString('en-PK')}
                            </td>

                            {/* Total Net Due (with Arrears) */}
                            <td className="py-3 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                              PKR {originalAmount.toLocaleString('en-PK')}
                            </td>

                            {/* Paid Amount */}
                            <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400">
                              PKR {alreadyPaid.toLocaleString('en-PK')}
                            </td>

                            {/* Standalone Pending Balance */}
                            <td className="py-3 px-3 text-right font-bold text-orange-600 dark:text-orange-400">
                              PKR {pendingAmount.toLocaleString('en-PK')}
                            </td>

                            {/* Live Settlement Badge */}
                            <td className="py-3 px-3 text-center">
                              {isFullySettled ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                  <Check className="w-3 h-3" /> Fully Settled
                                </span>
                              ) : isPartiallySettled ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                                  {badgeLabel}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                  Unsettled
                                </span>
                              )}
                            </td>

                            {/* Allocated Now */}
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center justify-end">
                                <input
                                  type="number"
                                  min="0"
                                  max={pendingAmount}
                                  step="0.01"
                                  value={activeAllocationsMap[voucherId] ?? ''}
                                  onChange={(e) => handleCustomAllocationChange(voucher, e.target.value)}
                                  placeholder="0.00"
                                  className={cn(
                                    "w-24 px-2 py-1 text-right font-bold text-xs rounded-md border focus:outline-none focus:ring-2",
                                    allocatedAmount > 0
                                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 focus:ring-emerald-500"
                                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-blue-500"
                                  )}
                                />
                              </div>
                            </td>

                            {/* New Remaining Balance */}
                            <td className="py-3 px-3 text-right font-bold">
                              {newRemainingBalance === 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400">0.00 (Cleared)</span>
                              ) : (
                                <span className="text-slate-700 dark:text-slate-300">
                                  PKR {newRemainingBalance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>

                            {/* Row Action Controls */}
                            <td className="py-3 px-3.5 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFullAllocation(voucher)}
                                  className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold transition-all",
                                    isFullySettled
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  )}
                                  title={isFullySettled ? "Click to reset" : "Full settle this voucher"}
                                >
                                  Full
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyRemainingToVoucher(voucher)}
                                  disabled={remainingToAllocate <= 0 && allocatedAmount === 0}
                                  className="px-2 py-1 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 disabled:opacity-30 transition-all"
                                  title="Apply unallocated cash"
                                >
                                  Remainder
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Real-Time Cash Allocation & Reconciliation Banner */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Received</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  PKR {totalReceivedNumber.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Total Allocated</p>
                <p className="text-base font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">
                  PKR {totalAllocatedNumber.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div
                className={cn(
                  "p-3 rounded-xl border",
                  isAllocationBalanced
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : remainingToAllocate > 0
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider">Unallocated Cash</p>
                <p className="text-base font-extrabold mt-0.5">
                  PKR {remainingToAllocate.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Reconciliation Status Alert */}
            {isAllocationBalanced ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Perfect! Total allocated funds match received cash exactly (PKR {totalReceivedNumber.toFixed(2)} / PKR {totalReceivedNumber.toFixed(2)}). Ready to record and settle.</span>
              </div>
            ) : remainingToAllocate > 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>PKR {remainingToAllocate.toFixed(2)} remaining unallocated. All received funds must be distributed across monthly vouchers.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Overallocated by PKR {Math.abs(remainingToAllocate).toFixed(2)}! Total allocated cannot exceed received funds.</span>
              </div>
            )}
          </div>

          {/* Step 4: Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <SelectField
              label="Payment Method *"
              required
              options={PAYMENT_METHOD_OPTS}
              value={paymentForm.method}
              onChange={(val) => setPaymentForm({ ...paymentForm, method: val })}
            />

            <div>
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Payment Date</label>
              <input
                type="date"
                value={paymentForm.paidDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setPaymentForm({ ...paymentForm, paidDate: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 border rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Reference / Receipt No. (Optional)</label>
              <input
                type="text"
                value={paymentForm.referenceNo}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                placeholder="e.g. Bank slip, EasyPaisa TID, Cheque #"
                className="w-full mt-1.5 px-3 py-2 border rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Remarks / Cashier Notes (Optional)</label>
              <input
                type="text"
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                placeholder="e.g. Cleared July & August, remainder to September"
                className="w-full mt-1.5 px-3 py-2 border rounded-md bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                onClose();
                setCustomAllocations({});
              }}
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={!isAllocationBalanced || paymentMutation.isPending || !canCollectFees}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 transition-all"
            >
              {paymentMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Process Payment (PKR {totalReceivedNumber.toLocaleString('en-PK')})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </AppModal>
  );
}
