// src/components/forms/FeeTemplateForm.jsx (COMPLETE FIXED)

'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    InputField,
    SelectField,
    TextareaField,
    CheckboxField,      // ✅ Added
    SwitchField,        // ✅ Added
    FormSubmitButton,   // ✅ Added
} from '@/components/common';
import MultiSelectField from '@/components/common/MultiSelectField';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Copy,
    Calculator,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Tag,
    Calendar,
    Clock,
    Loader2,
    FileText,
    Layers,
    BadgePercent,
    CheckCircle2,
    Coins,
    Receipt,
    Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import useInstituteStore from '@/store/instituteStore';
import { toast } from 'sonner';
import { Label } from '../ui/label';

// Constants
const FEE_BASIS_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' },
    { value: 'annually', label: 'Annually' },
    { value: 'one_time', label: 'One Time' }
];

const LATE_FINE_TYPE_OPTIONS = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' }
];

const COMPONENT_TYPE_OPTIONS = [
    { value: 'fee', label: 'Fee Component' },
    { value: 'discount', label: 'Discount Component' }
];

const AMOUNT_TYPE_OPTIONS = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'percentage', label: 'Percentage' }
];

const APPLICABLE_ON_OPTIONS = [
    { value: 'base', label: 'Base Amount' },
    { value: 'subtotal', label: 'Subtotal' },
    { value: 'total', label: 'Total' }
];

// ✅ FIXED: Zod Schema with proper optional fields
const componentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Component name is required'),
    type: z.enum(['fee', 'discount']),
    amount_type: z.enum(['fixed', 'percentage']),
    amount_value: z.coerce.number()
        .min(0, 'Amount must be positive')
        .max(9999999, 'Amount is too high'),
    discount_type: z.enum(['fixed', 'percentage']).optional(),
    discount_value: z.coerce.number()
        .min(0, 'Discount must be positive')
        .max(100, 'Percentage discount cannot exceed 100%')
        .optional(),
    description: z.string().optional(),
    applicable_on: z.enum(['base', 'subtotal', 'total']).default('base')
}).refine((data) => {
    // 1. Check percentage discount on fee component
    if (data.type === 'fee' && data.discount_type === 'percentage' && data.discount_value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount cannot exceed 100%',
    path: ['discount_value']
}).refine((data) => {
    // 2. Check fixed discount on fee component
    if (data.type === 'fee' && data.discount_type === 'fixed' && data.discount_value > data.amount_value) {
        return false;
    }
    return true;
}, {
    message: 'Fixed discount cannot exceed the fee amount',
    path: ['discount_value']
}).refine((data) => {
    // 3. Check percentage on discount component
    if (data.type === 'discount' && data.amount_type === 'percentage' && data.amount_value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage cannot exceed 100%',
    path: ['amount_value']
});

const feeTemplateSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    code: z.string().optional(),
    description: z.string().optional(),

    // ✅ FIX: branch_id properly optional and nullable
    branch_id: z.string().optional().nullable(),

    academic_year_id: z.string().min(1, 'Academic year is required'),
    fee_basis: z.enum(['monthly', 'quarterly', 'half_yearly', 'annually', 'one_time']),
    due_day: z.coerce.number()
        .min(1, 'Day must be between 1-31')
        .max(31, 'Day must be between 1-31'),
    late_fine_config: z.object({
        enabled: z.boolean(),
        type: z.enum(['fixed', 'percentage']),
        amount: z.coerce.number().min(0),
        grace_days: z.coerce.number().min(0).max(30, 'Grace days cannot exceed 30'),
        max_fine: z.coerce.number().min(0).optional().nullable()
    }),
    components: z.array(componentSchema).default([]),
    is_active: z.boolean().default(true)
});

// Component Card Component
const ComponentCard = ({
    index,
    control,
    errors,
    onRemove,
    isRemovable,
    watch,
    setValue
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const type = watch(`components.${index}.type`);
    const discountType = watch(`components.${index}.discount_type`);
    const amountValue = watch(`components.${index}.amount_value`) || 0;
    const discountValue = watch(`components.${index}.discount_value`) || 0;

    // Calculate effective amount after discount
    const effectiveAmount = useMemo(() => {
        if (!discountValue) return amountValue;

        if (discountType === 'percentage') {
            return amountValue - (amountValue * discountValue / 100);
        } else {
            return amountValue - discountValue;
        }
    }, [amountValue, discountValue, discountType]);

    return (
        <Card className={cn(
            "relative border-l-4",
            type === 'fee' ? "border-l-blue-500" : "border-l-green-500"
        )}>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant={type === 'fee' ? 'default' : 'success'} className="flex items-center gap-1">
                            {type === 'fee' ? <Coins className="h-3 w-3" /> : <BadgePercent className="h-3 w-3" />}
                            {type === 'fee' ? 'Fee' : 'Discount'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex bg-gray-100 p-1 rounded-md mr-2">
                            <Button
                                variant={!showDetails ? "secondary" : "ghost"}
                                size="xs"
                                onClick={() => setShowDetails(false)}
                                type="button"
                                className={cn("h-7 px-2 text-[10px]", !showDetails && "bg-white shadow-sm")}
                            >
                                Quick Edit
                            </Button>
                            <Button
                                variant={showDetails ? "secondary" : "ghost"}
                                size="xs"
                                onClick={() => setShowDetails(true)}
                                type="button"
                                className={cn("h-7 px-2 text-[10px]", showDetails && "bg-white shadow-sm")}
                            >
                                Advanced
                            </Button>
                        </div>
                        {isRemovable && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(index)}
                                type="button"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        )}
                    </div>
                </div>

                {!showDetails ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {/* Component Name */}
                            <div className="flex-1 min-w-[200px]">
                                <InputField
                                    label="Component Name"
                                    name={`components.${index}.name`}
                                    control={control}
                                    error={errors?.components?.[index]?.name}
                                    required
                                    placeholder="e.g. Tuition Fee"
                                />
                            </div>

                            {/* Amount Section */}
                            <div className="w-full sm:w-auto flex-none">
                                <Label className="text-sm font-medium mb-2 block">Amount Configuration</Label>
                                <div className="flex gap-2 items-start">
                                    <div className="w-28">
                                        <SelectField
                                            label=""
                                            name={`components.${index}.amount_type`}
                                            control={control}
                                            options={AMOUNT_TYPE_OPTIONS}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <InputField
                                            label=""
                                            name={`components.${index}.amount_value`}
                                            control={control}
                                            type="number"
                                            error={errors?.components?.[index]?.amount_value}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Discount & Options (Fee Only) */}
                        {type === 'fee' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50">
                                <div className="flex-1">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-28">
                                            <SelectField
                                                label="Discount"
                                                name={`components.${index}.discount_type`}
                                                control={control}
                                                options={[
                                                    { value: 'fixed', label: 'Fixed' },
                                                    { value: 'percentage', label: '%' }
                                                ]}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <InputField
                                                label="Value"
                                                name={`components.${index}.discount_value`}
                                                control={control}
                                                type="number"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Detailed View */
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-4">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Setup</h5>
                                <InputField
                                    label="Component Name"
                                    name={`components.${index}.name`}
                                    control={control}
                                    error={errors?.components?.[index]?.name}
                                    required
                                    placeholder="e.g. Tuition Fee"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label="Component Type"
                                        name={`components.${index}.type`}
                                        control={control}
                                        options={COMPONENT_TYPE_OPTIONS}
                                    />
                                    <SelectField
                                        label="Apply On"
                                        name={`components.${index}.applicable_on`}
                                        control={control}
                                        options={APPLICABLE_ON_OPTIONS}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Financial Setup</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label="Amount Type"
                                        name={`components.${index}.amount_type`}
                                        control={control}
                                        options={AMOUNT_TYPE_OPTIONS}
                                    />
                                    <InputField
                                        label="Amount"
                                        name={`components.${index}.amount_value`}
                                        control={control}
                                        type="number"
                                        error={errors?.components?.[index]?.amount_value}
                                        placeholder="0.00"
                                    />
                                </div>

                                {type === 'fee' && (
                                    <div className="grid grid-cols-2 gap-3 p-3 bg-green-50/30 rounded-lg border border-green-100">
                                        <SelectField
                                            label="Discount Type"
                                            name={`components.${index}.discount_type`}
                                            control={control}
                                            options={[
                                                { value: 'fixed', label: 'Fixed' },
                                                { value: 'percentage', label: 'Percentage' }
                                            ]}
                                        />
                                        <InputField
                                            label="Discount Value"
                                            name={`components.${index}.discount_value`}
                                            control={control}
                                            type="number"
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <TextareaField
                                label="Internal Description"
                                name={`components.${index}.description`}
                                control={control}
                                rows={2}
                                placeholder="Add notes for this component..."
                            />
                        </div>
                    </div>
                )}

                {/* Summary for fee components with discount */}
                {type === 'fee' && discountValue > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center justify-between text-sm">
                        <span className="text-blue-700">After Discount:</span>
                        <span className="font-semibold text-blue-700">
                            PKR {effectiveAmount.toLocaleString()}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Summary Card Component
const SummaryCard = ({ totals }) => {
    return (
        <Card className="bg-gray-50">
            <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Fee Summary
                </h4>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Fee Components:</span>
                        <span className="font-medium">{totals.componentCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Discount Components:</span>
                        <span className="font-medium">{totals.discountComponents || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span>Base Total:</span>
                        <span className="font-semibold">PKR {(totals.baseTotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>Total Discount:</span>
                        <span className="font-semibold">- PKR {(totals.totalDiscount || 0).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Final Total:</span>
                        <span className="text-blue-600">PKR {(totals.finalTotal || 0).toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Form Component
export default function FeeTemplateForm({
    defaultValues = {},
    onSubmit,
    onCancel,
    loading = false,
    branches = [],
    classes = [],
    students = [],
    academicYears = [],
    isEdit = false,
}) {
    const [activeTab, setActiveTab] = useState('basic');
    const [isMobile, setIsMobile] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { hasBranches } = useInstituteStore();

    // Debug logs
    useEffect(() => {
        console.log('🔍 DEBUG - FeeTemplateForm Props:', {
            defaultValues,
            isEdit,
            branches: {
                count: branches.length,
                data: branches
            },
            classes: {
                count: classes.length,
                data: classes
            },
            academicYears: {
                count: academicYears.length,
                data: academicYears
            },
            hasBranches: hasBranches()
        });
    }, [defaultValues, isEdit, branches, classes, academicYears, hasBranches]);

    // Mount check
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mobile check
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get initial values
    const getInitialValues = () => {
        const initial = {
            name: '',
            code: '',
            description: '',
            branch_id: null,  // ✅ FIX: null instead of empty string
            academic_year_id: '',
            fee_basis: 'monthly',
            due_day: 10,
            late_fine_config: {
                enabled: false,
                type: 'fixed',
                amount: 0,
                grace_days: 0,
                max_fine: null
            },
            components: [],
            is_active: true,
            ...defaultValues,
        };

        // Ensure branch_id is null if empty string
        if (initial.branch_id === '') {
            initial.branch_id = null;
        }

        // Ensure components have proper structure
        if (initial.components) {
            initial.components = initial.components.map(c => ({
                id: c.id,
                name: c.name || '',
                type: c.type || 'fee',
                amount_type: c.amount_type || 'fixed',
                amount_value: c.amount_value || 0,
                discount_type: c.discount_type || (c.type === 'fee' ? 'fixed' : undefined),
                discount_value: c.discount_value || 0,
                description: c.description || '',
                applicable_on: c.applicable_on || 'base',
            }));
        }

        return initial;
    };

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(feeTemplateSchema),
        defaultValues: getInitialValues(),
        mode: 'onChange', // Enable real-time validation and value watching
    });

    // Reset when defaultValues change (only if ID changes and is not null)
    useEffect(() => {
        if (defaultValues?.id) {
            console.log('🔄 Resetting form with new template data:', defaultValues.id);
            reset(getInitialValues());
        }
    }, [defaultValues?.id]);

    // ✅ AUTO-SELECT CURRENT ACADEMIC YEAR
    useEffect(() => {
        const currentYearId = watch('academic_year_id');
        if (academicYears.length > 0 && !currentYearId && !isEdit) {
            const current = academicYears.find(y => y.is_current) || academicYears[0];
            if (current && current.value) {
                console.log('📅 Auto-selecting current academic year:', current.label);
                setValue('academic_year_id', current.value);
            }
        }
    }, [academicYears, isEdit, setValue]);

    // Field arrays
    const { fields, append, remove, insert } = useFieldArray({
        control,
        name: 'components'
    });

    // Watch values
    const components = watch('components') || [];
    const lateFineEnabled = watch('late_fine_config.enabled');
    const lateFineType = watch('late_fine_config.type');
    const lateFineAmount = watch('late_fine_config.amount') || 0;
    const graceDays = watch('late_fine_config.grace_days') || 0;

    // Calculate totals
    const totals = useMemo(() => {
        let baseTotal = 0;
        let totalDiscount = 0;
        let discountComponentsCount = 0;
        let feeComponentsCount = 0;

        // Pass 1: Calculate Base Total and internal component discounts
        (components || []).forEach(comp => {
            if (comp?.type === 'fee') {
                feeComponentsCount++;
                const amount = Number(comp?.amount_value) || 0;
                baseTotal += amount;

                if (comp?.discount_value && comp.discount_value > 0) {
                    discountComponentsCount++;
                    if (comp.discount_type === 'percentage') {
                        totalDiscount += (amount * Number(comp.discount_value) / 100);
                    } else {
                        totalDiscount += Number(comp.discount_value);
                    }
                }
            }
        });

        // Pass 2: Calculate Global Discount components
        (components || []).forEach(comp => {
            if (comp?.type === 'discount') {
                discountComponentsCount++;
                const value = Number(comp?.amount_value) || 0;
                if (comp.amount_type === 'percentage') {
                    totalDiscount += (baseTotal * value / 100);
                } else {
                    totalDiscount += value;
                }
            }
        });

        const finalTotal = Math.max(0, baseTotal - totalDiscount);

        return {
            baseTotal,
            totalDiscount,
            finalTotal,
            componentCount: feeComponentsCount,
            discountComponents: discountComponentsCount
        };
    }, [components]);

    // Navigation
    const nextTab = () => {
        const tabs = ['basic', 'components'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
        }
    };

    const prevTab = () => {
        const tabs = ['basic', 'components', 'applicability'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1]);
        }
    };

    // Add component
    const addComponent = useCallback((type = 'fee') => {
        append({
            id: Date.now().toString(),
            name: '',
            type,
            amount_type: 'fixed',
            amount_value: 0,
            discount_type: type === 'fee' ? 'fixed' : undefined,
            discount_value: type === 'fee' ? 0 : undefined,
            description: '',
            applicable_on: 'base'
        });
    }, [append]);

    const copyComponent = null; // Removed

    // Quick add templates
    const quickAddTemplates = [
        { name: 'Tuition Fee', amount: 5000, type: 'fee' },
        { name: 'Admission Fee', amount: 10000, type: 'fee' },
        { name: 'Transport Fee', amount: 2000, type: 'fee' },
        { name: 'Sports Fee', amount: 1000, type: 'fee' },
        { name: 'Library Fee', amount: 500, type: 'fee' },
        { name: 'Scholarship', amount: 10, type: 'discount', amount_type: 'percentage' },
        { name: 'Sibling Concession', amount: 5, type: 'discount', amount_type: 'percentage' }
    ];

    const handleQuickAdd = useCallback((template) => {
        append({
            id: Date.now().toString(),
            name: template.name,
            type: template.type,
            amount_type: template.amount_type || 'fixed',
            amount_value: template.amount,
            discount_type: template.type === 'fee' ? 'fixed' : undefined,
            discount_value: 0,
            description: '',
            applicable_on: 'base'
        });
    }, [append]);

    // ✅ FIX: Sanitize payload before submitting
    const sanitizePayload = (data) => {
        return {
            ...data,
            branch_id: data.branch_id || null,  // Convert empty string to null
        };
    };

    // Form submit handler
    const onFormSubmit = (data) => {
        console.log('📤 Form submitting with data:', data);

        const sanitizedData = sanitizePayload(data);

        // Add calculated totals
        const formattedData = {
            ...sanitizedData,
            total_amount: totals.finalTotal,
            calculated_totals: totals,
            discount_summary: {
                total_fixed_discount: 0,
                total_percentage_discount: 0,
                final_discount: totals.totalDiscount
            }
        };

        console.log('📦 Formatted data for API:', formattedData);
        onSubmit(formattedData);
    };

    // Form error handler
    const onFormError = (errs) => {
        console.log('❌ Form validation errors:', errs);

        // Navigate to tab with errors
        if (errs.name || errs.academic_year_id || errs.fee_basis || errs.due_day) {
            setActiveTab('basic');
        } else if (errs.components) {
            setActiveTab('components');
        } else if (errs.applicable_to) {
            setActiveTab('applicability');
        }

        // Show first error in toast
        const firstError = Object.values(errs)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-4 sm:space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                        <TabsTrigger value="basic" className="px-3 sm:px-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            General Info
                            {(errors.name || errors.academic_year_id || errors.fee_basis || errors.due_day) && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="components" className="px-3 sm:px-4 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Components
                            {components.length > 0 && (
                                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                                    {components.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Mobile Navigation */}
                {isMobile && (
                    <div className="flex items-center justify-between mb-4">
                        <Button type="button" variant="outline" size="sm" onClick={prevTab} disabled={activeTab === 'basic'}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium capitalize">
                            {activeTab === 'basic' ? 'Basic Info' : activeTab}
                        </span>
                        <Button type="button" variant="outline" size="sm" onClick={nextTab} disabled={activeTab === 'applicability'}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic" className="space-y-4">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Basic Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name Field - ✅ Using InputField */}
                                    <InputField
                                        label="Template Name"
                                        name="name"
                                        control={control}
                                        error={errors.name}
                                        required
                                        placeholder="e.g. Class 1 Regular Fee"
                                    />

                                    {/* Code Field - ✅ Using InputField */}
                                    <InputField
                                        label="Template Code"
                                        name="code"
                                        control={control}
                                        placeholder="e.g. CLS1-REG-2026"
                                    />
                                </div>

                                {/* Description Field - ✅ Using TextareaField */}
                                <TextareaField
                                    label="Description"
                                    name="description"
                                    control={control}
                                    rows={3}
                                    placeholder="Enter Template Details..."
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* ✅ FIX: Branch Select - ONLY SHOW IF hasBranches = TRUE - ✅ Using SelectField */}
                                    {hasBranches() && (
                                        <SelectField
                                            label="Branch"
                                            name="branch_id"
                                            control={control}
                                            options={[
                                                { value: '', label: 'All Branches' },
                                                ...branches.map(b => ({ value: b.value, label: b.label }))
                                            ]}
                                            placeholder="Select Branch"
                                            hint="Leave empty for All Branches"
                                        />
                                    )}

                                    {/* Academic Year Select - REQUIRED - ✅ Using SelectField */}
                                    <div className={cn(!hasBranches() && "md:col-span-2")}>
                                        <SelectField
                                            label="Academic Year"
                                            name="academic_year_id"
                                            control={control}
                                            error={errors.academic_year_id}
                                            required
                                            options={[
                                                { value: '', label: 'Select Academic Year' },
                                                ...academicYears.map(year => ({ value: year.value, label: year.label }))
                                            ]}
                                            placeholder="Select Academic Year"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fee Configuration
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Fee Basis - ✅ Using SelectField */}
                                    <SelectField
                                        label="Fee Basis"
                                        name="fee_basis"
                                        control={control}
                                        error={errors.fee_basis}
                                        required
                                        options={FEE_BASIS_OPTIONS}
                                        placeholder="Select Fee Basis"
                                    />

                                    {/* Due Day - ✅ Using InputField */}
                                    <InputField
                                        label="Due Day"
                                        name="due_day"
                                        control={control}
                                        error={errors.due_day}
                                        required
                                        type="number"
                                        placeholder="e.g. 10"
                                        hint="Day of month (1-31)"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Late Fine Configuration
                                    </h3>
                                    
                                    {/* ✅ Using SwitchField */}
                                    <SwitchField
                                        className="w-[55%]"
                                        label="Enable Late Fine"
                                        name="late_fine_config.enabled"
                                        control={control}
                                    />
                                </div>

                                {lateFineEnabled && (
                                    <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Fine Type - ✅ Using SelectField */}
                                            <SelectField
                                                label="Fine Type"
                                                name="late_fine_config.type"
                                                control={control}
                                                options={LATE_FINE_TYPE_OPTIONS}
                                            />

                                            {/* Fine Amount - ✅ Using InputField */}
                                            <InputField
                                                label={lateFineType === 'fixed' ? 'Fine Amount (PKR)' : 'Fine Percentage (%)'}
                                                name="late_fine_config.amount"
                                                control={control}
                                                type="number"
                                                min={0}
                                                step={lateFineType === 'fixed' ? '1' : '0.1'}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Grace Days - ✅ Using InputField */}
                                            <InputField
                                                label="Grace Days"
                                                name="late_fine_config.grace_days"
                                                control={control}
                                                type="number"
                                                min={0}
                                                max={30}
                                                placeholder="e.g. 5"
                                            />

                                            {/* Max Fine - ✅ Using InputField */}
                                            <InputField
                                                label="Maximum Fine (Optional)"
                                                name="late_fine_config.max_fine"
                                                control={control}
                                                type="number"
                                                min={0}
                                                placeholder="Leave empty for no max"
                                            />
                                        </div>

                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {lateFineType === 'fixed'
                                                    ? `${lateFineAmount} PKR fine after ${graceDays} days`
                                                    : `${lateFineAmount}% fine after ${graceDays} days`
                                                }
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </TabsContent>

                {/* Tab 2: Components */}
                <TabsContent value="components" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SummaryCard totals={totals} />

                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold mb-3">Quick Add Components</h4>
                                <div className="flex flex-wrap gap-2">
                                    {quickAddTemplates.map((template, idx) => (
                                        <Button
                                            key={idx}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickAdd(template)}
                                            className={cn(
                                                "text-xs flex items-center gap-2",
                                                template.type === 'fee'
                                                    ? 'border-blue-200 hover:bg-blue-50 text-blue-700'
                                                    : 'border-green-200 hover:bg-green-50 text-green-700'
                                            )}
                                        >
                                            {template.type === 'fee' ? <Coins className="h-3 w-3" /> : <BadgePercent className="h-3 w-3" />}
                                            {template.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50/50 border-blue-100 md:col-span-2">
                            <CardContent className="p-4 sm:p-5">
                                <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                                    <Info className="h-4 w-4" />
                                    Fee Template Guide
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-700">
                                    <p className="flex gap-2">
                                        <Coins className="h-4 w-4 flex-none mt-0.5" />
                                        <span><span className="font-bold">Fee Components:</span> Regular charges like Tuition or Admission.</span>
                                    </p>
                                    <p className="flex gap-2">
                                        <BadgePercent className="h-4 w-4 flex-none mt-0.5" />
                                        <span><span className="font-bold">Discounts:</span> Deductions that reduce the amount (e.g. Scholarship).</span>
                                    </p>
                                    <p className="flex gap-2">
                                        <Layers className="h-4 w-4 flex-none mt-0.5" />
                                        <span><span className="font-bold">Types:</span> Use <strong>Fixed</strong> amounts or <strong>Percentage</strong> values.</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <h4 className="font-semibold">Fee Components</h4>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addComponent('fee')}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Fee
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addComponent('discount')}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Discount
                                        </Button>
                                    </div>
                                </div>

                                {(!components || components.length === 0) ? (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No components added yet</p>
                                        <p className="text-sm">Add fee components or discounts using the buttons above</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <ComponentCard
                                                key={field.id}
                                                index={index}
                                                control={control}
                                                errors={errors}
                                                onRemove={remove}
                                                isRemovable={fields.length > 1}
                                                watch={watch}
                                                setValue={setValue}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Note:</strong> Discount components apply on the final total.
                            For conditional discounts, you can mark components as optional.
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>

            {/* Form Actions - ✅ Using FormSubmitButton */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>

                <FormSubmitButton
                    loading={loading}
                    label={isEdit ? 'Save Changes' : 'Create Template'}
                    loadingLabel={isEdit ? 'Saving...' : 'Creating...'}
                    className="w-full sm:w-auto"
                />
            </div>
        </form>
    );
}