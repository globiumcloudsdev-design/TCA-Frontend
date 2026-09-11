'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SelectField,
  InputField,
  DatePickerField,
  OperationProgressModal,
} from '@/components/common';
import { classService, academicYearService, studentService, feeTemplateService, feeVoucherService } from '@/services';
import useInstituteStore from '@/store/instituteStore';
import useBranchAccess from '@/hooks/useBranchAccess';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Info,
  Users,
  User,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getActiveAcademicYear } from '@/lib/utils';

// Month options for dropdown
const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Fee type options
const FEE_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly Fee' },
  { value: 'annual', label: 'Annual Fee' },
  { value: 'lab', label: 'Lab Charges' },
  { value: 'admission', label: 'Admission Fee' },
  { value: 'fee_template', label: 'Fee Template' },
];

export default function BulkVoucherGenerator({ instituteId: propInstituteId, onSuccess, onGeneratingChange }) {
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const instituteId = propInstituteId || currentInstitute?.id;
  const { activeBranchId } = useBranchAccess();

  const qc = useQueryClient();
  const [selectedMode, setSelectedMode] = useState('class'); // Default to class mode for non-tech users
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState('processing');
  const [progressResult, setProgressResult] = useState(null);
  const [progressError, setProgressError] = useState('');
  const [activeGenerationMeta, setActiveGenerationMeta] = useState(null);

  useEffect(() => {
    onGeneratingChange?.(submitting || (showProgressModal && progressStatus === 'processing'));
  }, [submitting, showProgressModal, progressStatus, onGeneratingChange]);

  // Default due date: 10th of current month (or +10 days)
  const defaultDueDate = (() => {
    const d = new Date();
    d.setDate(10);
    if (d < new Date()) {
      d.setDate(new Date().getDate() + 10);
    }
    return d.toISOString().split('T')[0];
  })();

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      mode: 'class',
      studentId: '',
      classId: '',
      academicYearId: '',
      month: String(new Date().getMonth() + 1),
      dueDate: defaultDueDate,
      feeTemplateId: '',
      feeType: 'monthly',
    }
  });

  // Fetch fee templates
  const { data: feeTemplates = [] } = useQuery({
    queryKey: ['fee-templates', instituteId],
    queryFn: async () => {
      try {
        const response = await feeTemplateService.getOptions({
          institute_id: instituteId,
          is_active: true
        });
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch fee templates:', error);
        return [];
      }
    },
    enabled: !!instituteId
  });

  const selectedTemplateId = watch('feeTemplateId');
  const selectedFeeType = watch('feeType');
  const selectedTemplate = Array.isArray(feeTemplates) ? feeTemplates.find(t => t.value === selectedTemplateId) : null;

  // Auto-lock fee type to fee_template whenever a fee template is selected.
  useEffect(() => {
    if (selectedTemplateId) {
      setValue('feeType', 'fee_template', { shouldDirty: true });
      return;
    }

    if (selectedFeeType === 'fee_template') {
      setValue('feeType', 'monthly', { shouldDirty: true });
    }
  }, [selectedTemplateId, selectedFeeType, setValue]);

  // Fetch academic years
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years', instituteId, activeBranchId],
    queryFn: async () => {
      try {
        const response = await academicYearService.getAll({
          institute_id: instituteId,
          branch_id: activeBranchId,
          is_active: true,
          limit: 1000
        });
        return response.data?.rows || response.data || [];
      } catch (error) {
        console.error('Failed to fetch academic years:', error);
        return [];
      }
    },
    enabled: !!instituteId
  });

  // Auto-select active academic year
  useEffect(() => {
    if (Array.isArray(academicYears) && academicYears.length > 0 && !watch('academicYearId')) {
      const currentAcademicYear = getActiveAcademicYear(academicYears);
      if (currentAcademicYear) {
        setValue('academicYearId', currentAcademicYear.id);
      } else if (academicYears[0]?.id) {
        setValue('academicYearId', academicYears[0].id);
      }
    }
  }, [academicYears, setValue, watch]);

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes-voucher', instituteId],
    queryFn: async () => {
      try {
        const response = await classService.getAll({
          institute_id: instituteId,
          limit: 1000
        });
        return response.data?.rows || response.data || [];
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        return [];
      }
    },
    enabled: !!instituteId
  });

  const classOptions = Array.isArray(classes) ? classes.map(c => ({ value: c.id, label: c.name })) : [];
  const academicYearOptions = Array.isArray(academicYears) ? academicYears.map(ay => ({ value: ay.id, label: ay.name })) : [];

  const selectedClassId = watch('classId');
  const selectedStudentId = watch('studentId');

  // Fetch students for selected class
  const { data: classStudents = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-by-class', selectedClassId, instituteId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      try {
        const response = await studentService.getAll({
          class_id: selectedClassId,
          institute_id: instituteId,
          is_active: true,
          limit: 1000
        });
        return response.data?.rows || response.data || [];
      } catch (error) {
        console.error('Failed to fetch students:', error);
        return [];
      }
    },
    enabled: !!selectedClassId && !!instituteId
  });

  const studentOptions = Array.isArray(classStudents) ? classStudents.map(s => ({
    value: s.id,
    label: `${s.first_name || ''} ${s.last_name || ''} (${s.registration_no || 'N/A'})`
  })) : [];

  const selectedStudent = Array.isArray(classStudents) ? classStudents.find(s => String(s.id) === String(selectedStudentId)) : null;

  // Unpaid vouchers for single student
  const { data: studentUnpaidVouchers = [] } = useQuery({
    queryKey: ['student-unpaid-vouchers-gen', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      try {
        const vouchers = await studentService.getUnpaidVouchers(selectedStudentId);
        return vouchers || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!selectedStudentId && selectedMode === 'single'
  });

  const studentBaseMonthlyFee = Number(selectedStudent?.monthly_fee || selectedStudent?.monthlyFee || 0);
  const concessionType = selectedStudent?.concession_type || selectedStudent?.discount_type;
  const concessionPercentage = Number(selectedStudent?.concession_percentage || 0);
  const concessionAmount = concessionType === 'percentage' && concessionPercentage > 0
    ? (studentBaseMonthlyFee * concessionPercentage / 100)
    : Number(selectedStudent?.concession_amount || selectedStudent?.discount || 0);
  const previousArrears = (studentUnpaidVouchers || []).reduce(
    (sum, v) => sum + Number(v.pending_amount ?? (v.net_amount || v.amount || 0)),
    0
  );

  // Directly start generation smoothly without double modal prompt
  const handleGenerateClick = async (formData) => {
    if (selectedMode === 'single' && (!formData.studentId || !formData.classId)) {
      toast.error('Please select both a class and a student');
      return;
    }
    if (selectedMode === 'class' && !formData.classId) {
      toast.error('Please select a class');
      return;
    }
    if (!formData.academicYearId) {
      toast.error('Please select an academic year');
      return;
    }
    if (!formData.month) {
      toast.error('Please select a month');
      return;
    }

    const dueDate = formData.dueDate || defaultDueDate;
    const genPayload = {
      ...formData,
      mode: selectedMode,
      dueDate
    };

    setActiveGenerationMeta(genPayload);
    setShowProgressModal(true);
    setProgressStatus('processing');
    setProgressError('');
    setProgressResult(null);
    setSubmitting(true);

    try {
      const academicYear = Array.isArray(academicYears) ? academicYears.find(ay => ay.id === genPayload.academicYearId) : null;
      if (!academicYear) {
        throw new Error('Academic year not found');
      }

      const month = parseInt(genPayload.month, 10);
      const currentCalendarYear = new Date().getFullYear();
      let year = currentCalendarYear;
      if (academicYear.start_year && academicYear.end_year) {
        year = month >= 6 ? (academicYear.start_year || currentCalendarYear) : (academicYear.end_year || currentCalendarYear);
      } else {
        year = academicYear.start_year || academicYear.end_year || currentCalendarYear;
      }

      let response;

      if (genPayload.mode === 'single') {
        response = await feeVoucherService.generateSingle(
          genPayload.studentId,
          month,
          year,
          {
            academicYearId: genPayload.academicYearId,
            dueDate,
            feeType: genPayload.feeType,
            feeTemplateId: genPayload.feeTemplateId || undefined,
            baseAmount: selectedTemplate ? Number(selectedTemplate.total_amount || 0) : studentBaseMonthlyFee,
            monthly_fee: studentBaseMonthlyFee,
            discount: concessionAmount,
            arrears: previousArrears,
          }
        );
      } else if (genPayload.mode === 'class') {
        response = await feeVoucherService.generateClass(
          genPayload.classId,
          month,
          year,
          {
            academicYearId: genPayload.academicYearId,
            dueDate,
            feeType: genPayload.feeType,
            feeTemplateId: genPayload.feeTemplateId || undefined
          }
        );
      } else if (genPayload.mode === 'institute') {
        response = await feeVoucherService.generateInstitute(
          month,
          year,
          {
            academicYearId: genPayload.academicYearId,
            dueDate,
            feeType: genPayload.feeType,
            feeTemplateId: genPayload.feeTemplateId || undefined
          }
        );
      }

      const resData = response?.data || response;
      const count = resData?.generated ?? resData?.total ?? resData?.count ?? (genPayload.mode === 'single' ? 1 : 0);

      setProgressResult({
        total: count,
        generated: count,
      });
      setProgressStatus('success');
      setResult(response);
      toast.success(response?.message || 'Vouchers generated successfully!');

      qc.invalidateQueries({ queryKey: ['fee-vouchers'] });
      qc.invalidateQueries({ queryKey: ['fees'] });
      qc.invalidateQueries({ queryKey: ['student-vouchers'] });
      qc.invalidateQueries({ queryKey: ['student-unpaid-vouchers'] });
      qc.invalidateQueries({ queryKey: ['student-unpaid-vouchers-gen'] });
      qc.invalidateQueries({ queryKey: ['student-stats'] });
      reset();
    } catch (error) {
      console.error('Generation error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to generate vouchers';
      setProgressStatus('error');
      setProgressError(errMsg);
      toast.error(errMsg);
      setResult({
        error: errMsg,
        generated: 0,
        failed: 0,
        total: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Result Card if any */}
      {result && !submitting && !showProgressModal && (
        <div className={`p-4 rounded-xl border ${result.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-start gap-3">
            {result.error ? (
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div className="flex-1">
              <h3 className={`font-bold text-sm ${result.error ? 'text-red-800' : 'text-green-800'}`}>
                {result.error ? 'Generation Failed' : 'Vouchers Generated Successfully!'}
              </h3>
              {result.error && <p className="text-xs text-red-700 mt-1">{result.error}</p>}
              {!result.error && (
                <p className="text-xs text-green-700 mt-1">
                  Vouchers are ready. You can print them or collect payments in the Fee Management table.
                </p>
              )}
              <button
                type="button"
                onClick={() => setResult(null)}
                className="mt-2 text-xs font-semibold px-2.5 py-1 rounded bg-white/80 hover:bg-white text-slate-700 border"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleGenerateClick)} className="space-y-5">
        {/* Mode Selector Tabs */}
        <Tabs value={selectedMode} onValueChange={setSelectedMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-100 rounded-xl">
            <TabsTrigger
              value="class"
              className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span>By Class</span>
            </TabsTrigger>
            <TabsTrigger
              value="single"
              className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <User className="h-4 w-4 text-emerald-600" />
              <span>Single Student</span>
            </TabsTrigger>
            <TabsTrigger
              value="institute"
              className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm"
            >
              <Building className="h-4 w-4 text-purple-600" />
              <span>All Students</span>
            </TabsTrigger>
          </TabsList>

          {/* Mode 1: By Class */}
          <TabsContent value="class" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="classId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Select Class *"
                    options={classOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.classId}
                    placeholder="Choose class (e.g. Class 1, Class 9)..."
                  />
                )}
              />

              <Controller
                name="feeTemplateId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Fee Template (Optional)"
                    options={feeTemplates}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Apply a Fee Template (or use monthly fee)..."
                  />
                )}
              />
            </div>
          </TabsContent>

          {/* Mode 2: Single Student */}
          <TabsContent value="single" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="classId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Select Class *"
                    options={classOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.classId}
                    placeholder="Choose a class..."
                  />
                )}
              />

              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={isLoadingStudents ? 'Loading Students...' : 'Select Student *'}
                    options={studentOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.studentId}
                    placeholder={!selectedClassId ? 'Select a class first...' : 'Choose student...'}
                    disabled={!selectedClassId || isLoadingStudents}
                  />
                )}
              />

              <Controller
                name="feeTemplateId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Fee Template (Optional)"
                    options={feeTemplates}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Choose fee template..."
                  />
                )}
              />
            </div>
          </TabsContent>

          {/* Mode 3: Entire Institute */}
          <TabsContent value="institute" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 gap-4">
              <Controller
                name="feeTemplateId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Fee Template (Optional)"
                    options={feeTemplates}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Apply a Fee Template to all students..."
                  />
                )}
              />
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs text-purple-900 font-medium">
              <Info size={16} className="text-purple-600 flex-shrink-0" />
              <span>This will generate fee vouchers for all active students across the entire institution.</span>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Fee Template Preview Badge */}
        {selectedTemplate && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-sm text-blue-950">Applied Template: {selectedTemplate.label}</h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                PKR {Number(selectedTemplate.total_amount || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Vouchers will be created using this template&apos;s components (Total: PKR {Number(selectedTemplate.total_amount || 0).toLocaleString()}). Student concessions and prior balances will also be calculated automatically.
            </p>
          </div>
        )}

        {/* Scheduling Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <Controller
            name="academicYearId"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Academic Year *"
                options={academicYearOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.academicYearId}
                placeholder="Select year..."
              />
            )}
          />

          <Controller
            name="feeType"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Fee Type *"
                options={FEE_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.feeType}
                placeholder="Select type..."
                disabled={!!selectedTemplateId}
              />
            )}
          />

          <Controller
            name="month"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Billing Month *"
                options={MONTH_OPTIONS}
                value={String(field.value)}
                onChange={field.onChange}
                error={errors.month}
                placeholder="Select month..."
              />
            )}
          />

          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DatePickerField
                label="Due Date *"
                name="dueDate"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select due date"
                error={errors.dueDate}
                disablePastDates={false}
                required={true}
              />
            )}
          />
        </div>

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full py-6 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Vouchers...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Generate Fee Vouchers Now
            </>
          )}
        </Button>
      </form>

      {/* Operation Progress Modal */}
      <OperationProgressModal
        open={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          if (progressStatus === 'success') {
            onSuccess?.();
          }
        }}
        type="voucher"
        title="Generating Fee Vouchers"
        subtitle={`Generating vouchers for ${activeGenerationMeta?.mode === 'single' ? 'single student' : activeGenerationMeta?.mode === 'class' ? 'selected class' : 'all students'} (${MONTH_OPTIONS.find(m => m.value === parseInt(activeGenerationMeta?.month))?.label || ''})`}
        estimatedSeconds={activeGenerationMeta?.mode === 'single' ? 3 : activeGenerationMeta?.mode === 'class' ? 5 : 10}
        status={progressStatus}
        statusMessage="Fee vouchers have been generated successfully and recorded in the fee ledger."
        errorMessage={progressError}
        result={progressResult}
        onDone={() => {
          setShowProgressModal(false);
          onSuccess?.();
        }}
        doneText="View Generated Vouchers"
      />
    </div>
  );
}
