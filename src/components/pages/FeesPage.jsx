

'use client';
/**
 * FeesPage — Fee Vouchers (Single + Bulk Generation)
 * Data from feeVoucherService only.
 */
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, DollarSign, AlertCircle, FileText, Filter, Download, Trash2 } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import BulkVoucherGenerator from '@/components/forms/BulkVoucherGenerator';
import { cn } from '@/lib/utils';
import { downloadBlob } from '@/lib/download';
import { generateBulkFeeVouchersPdfBlob, generateFeeVoucherPdfBlob, generateFeeReceiptPdfBlob } from '@/lib/pdf/feeVoucherPdf';
import { feeVoucherService, academicYearService, classService, sectionService, studentService } from '@/services';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '../ui/button';

const STATUS_OPTS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'partial', label: 'Partial' },
];

const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
};

const MONTH_OPTS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2026, i).toLocaleString('default', { month: 'long' }),
}));

const FEE_TYPE_OPTS = [
  { value: 'monthly', label: 'Monthly Fee' },
  { value: 'annual', label: 'Annual Fee' },
  { value: 'lab', label: 'Lab Charges' },
  { value: 'admission', label: 'Admission Fee' },
  { value: 'fee_template', label: 'Fee Template' },
];

const PAYMENT_METHOD_OPTS = [
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'other', label: 'Other' },
];

function SearchableSingleSelect({ label, value, onChange, options = [], placeholder = 'Search...', disabled = false }) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => String(option.value) === String(value)) || null;

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            suppressHydrationWarning
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-sm outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
              !selectedOption && 'text-slate-400'
            )}
          >
            <span className="truncate">{selectedOption?.label || placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Type to search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1">{option.label}</span>
                    {String(option.value) === String(value) ? <Check className="h-4 w-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function FeesPage() {
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const { terms } = useInstituteConfig();

  // Helper function to check permissions - Using correct permission names from your constants
  const hasPermission = (permission) => {
    return canDo(permission);
  };

  const canGenerateBulkVouchers = hasPermission('fees.voucher.bulk_generate') || hasPermission('fees.create');

  const [voucherGeneratorModal, setVoucherGeneratorModal] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const [confirmMarkPaid, setConfirmMarkPaid] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(new Map());
  const [voucherPage, setVoucherPage] = useState(1);
  const [voucherPageSize, setVoucherPageSize] = useState(20);
  const [markingAsPaid, setMarkingAsPaid] = useState(null);
  const [recordingPayment, setRecordingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', referenceNo: '', remarks: '' });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkDownloadMode, setBulkDownloadMode] = useState('class');
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState({ current: 0, total: 0 });

  // Filters
  const currentMonth = String(new Date().getMonth() + 1);
  const [voucherMonth, setVoucherMonth] = useState(currentMonth);
  const [voucherAcademicYearId, setVoucherAcademicYearId] = useState('');
  const [voucherStatus, setVoucherStatus] = useState('');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [viewingVoucher, setViewingVoucher] = useState(null);
const [bulkFilters, setBulkFilters] = useState({
    academicYearId: '',
    classId: currentInstitute?.type === 'institute' ? '__all__' : '',
  sectionId: currentInstitute?.type === 'institute' ? '__all__' : '',
    month: currentMonth,
    studentId: '',
    feeType: '__all__',
    dueDate: '',
  });

  // Debug permissions on mount
  useEffect(() => {
    console.log('🔐 Permission check:', {
      canReadFees: hasPermission('fees.read'),
      canCreateFees: hasPermission('fees.create'),
      canGenerateBulkVouchers,
      canUpdateFees: hasPermission('fees.update'),
      canDeleteFees: hasPermission('fees.delete'),
      canCollectFees: hasPermission('fees.collect'),
    });
  }, [canDo, canGenerateBulkVouchers]);

  // Academic years
  const { data: academicYearsData = [] } = useQuery({
    queryKey: ['academic-years-fees', currentInstitute?.id],
    queryFn: async () => {
      try {
        const response = await academicYearService.getAll({
          institute_id: currentInstitute?.id,
          is_active: true,
        });
        return response?.data?.rows || response?.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!currentInstitute?.id,
  });

  useEffect(() => {
    if (academicYearsData.length > 0 && !voucherAcademicYearId) {
      const current = academicYearsData.find((ay) => ay.is_current) || academicYearsData[0];
      if (current) setVoucherAcademicYearId(current.id);
    }
  }, [academicYearsData, voucherAcademicYearId]);

  useEffect(() => {
    if (academicYearsData.length > 0 && !bulkFilters.academicYearId) {
      const current = academicYearsData.find((ay) => ay.is_current) || academicYearsData[0];
      if (current) {
        setBulkFilters((prev) => ({ ...prev, academicYearId: String(current.id) }));
      }
    }
  }, [academicYearsData, bulkFilters.academicYearId]);

const { data: bulkClasses = [] } = useQuery({
    queryKey: ['fees-bulk-classes-all', currentInstitute?.id],
    queryFn: async () => {
      if (!currentInstitute?.id) return [];
      try {
        // Fetch ALL classes across ALL academic years for comprehensive mapping
      const response = await classService.getAll({
          institute_id: currentInstitute?.id,
          institute_type: currentInstitute?.type,
          include_sections: true,
          limit: 2000, // Increased limit for historical classes
          archived: false, // Exclude truly deleted classes
        });
        const rows = response?.data?.rows || response?.rows || (Array.isArray(response?.data) ? response.data : []) || (Array.isArray(response) ? response : []);
        const finalRows = Array.isArray(rows) ? rows : [];
        console.log('✅ Loaded', finalRows.length, 'classes across all years for PDF mapping');
        return finalRows;
      } catch (error) {
        console.error('❌ Failed to load bulk download classes:', error);
        return [];
      }
    },
    enabled: !!currentInstitute?.id,
  });

  const bulkClassOptions = useMemo(
    () => (bulkClasses || [])
      .map((item) => ({
        value: String(item?.id || item?.class_id || ''),
        label: item?.name || item?.class_name || 'Class',
      }))
      .filter((item) => item.value),
    [bulkClasses]
  );

  const selectedBulkClass = useMemo(
    () => (bulkClasses || []).find(
      (item) => String(item?.id || item?.class_id || '') === String(bulkFilters.classId)
    ) || null,
    [bulkClasses, bulkFilters.classId]
  );

  const bulkSectionOptions = useMemo(() => {
    const sections = Array.isArray(selectedBulkClass?.sections)
      ? selectedBulkClass.sections
      : Array.isArray(selectedBulkClass?.Sections)
        ? selectedBulkClass.Sections
        : [];

    return [
      { value: '__all__', label: 'All Sections' },
      ...sections
        .map((section) => ({
          value: String(section?.id || section?.section_id || ''),
          label: section?.name || section?.section_name || 'Section',
        }))
        .filter((section) => section.value),
    ];
  }, [selectedBulkClass]);

  const { data: bulkStudents = [] } = useQuery({
    queryKey: ['fees-bulk-students', currentInstitute?.id, bulkFilters.academicYearId, bulkFilters.classId, bulkFilters.sectionId],
    queryFn: async () => {
      if (!currentInstitute?.id || !bulkFilters.academicYearId || !bulkFilters.classId || bulkFilters.classId === '__all__') {
        return [];
      }

      try {
        const response = await studentService.getAll(
          {
            institute_id: currentInstitute?.id,
            institute_type: currentInstitute?.type,
            academic_year_id: bulkFilters.academicYearId,
            class_id: bulkFilters.classId,
            section_id: bulkFilters.sectionId && bulkFilters.sectionId !== '__all__' ? bulkFilters.sectionId : undefined,
            limit: 1000,
          },
          currentInstitute?.type || 'school'
        );

        const rows = response?.data?.rows || response?.rows || response?.data || response || [];
        return Array.isArray(rows) ? rows : [];
      } catch (error) {
        console.error('Failed to load bulk download students:', error);
        return [];
      }
    },
    enabled: !!currentInstitute?.id && !!bulkFilters.academicYearId && !!bulkFilters.classId && bulkFilters.classId !== '__all__',
  });

  const bulkStudentOptions = useMemo(
    () => (bulkStudents || []).map((student) => ({
      value: String(student?.id || ''),
      label: `${student?.registration_no || student?.registrationNo || 'N/A'} - ${student?.first_name || student?.full_name || ''} ${student?.last_name || ''}`.trim(),
    })).filter((item) => item.value),
    [bulkStudents]
  );

  useEffect(() => {
    setBulkFilters((prev) => ({ ...prev, classId: '', sectionId: '__all__' }));
  }, [bulkFilters.academicYearId]);

  useEffect(() => {
    setBulkFilters((prev) => ({ ...prev, sectionId: '__all__', studentId: '' }));
  }, [bulkFilters.classId]);

  useEffect(() => {
    setBulkFilters((prev) => ({ ...prev, studentId: '' }));
  }, [bulkFilters.sectionId]);

  useEffect(() => {
    setBulkFilters((prev) => ({
      ...prev,
      sectionId: '__all__',
      classId: bulkDownloadMode === 'institute' ? '__all__' : prev.classId,
    }));
  }, [bulkDownloadMode]);

  // Reset pagination when filters change
  useEffect(() => {
    setVoucherPage(1);
  }, [voucherMonth, voucherAcademicYearId, voucherStatus, voucherSearch, voucherPageSize]);

  const modalClassOptions = useMemo(() => {
    if (bulkDownloadMode === 'institute') {
      return [{ value: '__all__', label: 'All Classes' }, ...bulkClassOptions];
    }
    return bulkClassOptions;
  }, [bulkClassOptions, bulkDownloadMode]);

  const selectedClassLabel = useMemo(() => {
    if (bulkDownloadMode === 'institute') return 'All Classes';
    const found = modalClassOptions.find((item) => String(item.value) === String(bulkFilters.classId));
    return found?.label || '';
  }, [bulkDownloadMode, modalClassOptions, bulkFilters.classId]);

  const selectedSectionLabel = useMemo(() => {
    const found = bulkSectionOptions.find((item) => String(item.value) === String(bulkFilters.sectionId));
    if (found?.value === '__all__') return 'All Sections';
    return found?.label || '';
  }, [bulkSectionOptions, bulkFilters.sectionId]);

  const normalizeDisplayValue = (value) => {
    const raw = String(value ?? '').trim();
    const normalized = raw.toLowerCase();
    if (!raw || normalized === 'n/a' || normalized === 'na' || normalized === '-') {
      return '';
    }
    return raw;
  };

  const buildClassSectionMaps = () => {
    console.log('🔍 Building class/section maps from', bulkClasses.length, 'classes');
    
    const classNameById = new Map();
    const sectionNameById = new Map();

    // Populate class map
    (bulkClasses || []).forEach((item) => {
      const classId = String(item?.id || item?.class_id || '');
      const className = item?.name || item?.class_name || 'Unknown Class';
      classNameById.set(classId, className);
    });

    // Populate section map
    (bulkClasses || [])
      .flatMap((item) => {
        const sections = Array.isArray(item?.sections) ? item.sections : (Array.isArray(item?.Sections) ? item.Sections : []);
        return sections;
      })
      .forEach((section) => {
        const sectionId = String(section?.id || section?.section_id || '');
        const sectionName = section?.name || section?.section_name || 'Unknown Section';
        sectionNameById.set(sectionId, sectionName);
      });

    console.log('✅ Class map size:', classNameById.size, 'Section map size:', sectionNameById.size);
    console.log('Class map sample:', Array.from(classNameById.entries()).slice(0, 3));
    console.log('Section map sample:', Array.from(sectionNameById.entries()).slice(0, 3));
    return { classNameById, sectionNameById };
  };

  // Fetch vouchers with pagination and permission check - Using CORRECT permission 'fees.read'
  const {
    data: voucherData = { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } },
    isLoading: vouchersLoading,
    refetch: refetchVouchers,
  } = useQuery({
    queryKey: ['fee-vouchers', currentInstitute?.id, voucherMonth, voucherAcademicYearId, voucherStatus, voucherPage, voucherPageSize, voucherSearch],
    queryFn: async () => {
      // Check permission before making request - USING CORRECT PERMISSION
      if (!hasPermission('fees.read')) {
        console.warn('⚠️ Missing fees.read permission');
        toast.error('You don\'t have permission to view fee vouchers');
        return { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      }
      
      const filters = {
        month: voucherMonth ? parseInt(voucherMonth) : undefined,
        academic_year_id: voucherAcademicYearId || undefined,
        status: voucherStatus || undefined,
        search: voucherSearch || undefined,
      };
      try {
        const response = await feeVoucherService.getAll(filters, { page: voucherPage, limit: voucherPageSize });
        console.log('✅ Fetched vouchers with pagination:', response);
        return response || { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      } catch (error) {
        if (error.response?.status === 403) {
          const errorMsg = error.response?.data?.message || 'Access denied. Required permission: fees.read';
          console.error('❌ Permission error:', errorMsg);
          toast.error(errorMsg);
          return { vouchers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
        }
        throw error;
      }
    },
    enabled: !!currentInstitute?.id && !!voucherAcademicYearId && hasPermission('fees.read'),
  });

  const vouchers = voucherData?.vouchers || [];
  const voucherPagination = voucherData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  // Stats
  const voucherStats = useMemo(() => {
    const paid = vouchers.filter((v) => v.status === 'paid');
    const pending = vouchers.filter((v) => ['pending', 'overdue', 'partial'].includes(v.status));
    return {
      total: vouchers.length,
      pending: pending.length,
      paid: paid.length,
      totalAmount: vouchers.reduce((sum, v) => sum + (Number(v.net_amount || v.netAmount || v.amount || 0)), 0),
      pendingAmount: pending.reduce((sum, v) => sum + (Number(v.pending_amount ?? (v.net_amount || v.netAmount || v.amount || 0))), 0),
    };
  }, [vouchers]);

  // Only paid vouchers amount
  const collectedAmount = useMemo(() => {
    return vouchers.reduce((sum, v) => sum + (Number(v.paid_amount || 0)), 0);
  }, [vouchers]);

  // Delete (archive) voucher
  const deleteVoucher = useMutation({
    mutationFn: (id) => feeVoucherService.delete(id),
    onSuccess: () => {
      toast.success('Voucher deleted');
      setDeletingVoucher(null);
      refetchVouchers();
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error('Permission denied. Required: fees.delete');
      } else {
        toast.error('Failed to delete voucher');
      }
    },
  });

  // Mark voucher as paid
  const markAsPaidMutation = useMutation({
    mutationFn: (voucherId) => feeVoucherService.updateStatus(voucherId, 'paid'),
    onSuccess: () => {
      toast.success('Voucher marked as paid');
      setMarkingAsPaid(null);
      refetchVouchers();
      qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.error('Permission denied. Required: fees.update');
      } else if (err.status === 404 || err.code === 'NOT_FOUND') {
        toast.error('Backend endpoint not yet implemented. Please contact administrator.');
      } else {
        toast.error(err.message || 'Failed to mark as paid');
      }
      setMarkingAsPaid(null);
    },
  });

  // Record partial payment
  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData) => feeVoucherService.recordPayment(paymentData.voucherId, {
      amount: parseFloat(paymentData.amount),
      paymentMethod: paymentData.method,
      referenceNo: paymentData.referenceNo || null,
      remarks: paymentData.remarks || null
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
      toast.success('Payment recorded successfully');
      setPaymentForm({ amount: '', method: 'cash', referenceNo: '', remarks: '' });
      setRecordingPayment(null);
      if (viewingVoucher) setViewingVoucher(null);
      refetchVouchers();
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.error('Permission denied. Required: fees.update');
      } else {
        toast.error(err.message || 'Failed to record payment');
      }
    },
  });

  const handleRecordPayment = async (voucherId) => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    recordPaymentMutation.mutate({ voucherId, ...paymentForm });
  };
  // Bulk download vouchers as PDF 
const handleBulkDownload = async () => {
  // Check permission first
  if (!hasPermission('fees.read')) {
    toast.error('You need fees.read permission to download vouchers');
    return;
  }

  if (!currentInstitute?.id) {
    toast.error('Institute is missing');
    return;
  }

  if (bulkDownloadMode === 'student') {
    if (!bulkFilters.studentId.trim()) {
      toast.error('Please enter Student ID');
      return;
    }
    if (!bulkFilters.academicYearId) {
      toast.error('Please select academic year');
      return;
    }
    if (!bulkFilters.classId || bulkFilters.classId === '__all__') {
      toast.error('Please select class');
      return;
    }
  }

  if (bulkDownloadMode === 'class') {
    if (!bulkFilters.academicYearId || !bulkFilters.classId || bulkFilters.classId === '__all__') {
      toast.error('Please select academic year and class');
      return;
    }
  }

  if (bulkDownloadMode === 'institute') {
    if (!bulkFilters.academicYearId) {
      toast.error('Please select academic year');
      return;
    }
  }

  setBulkDownloading(true);
  setBulkDownloadProgress({ current: 0, total: 0 });
  
  try {
    const BULK_PAGE_SIZE = 100;
    const isStudentMode = bulkDownloadMode === 'student';
    const isClassMode = bulkDownloadMode === 'class';
    const isInstituteMode = bulkDownloadMode === 'institute';
    
    console.group('🛠️ FIX: Bulk Fee Voucher Download - Enrolled Students Only');

    let enrolledStudentIds = [];
    let voucherFilters = {
      academic_year_id: bulkFilters.academicYearId,
    };

    // 🎯 STEP 1: Get ENROLLED students only (FIXES N/A issue)
    if (isClassMode) {
      console.log('📚 Class mode: Fetching enrolled students for class', bulkFilters.classId);
      
      // Get students enrolled in this class (specific section OR all sections)
      const studentFilters = {
        class_id: bulkFilters.classId,
        academic_year_id: bulkFilters.academicYearId,
        ...(bulkFilters.sectionId !== '__all__' && { section_id: bulkFilters.sectionId }),
        limit: 1000,  // Max students per class
      };
      
      const enrolledStudentsRes = await studentService.getAll(studentFilters, currentInstitute?.type || 'school');
      const studentData = enrolledStudentsRes?.data?.rows || enrolledStudentsRes?.rows || (Array.isArray(enrolledStudentsRes?.data) ? enrolledStudentsRes.data : []) || (Array.isArray(enrolledStudentsRes) ? enrolledStudentsRes : []);
      
      enrolledStudentIds = studentData.map(student => student.id).filter(Boolean);
      
      console.log(`✅ Found ${enrolledStudentIds.length} enrolled students`);
      
      if (enrolledStudentIds.length === 0) {
        toast.warning('No students enrolled in this class/section');
        return;
      }
      
      // Filter vouchers BY THESE STUDENT IDS only
      voucherFilters.student_ids = enrolledStudentIds;
      voucherFilters.month = bulkFilters.month ? parseInt(bulkFilters.month, 10) : undefined;
    } else if (isStudentMode) {
      enrolledStudentIds = [bulkFilters.studentId.trim()];
      voucherFilters.student_id = enrolledStudentIds[0];
      voucherFilters.class_id = bulkFilters.classId;
    } else {
      // Institute mode - get all students with vouchers for month
      voucherFilters.month = bulkFilters.month ? parseInt(bulkFilters.month, 10) : undefined;
    }

    console.log('🔍 Final voucher filters:', voucherFilters);
    console.log('👥 Limiting to student IDs:', enrolledStudentIds.slice(0, 5), '...');

    // 🎯 STEP 2: Fetch vouchers for enrolled students only
    const firstPage = await feeVoucherService.getAll(
      voucherFilters, 
      { page: 1, limit: BULK_PAGE_SIZE }, 
      { timeout: 45000 }
    );
    
    const totalPages = firstPage?.pagination?.totalPages || 1;
    let vouchersList = [...(firstPage?.vouchers || [])];
    
    console.log('📄 Page 1:', firstPage?.vouchers?.length || 0, 'vouchers');
    console.log('📊 Total pages:', totalPages);
    setBulkDownloadProgress({ current: 1, total: totalPages });

    // Paginate if needed
    for (let page = 2; page <= totalPages; page++) {
      const response = await feeVoucherService.getAll(
        voucherFilters, 
        { page, limit: BULK_PAGE_SIZE }, 
        { timeout: 45000 }
      );
      vouchersList.push(...(response?.vouchers || []));
      setBulkDownloadProgress({ current: page, total: totalPages });
    }

    console.log(`✅ Total vouchers for enrolled students: ${vouchersList.length}`);

    if (!vouchersList.length) {
      const modeMsg = isStudentMode ? 'student' : 
                     isClassMode ? `class ${selectedClassLabel} ${selectedSectionLabel}` : 
                     'institute';
      toast.error(`No vouchers found for ${modeMsg}`);
      return;
    }

    // 🎯 STEP 3: Same enrichment logic (but now correct students)
    const { classNameById, sectionNameById } = buildClassSectionMaps();
    
    // ... [rest of existing hydration/enrichment code remains the same]
    const getStudentPayload = (response) =>
      response?.data?.data || response?.data || response || {};

    const getStudentIdFromVoucher = (voucher) =>
      String(
        voucher?.studentId ||
        voucher?.student_id ||
        voucher?.student?.id ||
        voucher?.student?.student_id ||
        ''
      );

    const studentHydrationMap = new Map();
    const vouchersNeedingHydration = vouchersList.filter((voucher) => {
      const hasClass = normalizeDisplayValue(voucher?.className) || normalizeDisplayValue(voucher?.class_name);
      const hasSection = normalizeDisplayValue(voucher?.sectionName) || normalizeDisplayValue(voucher?.section_name);
      return !hasClass || !hasSection;
    });

    const uniqueStudentIds = Array.from(
      new Set(
        vouchersNeedingHydration
          .map(getStudentIdFromVoucher)
          .filter((id) => id && id !== 'undefined' && id !== 'null')
      )
    );

    console.log('Vouchers needing hydration:', vouchersNeedingHydration.length);
    console.log('Unique student IDs for hydration:', uniqueStudentIds.length);

    if (uniqueStudentIds.length) {
      const chunkSize = 20;
      for (let i = 0; i < uniqueStudentIds.length; i += chunkSize) {
        const chunk = uniqueStudentIds.slice(i, i + chunkSize);
        const results = await Promise.all(
          chunk.map(async (studentId) => {
            try {
              const response = await studentService.getById(studentId, { params: { institute_type: currentInstitute?.type, include: 'class,section' } });
              const student = getStudentPayload(response);

              const hydratedClassId = String(
                student?.class_id ||
                student?.classId ||
                student?.Class?.id ||
                student?.Class?.class_id ||
                student?.class?.id ||
                ''
              );

              const hydratedSectionId = String(
                student?.section_id ||
                student?.sectionId ||
                student?.Section?.id ||
                student?.Section?.section_id ||
                student?.section?.id ||
                ''
              );

              const hydratedClassName =
                normalizeDisplayValue(student?.class_name) ||
                normalizeDisplayValue(student?.Class?.name) ||
                normalizeDisplayValue(student?.class?.name) ||
                normalizeDisplayValue(student?.className) ||
                (hydratedClassId ? classNameById.get(hydratedClassId) : '');

              const hydratedSectionName =
                normalizeDisplayValue(student?.section_name) ||
                normalizeDisplayValue(student?.Section?.name) ||
                normalizeDisplayValue(student?.section?.name) ||
                normalizeDisplayValue(student?.sectionName) ||
                (hydratedSectionId ? sectionNameById.get(hydratedSectionId) : '');

              return {
                studentId,
                hydratedClassId,
                hydratedSectionId,
                hydratedClassName,
                hydratedSectionName,
              };
            } catch (error) {
              console.warn(`⚠️ Student hydration failed for ${studentId}:`, error?.message || error);
              return null;
            }
          })
        );

        results.filter(Boolean).forEach((item) => {
          studentHydrationMap.set(item.studentId, item);
          if (item.hydratedClassId && item.hydratedClassName) {
            classNameById.set(item.hydratedClassId, item.hydratedClassName);
          }
          if (item.hydratedSectionId && item.hydratedSectionName) {
            sectionNameById.set(item.hydratedSectionId, item.hydratedSectionName);
          }
        });
      }
    }

    console.log('Hydrated student records:', studentHydrationMap.size);
    
    console.log('🔍 Processing', vouchersList.length, 'vouchers for PDF');
    let missingClassCount = 0;
    let missingSectionCount = 0;

    const vouchersForPdf = await Promise.all(vouchersList.map(async (voucher) => {
      const voucherStudentId = getStudentIdFromVoucher(voucher);
      const hydratedStudent = studentHydrationMap.get(voucherStudentId);

      const classId = String(
        voucher?.classId ||
        voucher?.class_id ||
        voucher?.student?.class_id ||
        voucher?.student?.classId ||
        hydratedStudent?.hydratedClassId ||
        ''
      );
      const sectionId = String(
        voucher?.sectionId ||
        voucher?.section_id ||
        voucher?.student?.section_id ||
        voucher?.student?.sectionId ||
        hydratedStudent?.hydratedSectionId ||
        ''
      );
      
      // Comprehensive class name fallback chain - ENHANCED for class context
      let finalClassName = normalizeDisplayValue(voucher?.className) ||
                         normalizeDisplayValue(voucher?.class_name) ||
                         normalizeDisplayValue(hydratedStudent?.hydratedClassName) ||
                         (classId ? classNameById.get(classId) : '') ||
                         (isClassMode || isStudentMode ? selectedClassLabel : '');
      
      // Comprehensive section name fallback chain  
      let finalSectionName = normalizeDisplayValue(voucher?.sectionName) ||
                           normalizeDisplayValue(voucher?.section_name) ||
                           normalizeDisplayValue(hydratedStudent?.hydratedSectionName) ||
                           (sectionId ? sectionNameById.get(sectionId) : '') ||
                           (isClassMode && bulkFilters.sectionId === '__all__' ? 'All Sections' : selectedSectionLabel);
      
      // Final fallbacks - strictly use mode-based labels if still empty
      if (!normalizeDisplayValue(finalClassName)) {
        finalClassName = selectedClassLabel || (isClassMode ? 'Class' : 'N/A');
      }
      if (!normalizeDisplayValue(finalSectionName)) {
        finalSectionName = selectedSectionLabel || (isClassMode ? 'All Sections' : 'N/A');
      }
      
      console.log(`📋 Voucher ${voucher?.voucherNumber}: Class="${finalClassName}", Section="${finalSectionName}"`);
      
      if (!normalizeDisplayValue(finalClassName)) missingClassCount++;
      if (!normalizeDisplayValue(finalSectionName)) missingSectionCount++;

      const enrichedStudent = {
        ...voucher.student,
        class_name: finalClassName,
        className: finalClassName,
        section_name: finalSectionName,
        sectionName: finalSectionName,
        class: finalClassName,
        section: finalSectionName
      };

      return {
        ...voucher,
        student: enrichedStudent,
        classId: classId || voucher?.classId || voucher?.class_id,
        class_id: classId || voucher?.class_id || voucher?.classId,
        className: finalClassName,
        class_name: finalClassName,
        sectionId: sectionId || voucher?.sectionId || voucher?.section_id,
        section_id: sectionId || voucher?.section_id || voucher?.sectionId,
        sectionName: finalSectionName,
        section_name: finalSectionName,
      };
    }));

    // 🎯 STEP 4: Sort and generate PDF (same as before)
    const sortLabel = (value) => String(value || '').toLowerCase();
    const vouchersForPdfSorted = [...vouchersForPdf].sort((left, right) => {
      if (isStudentMode) {
        const monthDiff = (Number(left.month) || 0) - (Number(right.month) || 0);
        if (monthDiff !== 0) return monthDiff;
        return sortLabel(left.voucherNumber || left.voucher_number).localeCompare(sortLabel(right.voucherNumber || right.voucher_number));
      }

      const classDiff = sortLabel(left.className).localeCompare(sortLabel(right.className));
      if (classDiff !== 0) return classDiff;
      const sectionDiff = sortLabel(left.sectionName).localeCompare(sortLabel(right.sectionName));
      if (sectionDiff !== 0) return sectionDiff;
      const monthDiff = (Number(left.month) || 0) - (Number(right.month) || 0);
      if (monthDiff !== 0) return monthDiff;
      return sortLabel(left.studentName).localeCompare(sortLabel(right.studentName));
    });

    const blob = await generateBulkFeeVouchersPdfBlob({
      vouchers: vouchersForPdfSorted,
      instituteName: currentInstitute?.name || 'School Management System',
      logoUrl: currentInstitute?.logo_url
    });

    const safeName = `class-fee-vouchers-${selectedClassLabel}-${selectedSectionLabel}-${bulkFilters.month || 'all'}-${enrolledStudentIds.length}students`
      .replace(/[^a-zA-Z0-9_-]+/g, '-');

    downloadBlob(blob, `${safeName}.pdf`);
    toast.success(`✅ Downloaded ${vouchersList.length} vouchers for ${enrolledStudentIds.length} enrolled students only! 🎉`);
    
    // 🎯 STEP 5: Reset filters
    setBulkFilters({
      academicYearId: bulkFilters.academicYearId, // Keep year
      classId: currentInstitute?.type === 'institute' ? '__all__' : '',
      sectionId: currentInstitute?.type === 'institute' ? '__all__' : '',
      month: currentMonth,
      studentId: '',
      feeType: '__all__',
      dueDate: '',
    });
    setBulkDownloadOpen(false);
    
    console.groupEnd();
  } catch (error) {
    console.error('❌ Bulk download failed:', error);
    console.groupEnd();
    toast.error(error?.message || 'Failed to download bulk vouchers');
  } finally {
    setBulkDownloadProgress({ current: 0, total: 0 });
    setBulkDownloading(false);
  }
};

// Download single voucher PDF - IMPROVED VERSION
const handleDownloadVoucher = async (voucher) => {
  if (!hasPermission('fees.read')) {
    toast.error('You need fees.read permission to download vouchers');
    return;
  }

  try {
    toast.info(`Generating PDF for voucher ${voucher.voucherNumber || voucher.voucher_number}`);
    
    let className = '';
    let sectionName = '';
    
    // METHOD 1: Try to get from student record with full details
    const targetStudentId = voucher.studentId || voucher.student_id || voucher.Student?.id;
    if (targetStudentId) {
      try {
        // Fetch student with all relations
        const studentResponse = await studentService.getById(targetStudentId, { 
          params: { institute_type: currentInstitute?.type, include: 'class,section' } 
        });
        const student = studentResponse?.data || studentResponse;
        
        console.log('📚 Student data received for PDF:', student);
        
        // Extract class name - try all possible paths
        className = 
          student.class_name ||
          student.Class?.name ||
          student.class?.name ||
          student.current_class?.name ||
          student.enrolled_class?.name ||
          (student.classes && student.classes[0]?.name) ||
          (student.currentClass?.name) ||
          '';
        
        // Extract section name - try all possible paths
        sectionName = 
          student.section_name ||
          student.Section?.name ||
          student.section?.name ||
          student.current_section?.name ||
          student.enrolled_section?.name ||
          (student.sections && student.sections[0]?.name) ||
          (student.currentSection?.name) ||
          '';
        
        console.log(`📚 Found from student: Class="${className}", Section="${sectionName}"`);
        
      } catch (studentErr) {
        console.error('Failed to fetch student:', studentErr);
      }
    }
    
    // Use centralized mapping for consistency
    const { classNameById, sectionNameById } = buildClassSectionMaps();
    
    // Final check for class
    const cid = voucher.classId || voucher.class_id;
    if (cid && (!className || className === '')) {
      className = classNameById.get(String(cid)) || normalizeDisplayValue(voucher.className || voucher.class_name);
    }
    
    // Final check for section
    const sid = voucher.sectionId || voucher.section_id;
    if (sid && (!sectionName || sectionName === '')) {
      sectionName = sectionNameById.get(String(sid)) || normalizeDisplayValue(voucher.sectionName || voucher.section_name);
    }
    
    // Clean and fallback
    className = normalizeDisplayValue(className) || 'N/A';
    sectionName = normalizeDisplayValue(sectionName) || 'N/A';
    
    console.log('📚 FINAL values for PDF:', { className, sectionName });
    
    // Create enriched student data - MAKE SURE class/section are in the student object
    const studentData = {
      className: className,
      sectionName: sectionName,
      name: voucher.studentName || 'Student',
      registrationNo: voucher.registrationNo || 'N/A',
      class: className,     // Add for compatibility
      section: sectionName  // Add for compatibility
    };
    
    // Enrich voucher with the fetched data - PUT BOTH IN VOUCHER AND STUDENT
    const enrichedVoucher = {
      ...voucher,
      className: className,
      class_name: className,
      sectionName: sectionName,
      section_name: sectionName,
      student: studentData  // Also attach student data to voucher
    };
    
    console.log('📚 Enriched voucher:', {
      voucherNumber: enrichedVoucher.voucherNumber,
      className: enrichedVoucher.className,
      sectionName: enrichedVoucher.sectionName
    });
    
    const blob = await generateFeeVoucherPdfBlob({
      voucher: enrichedVoucher,
      student: studentData,
      instituteName: currentInstitute?.name || 'School Management System',
      logoUrl: currentInstitute?.logo_url
    });
    
    const safeName = `fee-voucher-${enrichedVoucher.voucherNumber || enrichedVoucher.voucher_number || 'unknown'}.pdf`;
    downloadBlob(blob, safeName);
    toast.success('Voucher PDF downloaded');
    
  } catch (error) {
    console.error('Failed to download voucher PDF:', error);
    toast.error('Failed to generate PDF: ' + (error.message || 'Unknown error'));
  }
};

const openVoucherInNewTab = async (voucher) => {
  if (!voucher?.id) return;
  try {
    const blob = await generateFeeVoucherPdfBlob({ 
      voucher, 
      instituteName: currentInstitute?.name || 'School Management System',
      logoUrl: currentInstitute?.logo_url
    });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    toast.error('Failed to generate PDF');
  }
};

const downloadReceipt = async (payment, voucher) => {
  if (!payment || !voucher) return;
  try {
    const blob = await generateFeeReceiptPdfBlob({
      payment,
      voucher,
      instituteName: currentInstitute?.name || 'School Management System',
      logoUrl: currentInstitute?.logo_url
    });
    downloadBlob(blob, `receipt_${payment.receipt_number || payment.id}.pdf`);
    toast.success('Receipt downloaded');
  } catch (err) {
    console.error('Receipt download error:', err);
    toast.error('Failed to download receipt');
  }
};

  const voucherColumns = useMemo(
    () => [
      {
        accessorKey: 'voucherNumber',
        header: 'Voucher #',
        cell: ({ row: { original: r } }) => <span className="font-mono font-semibold">{r.voucherNumber || 'N/A'}</span>
      },
      {
        accessorKey: 'student_id',
        header: `${terms.student}`,
        cell: ({ row: { original: r } }) => (
          <div>
            <p className="font-medium">{r.studentName || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Reg: {r.registrationNo || 'N/A'}</p>
          </div>
        ),
      },
      { accessorKey: 'month', header: 'Month', cell: ({ getValue }) => MONTH_OPTS.find(m => m.value === String(getValue()))?.label || getValue() },
      {
        accessorKey: 'net_amount',
        header: 'Amount / Balance',
        cell: ({ row: { original: r } }) => {
          const total = Number(r.net_amount || r.netAmount || r.amount || 0);
          const paid = Number(r.paid_amount || 0);
          const remaining = Number(r.pending_amount ?? (total - paid));
          
          return (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className={cn("text-sm font-bold", remaining > 0 ? "text-orange-600" : "text-emerald-600")}>
                  PKR {remaining.toLocaleString('en-PK')}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Left</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Total: PKR {total.toLocaleString('en-PK')}
              </div>
              {paid > 0 && (
                <div className="text-[10px] text-emerald-600 font-semibold italic">
                  Paid: PKR {paid.toLocaleString('en-PK')}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const s = getValue();
          return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s] || 'bg-gray-100')}>{s}</span>;
        },
      },
      { accessorKey: 'issuedDate', header: 'Issued', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button onClick={() => setViewingVoucher(row.original)} className="rounded p-1 hover:bg-accent" title="View Details">
              <FileText size={14} />
            </button>
            {row.original.status !== 'paid' && hasPermission('fees.update') && (
              <>
                <button
                  onClick={() => { 
                    setRecordingPayment(row.original); 
                    const initialAmount = row.original.pending_amount ?? (row.original.net_amount || row.original.netAmount || 0);
                    setPaymentForm({ 
                      amount: String(Number(initialAmount).toFixed(2)), 
                      method: 'cash', 
                      referenceNo: '', 
                      remarks: '' 
                    }); 
                  }}
                  disabled={recordingPayment?.id === row.original.id}
                  className="rounded p-1 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:opacity-50"
                  title="Record Payment"
                >
                  {recordingPayment?.id === row.original.id ? '⏳' : '💰'}
                </button>
                <button
                  onClick={() => setMarkingAsPaid(row.original.id)}
                  disabled={markingAsPaid === row.original.id}
                  className="rounded p-1 hover:bg-green-100 text-green-700 hover:text-green-800 disabled:opacity-50"
                  title="Mark as Paid"
                >
                  {markingAsPaid === row.original.id ? '⏳' : '✓'}
                </button>
              </>
            )}
            <button onClick={() => handleDownloadVoucher(row.original)} className="rounded p-1 hover:bg-accent" title="Download">
              <Download size={14} />
            </button>
            {hasPermission('fees.delete') && (
              <button onClick={() => setDeletingVoucher(row.original)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Delete">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [terms.student, hasPermission, setViewingVoucher, setDeletingVoucher, handleDownloadVoucher, markingAsPaid, recordingPayment, setRecordingPayment, setPaymentForm]
  );

  // Show permission denied message if user doesn't have read access
  if (!hasPermission('fees.read') && currentInstitute?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">
            You don't have permission to view fee vouchers.
          </p>
          <p className="text-sm text-red-500">
            Required permission: <code className="bg-red-100 px-2 py-1 rounded">fees.read</code>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader 
        title="Fee Vouchers" 
        description={`${voucherStats.total} vouchers • ${voucherStats.pending} pending`} 
        action={
          mounted && (
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('fees.read') && (
                <Button
                  onClick={() => setBulkDownloadOpen(true)}
                >
                  <Download size={14} /> Bulk Download
                </Button>
              )}
              {canGenerateBulkVouchers && (
                <Button 
                  onClick={() => setVoucherGeneratorModal(true)} 
                >
                  <Plus size={14} /> Generate Bulk Vouchers
                </Button>
              )}
            </div>
          )
        }
      />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Filter Vouchers</h3>
          <Filter size={16} className="text-muted-foreground" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Month" options={MONTH_OPTS} value={voucherMonth} onChange={setVoucherMonth} />
          <SelectField label="Academic Year" options={academicYearsData.map(ay => ({ value: ay.id, label: ay.name }))} value={voucherAcademicYearId} onChange={setVoucherAcademicYearId} />
          <SelectField label="Status" options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTS]} value={voucherStatus} onChange={setVoucherStatus} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard label="Total Vouchers" value={voucherStats.total} icon={<FileText size={18} />} />
        <StatsCard label="Collected (Paid)" value={`PKR ${collectedAmount.toLocaleString('en-PK')}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Pending Collection" value={voucherStats.pending} icon={<AlertCircle size={18} />} />
        <StatsCard label="Pending Amount" value={`PKR ${voucherStats.pendingAmount.toLocaleString('en-PK')}`} icon={<DollarSign size={18} />} />
      </div>

      {/* Vouchers Table with Action Buttons and Pagination */}
      <DataTable
        columns={voucherColumns}
        data={vouchers}
        loading={vouchersLoading}
        search={voucherSearch}
        onSearch={setVoucherSearch}
        searchPlaceholder="Search Name, Reg #, Email or Voucher #..."
        emptyMessage="No vouchers found for selected filters"
        enableColumnVisibility
        exportConfig={{ fileName: `fee-vouchers-${voucherMonth}` }}
        pagination={{
          page: voucherPagination.page,
          pageSize: voucherPageSize,
          total: voucherPagination.total,
          totalPages: voucherPagination.totalPages,
          onPageChange: setVoucherPage,
          onPageSizeChange: (size) => {
            setVoucherPageSize(size);
            setVoucherPage(1);
          },
        }}
      />

      {/* Bulk Voucher Generator Modal */}
      <AppModal open={voucherGeneratorModal} onClose={() => setVoucherGeneratorModal(false)} title="Generate Bulk Vouchers" size="xl">
        {canGenerateBulkVouchers ? (
          <BulkVoucherGenerator
            instituteId={currentInstitute?.id}
            onSuccess={() => {
              setVoucherGeneratorModal(false);
              refetchVouchers();
              qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
              toast.success('Bulk vouchers generated!');
            }}
          />
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Permission denied. Required: <strong>fees.voucher.bulk_generate</strong> (or legacy <strong>fees.create</strong>).
          </div>
        )}
      </AppModal>

      <AppModal open={bulkDownloadOpen} onClose={() => setBulkDownloadOpen(false)} title="Bulk Voucher Download" size="xl">
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setBulkDownloadMode('student')}
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium',
                bulkDownloadMode === 'student'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700'
              )}
            >
              Download by Student
            </button>
            <button
              type="button"
              onClick={() => setBulkDownloadMode('class')}
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium',
                bulkDownloadMode === 'class'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700'
              )}
            >
              For Class
            </button>
            <button
              type="button"
              onClick={() => setBulkDownloadMode('institute')}
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium',
                bulkDownloadMode === 'institute'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700'
              )}
            >
              For Institute
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {bulkDownloadMode === 'student' && (
              <>
                <SelectField
                  label="Academic Year"
                  options={academicYearsData.map((ay) => ({ value: String(ay.id), label: ay.name }))}
                  value={String(bulkFilters.academicYearId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, academicYearId: val }))}
                />
                <SelectField
                  label="Class"
                  options={modalClassOptions}
                  value={String(bulkFilters.classId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, classId: val }))}
                />
                <SelectField
                  label="Section"
                  options={bulkSectionOptions}
                  value={bulkFilters.sectionId ? String(bulkFilters.sectionId) : '__all__'}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, sectionId: val || '__all__' }))}
                />
                <SearchableSingleSelect
                  label="Student"
                  options={bulkStudentOptions}
                  value={String(bulkFilters.studentId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, studentId: val }))}
                  placeholder={bulkFilters.classId ? 'Select student' : 'Select class first'}
                  disabled={!bulkFilters.classId || bulkFilters.classId === '__all__'}
                />
                <SelectField
                  label="Month"
                  options={MONTH_OPTS}
                  value={String(bulkFilters.month || currentMonth)}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, month: val }))}
                />
              </>
            )}

            {bulkDownloadMode === 'class' && (
              <>
                <SelectField
                  label="Academic Year"
                  options={academicYearsData.map((ay) => ({ value: String(ay.id), label: ay.name }))}
                  value={String(bulkFilters.academicYearId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, academicYearId: val }))}
                />
                <SelectField
                  label="Class"
                  options={modalClassOptions}
                  value={String(bulkFilters.classId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, classId: val }))}
                />
                <SelectField
                  label="Section"
                  options={bulkSectionOptions}
                  value={bulkFilters.sectionId ? String(bulkFilters.sectionId) : '__all__'}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, sectionId: val || '__all__' }))}
                />
                <SelectField
                  label="Month"
                  options={MONTH_OPTS}
                  value={String(bulkFilters.month || currentMonth)}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, month: val }))}
                />
              </>
            )}

            {bulkDownloadMode === 'institute' && (
              <>
                <SelectField
                  label="Academic Year"
                  options={academicYearsData.map((ay) => ({ value: String(ay.id), label: ay.name }))}
                  value={String(bulkFilters.academicYearId || '')}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, academicYearId: val }))}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Class</label>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">All Classes</div>
                </div>
                <SelectField
                  label="Month"
                  options={MONTH_OPTS}
                  value={String(bulkFilters.month || currentMonth)}
                  onChange={(val) => setBulkFilters((prev) => ({ ...prev, month: val }))}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              {bulkDownloadMode === 'student' && 'Downloads all vouchers for the selected student in the selected academic year.'}
              {bulkDownloadMode === 'class' && 'Downloads vouchers for the selected class and section for the selected month.'}
              {bulkDownloadMode === 'institute' && 'Downloads vouchers for all classes and sections for the selected month.'}
            </p>
            {bulkDownloading && bulkDownloadProgress.total > 0 && (
              <p>
                Generating {bulkDownloadProgress.current}/{bulkDownloadProgress.total}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkDownloadOpen(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={bulkDownloading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {bulkDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </AppModal>

      {/* Mark as Paid Confirmation */}
      <ConfirmDialog
        open={!!markingAsPaid}
        onClose={() => setMarkingAsPaid(null)}
        onConfirm={() => markAsPaidMutation.mutate(markingAsPaid)}
        loading={markAsPaidMutation.isPending}
        title="Mark Voucher as Paid"
        description="This will update the voucher status to paid."
        confirmLabel="Mark as Paid"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingVoucher}
        onClose={() => setDeletingVoucher(null)}
        onConfirm={() => deleteVoucher.mutate(deletingVoucher.id)}
        loading={deleteVoucher.isPending}
        title="Delete Voucher"
        description={`Delete voucher ${deletingVoucher?.voucher_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Record Payment Modal */}
      <AppModal open={!!recordingPayment} onClose={() => setRecordingPayment(null)} title={`Record Payment - ${recordingPayment?.voucherNumber}`} size="md">
        {recordingPayment && (
          <div className="space-y-4">
            {/* Amount Info */}
            <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Net Amount</p>
                <p className="font-bold text-lg text-blue-600">PKR {(Number(recordingPayment.net_amount || recordingPayment.netAmount || 0)).toLocaleString('en-PK')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-orange-600">Pending Outstanding</p>
                <p className="font-bold text-lg text-orange-600">PKR {(Number(recordingPayment.pending_amount ?? (recordingPayment.net_amount || recordingPayment.netAmount || 0))).toLocaleString('en-PK')}</p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold flex justify-between">
                  <span>Payment Amount *</span>
                  <span className="text-xs text-muted-foreground">Max: PKR {(Number(recordingPayment.pending_amount ?? (recordingPayment.net_amount || recordingPayment.netAmount || 0))).toLocaleString('en-PK')}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={Number(recordingPayment.pending_amount ?? (recordingPayment.net_amount || recordingPayment.netAmount || 0))}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    const max = Number(recordingPayment.pending_amount ?? (recordingPayment.net_amount || recordingPayment.netAmount || 0));
                    if (parseFloat(val) > max) {
                      setPaymentForm({ ...paymentForm, amount: String(max.toFixed(2)) });
                      toast.warning(`Amount capped at outstanding balance: PKR ${max.toFixed(2)}`);
                    } else {
                      setPaymentForm({ ...paymentForm, amount: val });
                    }
                  }}
                  placeholder="Enter payment amount"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <SelectField
                label="Payment Method"
                required
                options={PAYMENT_METHOD_OPTS}
                value={paymentForm.method}
                onChange={(val) => setPaymentForm({ ...paymentForm, method: val })}
              />

              <div>
                <label className="text-sm font-semibold">Reference No. (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.referenceNo}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                  placeholder="e.g., Check #, Transaction ID"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Remarks (Optional)</label>
                <textarea
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="Additional notes..."
                  rows="2"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <button onClick={() => setRecordingPayment(null)} className="rounded-md border px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleRecordPayment(recordingPayment.id)}
                disabled={recordPaymentMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {recordPaymentMutation.isPending ? '⏳ Recording...' : '💾 Record Payment'}
              </button>
            </div>
          </div>
        )}
      </AppModal>

      {/* Voucher Detail View Modal */}
      <AppModal open={!!viewingVoucher} onClose={() => setViewingVoucher(null)} title="Voucher Details" size="lg">
        {viewingVoucher && (
          <div className="space-y-6">
            {/* Find the freshest version of this voucher from the query data if available */}
            {(() => {
              // Try to find the latest data in our current list
              const freshVoucher = vouchers.find(v => String(v.id) === String(viewingVoucher.id));
              const v = freshVoucher || viewingVoucher;
              
              // Robust field extraction with explicit string/number handling
              const total = Number(v.net_amount ?? v.netAmount ?? v.amount ?? 0);
              const paid = Number(v.paid_amount ?? v.paidAmount ?? 0);
              const remaining = Number(v.pending_amount ?? (total - paid));
              const paymentsList = v.payments || v.FeePayments || [];
              const voucherNo = v.voucher_number || v.voucherNumber || 'N/A';
              const studentName = v.Student ? `${v.Student.first_name} ${v.Student.last_name}` : (v.studentName || 'Unknown Student');
              const regNo = v.Student?.registration_no || v.registrationNo || 'N/A';
              const status = v.status || 'pending';

              const paymentColumns = [
                { header: 'Date', accessor: (row) => row.payment_date ? new Date(row.payment_date).toLocaleDateString() : 'N/A' },
                { header: 'Amount', accessor: (row) => `PKR ${Number(row.amount_paid || row.amount || 0).toLocaleString()}` },
                { header: 'Method', accessor: (row) => <span className="capitalize">{row.payment_method || 'cash'}</span> },
                { header: 'Reference', accessor: (row) => row.reference_no || row.transaction_id || '-' },
                { header: 'Actions', accessor: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => downloadReceipt(row, viewingVoucher)}
                  >
                    <Download size={14} className="mr-1" /> Receipt
                  </Button>
                )},
              ];

              return (
                <>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Voucher #</p>
                      <h3 className="text-2xl font-black text-slate-900">{voucherNo}</h3>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</p>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border", STATUS_COLORS[status])}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Student Information</p>
                      <p className="font-bold text-slate-900 text-lg">{studentName}</p>
                      <p className="text-xs text-slate-500 font-medium">Reg #: {regNo}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Financial Summary</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Net Bill:</span>
                          <span className="font-bold text-slate-300">PKR {total.toLocaleString('en-PK')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-400 font-bold">
                          <span>Total Paid:</span>
                          <span>PKR {paid.toLocaleString('en-PK')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-orange-400 font-black border-t border-slate-700 pt-1.5 mt-1">
                          <span>Outstanding:</span>
                          <span>PKR {remaining.toLocaleString('en-PK')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Breakdown Table */}
                  <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText className="h-3 w-3" /> Notes & Details
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-blue-50">
                          {[
                            { label: 'Student', value: `${studentName} (${regNo})` },
                            { label: 'Fee Category', value: v.fee_type || 'Monthly' },
                            // { label: 'Structure Type', value: v.feeTemplate?.name || 'Standard' },
                            { label: 'Base Amount', value: `PKR ${Number(v.amount || 0).toLocaleString()}` },
                            { label: 'Concession Type', value: v.concession_type },
                            { label: 'Concession', value: Number(v.concession_amount) > 0 ? `PKR ${Number(v.concession_amount).toLocaleString()}` : null },
                            { label: 'Concession Detail', value: v.concession_reason },
                            { label: 'Total Amount Due', value: `PKR ${total.toLocaleString()}` },
                            { label: 'Billing Period', value: `${MONTH_OPTS.find(m => String(m.value) === String(v.month))?.label} ${v.year}` },
                            { label: 'Due Date', value: v.dueDate ? new Date(v.dueDate).toLocaleDateString('en-PK') : (v.due_date ? new Date(v.due_date).toLocaleDateString('en-PK') : null) },
                            { label: 'Issue Date', value: v.issuedDate ? new Date(v.issuedDate).toLocaleDateString('en-PK') : null }
                          ].filter(item => {
                            if (!item.value) return false;
                            const val = String(item.value).toLowerCase().trim();
                            return val !== 'none' && val !== 'null' && val !== '' && val !== 'n/a';
                          }).map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2 px-4 font-semibold text-slate-500 w-1/3 bg-slate-50/50">{item.label}</td>
                              <td className="py-2 px-4 text-slate-900 font-bold uppercase">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment History */}
                  {paymentsList.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <div className="h-4 w-1 bg-emerald-500 rounded-full"></div>
                        Payment History
                      </h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {paymentsList.map((payment, idx) => (
                          <div key={payment.id || idx} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Check size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900">PKR {Number(payment.amount_paid || payment.amount || 0).toLocaleString('en-PK')}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{new Date(payment.payment_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })} • {String(payment.payment_method || 'cash').toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right space-y-1 mr-2">
                                {payment.receipt_number && (
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    #{payment.receipt_number}
                                  </p>
                                )}
                                {(payment.transaction_id || payment.reference_no) && (
                                  <span className="text-[9px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200 block shadow-sm">
                                    {payment.transaction_id || payment.reference_no}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => downloadReceipt(payment, v)}
                                title="Download Receipt"
                              >
                                <Download size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingVoucher(null)}>Close</Button>
              <Button 
                onClick={() => handleDownloadVoucher(viewingVoucher)} 
                className="bg-primary text-white flex items-center gap-2 font-bold"
              >
                <Download size={16} /> Download Fee Voucher
              </Button>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}