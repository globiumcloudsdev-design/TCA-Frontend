'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SelectField,
  InputField,
  FormSubmitButton,
  DatePickerField,
  ConfirmDialog
} from '@/components/common';
import { classService, academicYearService, studentService, feeTemplateService } from '@/services';
import { feeVoucherService } from '@/services';
import useInstituteStore from '@/store/instituteStore';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertTriangle, DollarSign, Info } from 'lucide-react';

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

export default function BulkVoucherGenerator({ instituteId: propInstituteId, onSuccess }) {
  const currentInstitute = useInstituteStore((s) => s.currentInstitute);
  const instituteId = propInstituteId || currentInstitute?.id;
  
  const [selectedMode, setSelectedMode] = useState('single');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [result, setResult] = useState(null);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      mode: 'single',
      studentId: '',
      classId: '',
      academicYearId: '',
      month: String(new Date().getMonth() + 1),
      dueDate: '',
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
  const selectedTemplate = feeTemplates.find(t => t.value === selectedTemplateId);

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
    queryKey: ['academic-years', instituteId],
    queryFn: async () => {
      try {
        const response = await academicYearService.getAll({ 
          institute_id: instituteId, 
          is_active: true,
          limit: 1000  // Fetch all for dropdown
        });
        return response.data?.rows || response.data || [];
      } catch (error) {
        console.error('Failed to fetch academic years:', error);
        return [];
      }
    },
    enabled: !!instituteId
  });

  // Auto-select current academic year using useEffect (NOT during render)
  useEffect(() => {
    if (academicYears.length > 0 && !watch('academicYearId')) {
      const currentAcademicYear = academicYears.find(ay => ay.is_current) || academicYears[0];
      if (currentAcademicYear) {
        setValue('academicYearId', currentAcademicYear.id);
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
          limit: 1000  // Fetch all for dropdown
        });
        return response.data?.rows || response.data || [];
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        return [];
      }
    },
    enabled: !!instituteId
  });

  const classOptions = classes.map(c => ({ value: c.id, label: c.name }));
  const academicYearOptions = academicYears.map(ay => ({ value: ay.id, label: ay.name }));

  // Get selected values
  const selectedClassId = watch('classId');
  const selectedStudentId = watch('studentId');
  
  // Fetch students for selected class using studentService
  const { data: classStudents = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-by-class', selectedClassId, instituteId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      try {
        const response = await studentService.getAll({ 
          class_id: selectedClassId,
          institute_id: instituteId,
          is_active: true,
          limit: 1000  // Fetch all for dropdown
        });
        const students = response.data?.rows || response.data || [];
        console.log('Fetched students:', students);
        return students;
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to fetch students for selected class');
        return [];
      }
    },
    enabled: !!selectedClassId && !!instituteId
  });

  const studentOptions = classStudents.map(s => ({
    value: s.id,
    label: `${s.first_name || ''} ${s.last_name || ''} (${s.registration_no || 'N/A'})`
  }));

  const handleGenerateClick = (data) => {
    // Validate based on mode
    if (selectedMode === 'single' && (!data.studentId || !data.classId)) {
      toast.error('Please select both class and student');
      return;
    }
    if (selectedMode === 'class' && !data.classId) {
      toast.error('Please select a class');
      return;
    }
    if (!data.academicYearId) {
      toast.error('Please select an academic year');
      return;
    }
    if (!data.month) {
      toast.error('Please select a month');
      return;
    }

    setConfirmData({ ...data, mode: selectedMode });
    setShowConfirm(true);
  };

  const handleConfirmGenerate = async () => {
    if (!confirmData || !instituteId) {
      toast.error('Institute information is missing');
      return;
    }

    if (!confirmData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    setSubmitting(true);
    try {
      const academicYear = academicYears.find(ay => ay.id === confirmData.academicYearId);
      if (!academicYear) {
        throw new Error('Academic year not found');
      }

      const month = parseInt(confirmData.month, 10);
      const year = academicYear.end_year || new Date().getFullYear();
      const dueDate = confirmData.dueDate; // Use the selected due date from DatePickerField

      let response;

      if (confirmData.mode === 'single') {
        response = await feeVoucherService.generateSingle(
          confirmData.studentId, 
          month, 
          year,
          { 
            academicYearId: confirmData.academicYearId, 
            dueDate,
            feeType: confirmData.feeType,
            feeTemplateId: confirmData.feeTemplateId || undefined
          }
        );
      } else if (confirmData.mode === 'class') {
        response = await feeVoucherService.generateClass(
          confirmData.classId, 
          month, 
          year,
          { 
            academicYearId: confirmData.academicYearId, 
            dueDate,
            feeType: confirmData.feeType,
            feeTemplateId: confirmData.feeTemplateId || undefined
          }
        );
      } else if (confirmData.mode === 'institute') {
        response = await feeVoucherService.generateInstitute(
          month, 
          year,
          { 
            academicYearId: confirmData.academicYearId, 
            dueDate,
            feeType: confirmData.feeType,
            feeTemplateId: confirmData.feeTemplateId || undefined
          }
        );
      }

      setResult(response);
      toast.success(response.message || `Vouchers generated successfully!`);
      reset();
      setShowConfirm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to generate vouchers');
      setResult({
        error: error.response?.data?.message || error.message,
        generated: 0,
        failed: 0,
        total: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Fee Voucher Generator</CardTitle>
        <CardDescription>Generate fee vouchers for students with automatic concession calculation</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Result Display */}
        {result && !submitting && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${result.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-start gap-3">
              {result.error ? (
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${result.error ? 'text-red-800' : 'text-green-800'}`}>
                  {result.error ? 'Generation Failed' : 'Vouchers Generated Successfully!'}
                </h3>
                {result.error && <p className="text-sm text-red-700 mt-1">{result.error}</p>}
                {!result.error && (
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-gray-600">Total</p>
                      <p className="font-bold text-lg text-gray-800">{result.total || 0}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-gray-600">Generated</p>
                      <p className="font-bold text-lg text-green-700">{result.generated || 0}</p>
                    </div>
                    {result.failed > 0 && (
                      <>
                        <div className="bg-white/50 p-2 rounded">
                          <p className="text-gray-600">Failed</p>
                          <p className="font-bold text-lg text-red-700">{result.failed}</p>
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-bold text-lg text-blue-700">{((result.generated / result.total) * 100).toFixed(1)}%</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button 
                  onClick={() => setResult(null)}
                  className="mt-3 text-sm font-medium px-3 py-1 rounded bg-white/50 hover:bg-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(handleGenerateClick)}>
          <Tabs value={selectedMode} onValueChange={setSelectedMode} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Student</TabsTrigger>
              <TabsTrigger value="class">By Class</TabsTrigger>
              <TabsTrigger value="institute">Entire Institute</TabsTrigger>
            </TabsList>

            {/* Single Student Mode */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Select Class"
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
                      label={isLoadingStudents ? "Loading Students..." : "Select Student"}
                      options={studentOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.studentId}
                      placeholder={!selectedClassId ? "Select a class first..." : "Choose a student..."}
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
                      placeholder="Choose a fee template..."
                    />
                  )}
                />
              </div>

              {/* Fee Template Breakdown Preview */}
              {selectedTemplate && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Fee Template: {selectedTemplate.label}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Total Amount</p>
                      <p className="font-bold text-lg text-blue-600">PKR {selectedTemplate.total_amount?.toLocaleString('en-PK') || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Fee Basis</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedTemplate.fee_basis || 'N/A'}</p>
                    </div>
                    {selectedTemplate.is_default && (
                      <div className="bg-green-100 p-3 rounded text-green-700 text-xs font-semibold col-span-2 flex items-center gap-2">
                        <CheckCircle size={14} /> Default Template
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedClassId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
                  <Info size={16} /> Please select a class first to see available students.
                </div>
              )}
            </TabsContent>

            {/* Class Mode */}
            <TabsContent value="class" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Select Class"
                      options={classOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.classId}
                      placeholder="Choose a class..."
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
                      placeholder="Choose a fee template..."
                    />
                  )}
                />
              </div>

              {/* Fee Template Breakdown Preview */}
              {selectedTemplate && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Fee Template: {selectedTemplate.label}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Total Amount</p>
                      <p className="font-bold text-lg text-blue-600">PKR {selectedTemplate.total_amount?.toLocaleString('en-PK') || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Fee Basis</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedTemplate.fee_basis || 'N/A'}</p>
                    </div>
                    {selectedTemplate.is_default && (
                      <div className="bg-green-100 p-3 rounded text-green-700 text-xs font-semibold col-span-2 flex items-center gap-2">
                        <CheckCircle size={14} /> Default Template
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Institute Mode */}
            <TabsContent value="institute" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <Controller
                  name="feeTemplateId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Fee Template (Optional)"
                      options={feeTemplates}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose a fee template..."
                    />
                  )}
                />
              </div>

              {/* Fee Template Breakdown Preview */}
              {selectedTemplate && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Fee Template: {selectedTemplate.label}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Total Amount</p>
                      <p className="font-bold text-lg text-blue-600">PKR {selectedTemplate.total_amount?.toLocaleString('en-PK') || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-muted-foreground text-xs font-semibold">Fee Basis</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedTemplate.fee_basis || 'N/A'}</p>
                    </div>
                    {selectedTemplate.is_default && (
                      <div className="bg-green-100 p-3 rounded text-green-700 text-xs font-semibold col-span-2 flex items-center gap-2">
                        <CheckCircle size={14} /> Default Template
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">
                  ℹ️ This will generate vouchers for ALL active students in your institute.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Academic Year, Month, Fee Type and Due Date Selection */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Controller
              name="academicYearId"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Academic Year"
                  options={academicYearOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.academicYearId}
                  placeholder="Select academic year..."
                />
              )}
            />
            <Controller
              name="feeType"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Fee Type"
                  options={FEE_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.feeType}
                  placeholder="Select fee type..."
                  disabled={!!selectedTemplateId}
                />
              )}
            />
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Month"
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
                  label="Due Date"
                  name="dueDate"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select due date"
                  error={errors.dueDate}
                  disablePastDates={true}
                  required={true}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Vouchers'
            )}
          </Button>
        </form>
      </CardContent>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm && !!confirmData}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmGenerate}
        loading={submitting}
        title="Confirm Voucher Generation"
        description={`Generate vouchers for ${confirmData?.mode === 'single' ? 'single student' : confirmData?.mode === 'class' ? 'all students in class' : 'entire institute'} in ${MONTH_OPTIONS.find(m => m.value === parseInt(confirmData?.month))?.label}?`}
        confirmLabel="Generate"
      />
    </Card>
  );
}
