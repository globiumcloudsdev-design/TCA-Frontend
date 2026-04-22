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
  const breakdown = voucher?.feeBreakdown;

  if (Array.isArray(breakdown) && breakdown.length) {
    breakdown.forEach((item) => {
      rows.push({
        feeType: item.feeType || item.label || item.type || 'Fee Item',
        amount: toNumber(item.amount || item.value),
      });
    });
  } else if (breakdown && typeof breakdown === 'object') {
    Object.entries(breakdown).forEach(([key, value]) => {
      rows.push({
        feeType: toTitle(key),
        amount: toNumber(value),
      });
    });
  }

  if (!rows.length) {
    rows.push(
      { feeType: 'Tuition Fee', amount: toNumber(voucher?.amount) },
      { feeType: 'Admission Fee', amount: 0 },
      { feeType: 'Exam Fee', amount: 0 },
      { feeType: 'Library Fee', amount: 0 },
      { feeType: 'Computer Fee', amount: 0 },
      { feeType: 'Transport Fee', amount: 0 },
      { feeType: 'Previous Balance', amount: 0 },
      { feeType: 'Fine', amount: 0 },
      { feeType: 'Discount', amount: toNumber(voucher?.discount) },
    );
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

  const derivedStudentId = studentId || voucherQuery.data?.studentId;

  const studentQuery = useQuery({
    queryKey: ['student-preview-data', derivedStudentId],
    queryFn: () => studentService.getById(derivedStudentId),
    enabled: Boolean(derivedStudentId),
  });

  const mapped = useMemo(() => {
    const voucher = voucherQuery.data || {};
    const studentPayload = getPayload(studentQuery.data);

    const storeInstitute = instituteStore.currentInstitute || null;
    const authInstitute = authStore.getInstitute?.() || null;
    const apiInstitute = voucher?.institute || voucher?.Institute || null;
    const selectedInstitute = apiInstitute || storeInstitute || authInstitute || {};

    const instituteData = {
      name: selectedInstitute.name || selectedInstitute.title || 'Institute Name',
      logo:
        selectedInstitute.logo_url ||
        selectedInstitute.logo ||
        instituteStore.instituteLogo?.() ||
        authStore.instituteLogo?.() ||
        null,
      address:
        selectedInstitute.campus_address ||
        selectedInstitute.address ||
        selectedInstitute.location ||
        'Campus address not available',
      phone: selectedInstitute.phone || selectedInstitute.phone_number || selectedInstitute.contact_number || 'N/A',
      email: selectedInstitute.email || selectedInstitute.contact_email || 'N/A',
    };

    const student = voucher?.Student || studentPayload || {};
    const fullName =
      student?.name ||
      student?.student_name ||
      [student?.first_name, student?.last_name].filter(Boolean).join(' ') ||
      voucher?.studentName ||
      'Student Name';

    const studentData = {
      studentName: fullName,
      fatherName: student?.father_name || student?.fatherName || student?.guardian_name || 'N/A',
      className:
        student?.class_name ||
        student?.Class?.name ||
        student?.class?.name ||
        student?.class ||
        voucher?.className ||
        'N/A',
      section: student?.section_name || student?.Section?.name || student?.section?.name || student?.section || 'N/A',
      rollNumber: student?.roll_no || student?.roll_number || student?.rollNumber || voucher?.registrationNo || 'N/A',
      studentId: student?.student_id || student?.registration_no || student?.id || voucher?.studentId || 'N/A',
    };

    const monthIndex = Number(voucher?.month);

    const voucherMeta = {
      title: 'School Fee Voucher',
      voucherNumber: voucher?.voucherNumber || voucher?.voucher_no || 'N/A',
      issueDate: voucher?.issuedDate || voucher?.issued_date || voucher?.createdAt || new Date().toISOString(),
      dueDate: voucher?.dueDate || voucher?.due_date || new Date().toISOString(),
      month: MONTH_NAMES[monthIndex - 1] || voucher?.month || 'N/A',
      year: voucher?.year || new Date(voucher?.issuedDate || voucher?.issued_date || voucher?.createdAt || Date.now()).getFullYear(),
      feeStatus: voucher?.status || 'pending',
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
  }, [authStore, instituteStore, studentQuery.data, voucherQuery.data]);

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
