'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { feeVoucherService } from '@/services/feeVoucherService';
import { studentService } from '@/services/studentService';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPayload = (payload) => payload?.data?.data || payload?.data || payload || {};

const toTitle = (value = '') => {
  if (!value) return '';
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildFeeRows = (voucher) => {
  const rows = [];
  const breakdown = voucher?.feeBreakdown || voucher?.fee_breakdown;

  if (Array.isArray(breakdown) && breakdown.length) {
    breakdown.forEach((item) => {
      rows.push({
        feeType: item.feeType || item.label || item.type || item.fee_type || 'Fee Item',
        amount: toNumber(item.amount || item.value),
      });
    });
  } else if (breakdown && typeof breakdown === 'object') {
    Object.entries(breakdown).forEach(([key, value]) => {
      // Exclude metadata fields stored in fee_breakdown
      if (['student_name', 'registration_no', 'class_id', 'section_id', 'class_name', 'section_name', 'fee_template_applied', 'previous_balance_status'].includes(key)) {
        return;
      }
      const numVal = toNumber(value);
      if (numVal > 0) {
        rows.push({
          feeType: toTitle(key),
          amount: numVal,
        });
      }
    });
  }

  if (!rows.length) {
    const baseAmt = toNumber(voucher?.base_amount ?? voucher?.baseAmount ?? voucher?.student?.monthly_fee ?? voucher?.amount);
    const arrearsAmt = toNumber(voucher?.arrears ?? voucher?.previous_arrears ?? voucher?.previousArrears);
    const discountAmt = toNumber(voucher?.discount ?? voucher?.concession_amount);

    if (baseAmt > 0) rows.push({ feeType: 'Tuition Fee', amount: baseAmt });
    if (arrearsAmt > 0) rows.push({ feeType: 'Previous Balance / Arrears', amount: arrearsAmt });
    if (discountAmt > 0) rows.push({ feeType: 'Concession / Discount', amount: discountAmt });
  }

  return rows;
};

export default function useFeeVoucherData({ voucherId, studentId } = {}) {
  const authStore = useAuthStore();
  const instituteStore = useInstituteStore();

  const voucherQuery = useQuery({
    queryKey: ['fee-voucher-preview', voucherId],
    queryFn: () => feeVoucherService.getById(voucherId),
    enabled: Boolean(voucherId),
  });

  const rawVoucher = voucherQuery.data || {};
  const derivedStudentId = studentId || rawVoucher?.studentId || rawVoucher?.student_id || rawVoucher?.Student?.id;

  const studentQuery = useQuery({
    queryKey: ['student-preview-data', derivedStudentId],
    queryFn: () => studentService.getById(derivedStudentId),
    enabled: Boolean(derivedStudentId),
  });

  const mapped = useMemo(() => {
    const voucher = rawVoucher;
    const studentPayload = getPayload(studentQuery.data);

    const storeInstitute = instituteStore.currentInstitute || null;
    const authInstitute = authStore.getInstitute?.() || null;
    const apiInstitute = voucher?.institute || voucher?.Institute || null;
    const selectedInstitute = apiInstitute || storeInstitute || authInstitute || {};

    const instituteData = {
      name: selectedInstitute.name || selectedInstitute.title || 'The Clouds Academy',
      logo:
        selectedInstitute.logo_url ||
        selectedInstitute.logo ||
        instituteStore.instituteLogo?.() ||
        authStore.instituteLogo?.() ||
        null,
      logo_url:
        selectedInstitute.logo_url ||
        selectedInstitute.logo ||
        instituteStore.instituteLogo?.() ||
        authStore.instituteLogo?.() ||
        null,
      address:
        selectedInstitute.campus_address ||
        selectedInstitute.address ||
        selectedInstitute.location ||
        '',
      phone: selectedInstitute.phone || selectedInstitute.phone_number || selectedInstitute.contact_number || '',
      email: selectedInstitute.email || selectedInstitute.contact_email || '',
    };

    const student = voucher?.Student || studentPayload || {};
    const fullName =
      student?.name ||
      student?.student_name ||
      [student?.first_name, student?.last_name].filter(Boolean).join(' ') ||
      voucher?.studentName ||
      voucher?.student_name ||
      'Student';

    const classNameVal =
      voucher?.className ||
      voucher?.class_name ||
      student?.class_name ||
      student?.className ||
      student?.Class?.name ||
      student?.class?.name ||
      student?.details?.studentDetails?.class_name ||
      student?.details?.class_name ||
      student?.details?.active_session?.class_name ||
      studentPayload?.class_name ||
      studentPayload?.Class?.name ||
      studentPayload?.details?.studentDetails?.class_name ||
      '';

    const sectionNameVal =
      voucher?.sectionName ||
      voucher?.section_name ||
      student?.section_name ||
      student?.sectionName ||
      student?.Section?.name ||
      student?.section?.name ||
      student?.section ||
      student?.details?.studentDetails?.section_name ||
      student?.details?.section_name ||
      student?.details?.active_session?.section_name ||
      studentPayload?.section_name ||
      studentPayload?.Section?.name ||
      studentPayload?.details?.studentDetails?.section_name ||
      '';

    const fatherNameVal =
      voucher?.fatherName ||
      voucher?.father_name ||
      student?.father_name ||
      student?.fatherName ||
      student?.parent_name ||
      student?.guardian_name ||
      student?.details?.studentDetails?.father_name ||
      student?.details?.father_name ||
      studentPayload?.father_name ||
      studentPayload?.fatherName ||
      studentPayload?.details?.studentDetails?.father_name ||
      '';

    const studentData = {
      studentName: fullName,
      fatherName: fatherNameVal,
      className: classNameVal,
      class_name: classNameVal,
      sectionName: sectionNameVal,
      section_name: sectionNameVal,
      section: sectionNameVal,
      rollNumber: student?.roll_no || student?.roll_number || student?.rollNumber || voucher?.registrationNo || voucher?.registration_no || 'N/A',
      studentId: student?.student_id || student?.registration_no || student?.id || voucher?.studentId || voucher?.student_id || 'N/A',
      branch: voucher?.branch_name || voucher?.branch || student?.branch_name || student?.branch,
    };

    const monthIndex = Number(voucher?.month);

    const payments = voucher?.payments || voucher?.FeePayments || [];
    const paymentSum = payments.reduce((sum, p) => sum + toNumber(p.amount_paid || p.amount), 0);
    const paidAmount = toNumber(voucher?.paidAmount ?? voucher?.paid_amount ?? voucher?.amount_paid ?? paymentSum);
    const netAmount = toNumber(voucher?.netAmount ?? voucher?.net_amount ?? voucher?.amount ?? 0);
    const pendingAmount = Math.max(0, netAmount - paidAmount);
    const rawStatus = String(voucher?.status || voucher?.feeStatus || '').toLowerCase();
    const statusVal = rawStatus || (pendingAmount === 0 && paidAmount > 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid');

    const voucherMeta = {
      title: 'School Fee Voucher',
      voucherNumber: voucher?.voucherNumber || voucher?.voucher_number || voucher?.voucher_no || voucher?.id || 'N/A',
      issueDate: voucher?.issuedDate || voucher?.issued_date || voucher?.createdAt || new Date().toISOString(),
      dueDate: voucher?.dueDate || voucher?.due_date || new Date().toISOString(),
      month: MONTH_NAMES[monthIndex - 1] || voucher?.month || 'N/A',
      year: voucher?.year || new Date(voucher?.issuedDate || voucher?.issued_date || voucher?.createdAt || Date.now()).getFullYear(),
      status: statusVal,
      feeStatus: statusVal,
      netAmount,
      net_amount: netAmount,
      amount: netAmount,
      paidAmount,
      paid_amount: paidAmount,
      amount_paid: paidAmount,
      remainingAmount: pendingAmount,
      pending_amount: pendingAmount,
      payments,
      FeePayments: payments,
      lateFee: toNumber(voucher?.lateFee ?? voucher?.late_fee ?? voucher?.fine ?? 100),
      className: classNameVal,
      class_name: classNameVal,
      sectionName: sectionNameVal,
      section_name: sectionNameVal,
    };

    const feeStructure = buildFeeRows(voucher);

    return {
      instituteData,
      studentData,
      voucherMeta,
      feeStructure,
      rawVoucher: voucher,
      rawStudent: studentPayload,
    };
  }, [authStore, instituteStore, studentQuery.data, rawVoucher]);

  return {
    ...mapped,
    isLoading: voucherQuery.isLoading || studentQuery.isLoading,
    isFetching: voucherQuery.isFetching || studentQuery.isFetching,
    error: voucherQuery.error || studentQuery.error || null,
    refetch: async () => {
      await voucherQuery.refetch();
      if (derivedStudentId) {
        await studentQuery.refetch();
      }
    },
  };
}
