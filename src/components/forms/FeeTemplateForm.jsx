// src/components/forms/FeeTemplateForm.jsx
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SelectField,
  TextareaField,
  SwitchField,
  FormSubmitButton,
  BranchSelectField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Coins,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info,
  BadgePercent,
  Calculator,
  Layers
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, getActiveAcademicYear } from '@/lib/utils';
import useInstituteStore from '@/store/instituteStore';
import { toast } from 'sonner';

// Fee basis options in clear English
const FEE_BASIS_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (Every 3 Months)' },
  { value: 'half_yearly', label: 'Half Yearly (Every 6 Months)' },
  { value: 'annually', label: 'Annually (Yearly)' },
  { value: 'one_time', label: 'One Time' }
];

// Component schema - simplified for non-tech users with sensible defaults
const componentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Fee item name is required'),
  type: z.enum(['fee', 'discount']).default('fee'),
  amount_type: z.enum(['fixed', 'percentage']).default('fixed'),
  amount_value: z.coerce
    .number()
    .min(0, 'Amount cannot be negative')
    .max(9999999, 'Amount is too high'),
  discount_type: z.enum(['fixed', 'percentage']).optional(),
  discount_value: z.coerce.number().min(0).optional().default(0),
  description: z.string().optional(),
  applicable_on: z.enum(['base', 'subtotal', 'total']).default('base')
});

const feeTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters (e.g. Class 1 Fee)'),
  code: z.string().optional(),
  description: z.string().optional(),
  branch_id: z.string().optional().nullable(),
  academic_year_id: z.string().min(1, 'Please select an Academic Year'),
  fee_basis: z.enum(['monthly', 'quarterly', 'half_yearly', 'annually', 'one_time']).default('monthly'),
  due_day: z.coerce
    .number()
    .min(1, 'Due day must be between 1 and 31')
    .max(31, 'Due day must be between 1 and 31')
    .default(10),
  late_fine_config: z.object({
    enabled: z.boolean().default(false),
    type: z.enum(['fixed', 'percentage']).default('fixed'),
    amount: z.coerce.number().min(0).default(0),
    grace_days: z.coerce.number().min(0).max(30).default(5),
    max_fine: z.coerce.number().min(0).optional().nullable()
  }),
  components: z.array(componentSchema).min(1, 'Please add at least one fee component (e.g. Tuition Fee)'),
  is_active: z.boolean().default(true)
});

// Quick-Add Presets for Schools / Colleges
const QUICK_PRESETS = [
  { name: 'Tuition Fee', amount: 5000, type: 'fee' },
  { name: 'Exam Fee', amount: 1000, type: 'fee' },
  { name: 'Transport Fee', amount: 2000, type: 'fee' },
  { name: 'Computer / Lab Fee', amount: 800, type: 'fee' },
  { name: 'Library Fee', amount: 300, type: 'fee' },
  { name: 'Sports Fee', amount: 500, type: 'fee' },
  { name: 'Admission Fee', amount: 5000, type: 'fee' },
];

export default function FeeTemplateForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  branches = [],
  academicYears = [],
  isEdit = false,
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isMounted, setIsMounted] = useState(false);
  const { hasBranches } = useInstituteStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format initial values
  const getInitialValues = useCallback(() => {
    const initial = {
      name: '',
      code: '',
      description: '',
      branch_id: null,
      academic_year_id: '',
      fee_basis: 'monthly',
      due_day: 10,
      late_fine_config: {
        enabled: false,
        type: 'fixed',
        amount: 0,
        grace_days: 5,
        max_fine: null
      },
      components: [
        {
          id: 'comp-1',
          name: 'Tuition Fee',
          type: 'fee',
          amount_type: 'fixed',
          amount_value: 5000,
          description: '',
          applicable_on: 'base'
        }
      ],
      is_active: true,
      ...defaultValues,
    };

    if (initial.branch_id === '') {
      initial.branch_id = null;
    }

    if (Array.isArray(initial.components) && initial.components.length > 0) {
      initial.components = initial.components.map((c, idx) => ({
        id: c.id || `comp-${idx}`,
        name: c.name || '',
        type: c.type || 'fee',
        amount_type: c.amount_type || 'fixed',
        amount_value: Number(c.amount_value) || 0,
        discount_type: c.discount_type || 'fixed',
        discount_value: Number(c.discount_value) || 0,
        description: c.description || '',
        applicable_on: c.applicable_on || 'base',
      }));
    } else {
      initial.components = [
        {
          id: 'comp-1',
          name: 'Tuition Fee',
          type: 'fee',
          amount_type: 'fixed',
          amount_value: 5000,
          description: '',
          applicable_on: 'base'
        }
      ];
    }

    return initial;
  }, [defaultValues]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(feeTemplateSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange'
  });

  // Reset when defaultValues changes (e.g. edit mode opens)
  useEffect(() => {
    if (defaultValues?.id) {
      reset(getInitialValues());
    }
  }, [defaultValues?.id, getInitialValues, reset]);

  // Auto-select current active academic year if not set
  useEffect(() => {
    const currentYearId = watch('academic_year_id');
    if (academicYears.length > 0 && !currentYearId) {
      const activeYear = getActiveAcademicYear(academicYears);
      if (activeYear && activeYear.value) {
        setValue('academic_year_id', String(activeYear.value), { shouldValidate: true });
      } else if (academicYears[0]?.value) {
        setValue('academic_year_id', String(academicYears[0].value), { shouldValidate: true });
      }
    }
  }, [academicYears, setValue, watch]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'components'
  });

  const components = watch('components') || [];
  const lateFineEnabled = watch('late_fine_config.enabled');

  // Real-time live total calculation
  const totals = useMemo(() => {
    let baseTotal = 0;
    let totalDiscount = 0;

    (components || []).forEach((comp) => {
      const amt = Number(comp?.amount_value) || 0;
      if (comp?.type === 'fee') {
        baseTotal += amt;
      } else if (comp?.type === 'discount') {
        totalDiscount += amt;
      }
    });

    const finalTotal = Math.max(0, baseTotal - totalDiscount);

    return {
      baseTotal,
      totalDiscount,
      finalTotal,
      componentCount: components.length
    };
  }, [components]);

  // Quick add preset handler
  const handleAddPreset = (preset) => {
    append({
      id: `comp-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      amount_type: 'fixed',
      amount_value: preset.amount,
      discount_type: 'fixed',
      discount_value: 0,
      description: '',
      applicable_on: 'base'
    });
    toast.success(`Added ${preset.name}`);
  };

  // Add blank custom fee item
  const handleAddCustomFee = () => {
    append({
      id: `comp-${Date.now()}`,
      name: '',
      type: 'fee',
      amount_type: 'fixed',
      amount_value: 0,
      description: '',
      applicable_on: 'base'
    });
  };

  // Add blank custom discount item
  const handleAddCustomDiscount = () => {
    append({
      id: `comp-${Date.now()}`,
      name: 'Discount / Concession',
      type: 'discount',
      amount_type: 'fixed',
      amount_value: 0,
      description: '',
      applicable_on: 'base'
    });
  };

  // Go to step 2 with validation of step 1
  const handleNextToStep2 = async () => {
    const isStep1Valid = await trigger(['name', 'academic_year_id', 'due_day', 'fee_basis']);
    if (isStep1Valid) {
      setActiveTab('components');
    } else {
      toast.error('Please fill in the required fields in Basic Details');
    }
  };

  // Submit handler
  const onFormSubmit = (data) => {
    const sanitizedPayload = {
      ...data,
      branch_id: data.branch_id || null,
      total_amount: totals.finalTotal,
      calculated_totals: {
        base_total: totals.baseTotal,
        total_discount: totals.totalDiscount,
        final_total: totals.finalTotal,
        component_count: data.components.length,
        discount_components: data.components.filter(c => c.type === 'discount').length
      },
      discount_summary: {
        total_fixed_discount: totals.totalDiscount,
        total_percentage_discount: 0,
        final_discount: totals.totalDiscount
      }
    };

    onSubmit(sanitizedPayload);
  };

  const onFormError = (errs) => {
    if (errs.name || errs.academic_year_id || errs.due_day) {
      setActiveTab('basic');
      toast.error('Please check required fields in Basic Details');
    } else if (errs.components) {
      setActiveTab('components');
      toast.error(errs.components?.message || 'Please add at least one fee component');
    }
  };

  if (!isMounted) return null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-5">
      {/* Visual Step Tabs Header */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/80 rounded-xl">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-sm"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <span>1. Basic Details</span>
            {(errors.name || errors.academic_year_id || errors.due_day) && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="components"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-sm"
          >
            <Coins className="h-4 w-4 text-emerald-600" />
            <span>2. Fee Amounts</span>
            <Badge variant="secondary" className="ml-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
              PKR {totals.finalTotal.toLocaleString()}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================== */}
        {/* TAB 1: BASIC DETAILS                                                 */}
        {/* ==================================================================== */}
        <TabsContent value="basic" className="space-y-4 pt-2">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 text-slate-800">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm">Fee Structure Information</h3>
              </div>

              {/* Template Name */}
              <InputField
                label="Template Name *"
                name="name"
                control={control}
                error={errors.name}
                required
                placeholder="e.g. Class 1 Monthly Fee, Matric Regular, etc."
                hint="A friendly name so you can easily identify this fee structure."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fee Basis */}
                <SelectField
                  label="Fee Frequency *"
                  name="fee_basis"
                  control={control}
                  error={errors.fee_basis}
                  options={FEE_BASIS_OPTIONS}
                  placeholder="Select frequency"
                  hint="How often is this fee charged? (Usually Monthly)"
                />

                {/* Due Day of Month */}
                <InputField
                  label="Due Day of Month *"
                  name="due_day"
                  control={control}
                  error={errors.due_day}
                  type="number"
                  min={1}
                  max={31}
                  placeholder="10"
                  hint="Day of each month fee is due (e.g. 10th of every month)."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Year */}
                <SelectField
                  label="Academic Year *"
                  name="academic_year_id"
                  control={control}
                  error={errors.academic_year_id}
                  options={[
                    { value: '', label: 'Select Academic Year' },
                    ...academicYears.map((ay) => ({ value: ay.value, label: ay.label }))
                  ]}
                  placeholder="Select Academic Year"
                  hint="Fee will apply to this academic session."
                />

                {/* Branch Selection (if branches exist) */}
                {hasBranches() ? (
                  <BranchSelectField
                    control={control}
                    error={errors.branch_id}
                    setValue={setValue}
                    watch={watch}
                    required={false}
                    branches={branches}
                    placeholder="All Branches"
                    hint="Leave blank if fee applies to all branches."
                  />
                ) : (
                  <InputField
                    label="Template Code (Optional)"
                    name="code"
                    control={control}
                    placeholder="e.g. CLS1-2026 (Auto-generated if empty)"
                    hint="Optional short code for accounting."
                  />
                )}
              </div>

              {/* Optional Description */}
              <TextareaField
                label="Notes / Description (Optional)"
                name="description"
                control={control}
                rows={2}
                placeholder="Any special instructions or details about this fee template..."
              />
            </CardContent>
          </Card>

          {/* Late Fine Box - Simple and Optional */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-slate-800">Late Fee Fine (Optional)</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Automatically add a penalty amount if fee is paid after the due date.
                  </p>
                </div>

                <SwitchField
                  name="late_fine_config.enabled"
                  control={control}
                  label=""
                />
              </div>

              {lateFineEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <InputField
                    label="Late Fine Amount (PKR)"
                    name="late_fine_config.amount"
                    control={control}
                    type="number"
                    min={0}
                    placeholder="e.g. 100"
                    hint="Fixed fine amount added after due date."
                  />
                  <InputField
                    label="Grace Days (Optional)"
                    name="late_fine_config.grace_days"
                    control={control}
                    type="number"
                    min={0}
                    max={30}
                    placeholder="e.g. 5"
                    hint="Extra days allowed after due day before fine is applied."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 1 Next Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleNextToStep2}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-6"
            >
              Next: Set Fee Amounts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* ==================================================================== */}
        {/* TAB 2: FEE AMOUNTS & COMPONENTS                                      */}
        {/* ==================================================================== */}
        <TabsContent value="components" className="space-y-4 pt-2">
          {/* Quick-add presets */}
          <Card className="border-blue-100 bg-blue-50/40 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  Quick Add Common Fee Items (Click to add)
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-800 shadow-sm hover:bg-blue-100/80 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-blue-600" />
                    {preset.name} (PKR {preset.amount.toLocaleString()})
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Components List */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-600" />
                    Fee Breakdown Items
                  </h4>
                  <p className="text-xs text-slate-500">
                    Enter the fee items and amounts for this template.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomFee}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Fee Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomDiscount}
                    className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Discount
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
                  <Coins className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No fee items added yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click a quick-add button above or click &quot;Add Fee Item&quot; to enter amounts.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const isDiscount = watch(`components.${index}.type`) === 'discount';

                    return (
                      <div
                        key={field.id}
                        className={cn(
                          'flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl border transition-all',
                          isDiscount
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200 shadow-sm'
                        )}
                      >
                        {/* Type Badge */}
                        <div className="flex-none">
                          <span
                            className={cn(
                              'text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider',
                              isDiscount
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            )}
                          >
                            {isDiscount ? 'Discount (-)' : 'Fee (+)'}
                          </span>
                        </div>

                        {/* Item Name */}
                        <div className="flex-1 w-full">
                          <InputField
                            label=""
                            name={`components.${index}.name`}
                            control={control}
                            error={errors?.components?.[index]?.name}
                            required
                            placeholder={isDiscount ? 'e.g. Scholarship' : 'e.g. Tuition Fee'}
                          />
                        </div>

                        {/* Amount */}
                        <div className="w-full sm:w-44 flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">PKR</span>
                          <InputField
                            label=""
                            name={`components.${index}.amount_value`}
                            control={control}
                            type="number"
                            min={0}
                            error={errors?.components?.[index]?.amount_value}
                            required
                            placeholder="0"
                          />
                        </div>

                        {/* Remove button */}
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-9 w-9 rounded-lg flex-none"
                            title="Remove this item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Calculation Card */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-emerald-400" />
                      Total Payable Fee
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                        PKR {totals.finalTotal.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        / {watch('fee_basis') || 'month'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-700 pt-2 sm:pt-0 sm:pl-4">
                    <div>
                      <p className="text-slate-400">Base Sum</p>
                      <p className="font-bold text-white">PKR {totals.baseTotal.toLocaleString()}</p>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div>
                        <p className="text-slate-400">Discounts</p>
                        <p className="font-bold text-emerald-400">- PKR {totals.totalDiscount.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400">Items</p>
                      <p className="font-bold text-white">{totals.componentCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('basic')}
              className="w-full sm:w-auto flex items-center gap-2 border-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Basic Details
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <FormSubmitButton
                loading={loading}
                label={isEdit ? 'Save Changes' : 'Create Fee Template'}
                loadingLabel={isEdit ? 'Saving...' : 'Creating Template...'}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}