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
import { classService, academicYearService, studentService } from '@/services';
import { feeVoucherService } from '@/services';
import useInstituteStore from '@/store/instituteStore';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

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
      dueDate: '', // Today's date as default
    }
  });

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
          { academicYearId: confirmData.academicYearId, dueDate }
        );
      } else if (confirmData.mode === 'class') {
        response = await feeVoucherService.generateClass(
          confirmData.classId, 
          month, 
          year,
          { academicYearId: confirmData.academicYearId, dueDate }
        );
      } else if (confirmData.mode === 'institute') {
        response = await feeVoucherService.generateInstitute(
          month, 
          year,
          { academicYearId: confirmData.academicYearId, dueDate }
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
              </div>
              {!selectedClassId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  ℹ️ Please select a class first to see available students.
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
              </div>
            </TabsContent>

            {/* Institute Mode */}
            <TabsContent value="institute" className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  ℹ️ This will generate vouchers for ALL active students in your institute.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Academic Year, Month and Due Date Selection */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
