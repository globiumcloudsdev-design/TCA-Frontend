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
    Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import useInstituteStore from '@/store/instituteStore';
import { toast } from 'sonner';
import { Label } from '../ui/label';

// Constants
const FEE_BASIS_OPTIONS = [
    { value: 'monthly', label: '📅 Monthly' },
    { value: 'quarterly', label: '📊 Quarterly' },
    { value: 'half_yearly', label: '📈 Half Yearly' },
    { value: 'annually', label: '🎯 Annually' },
    { value: 'one_time', label: '⭐ One Time' }
];

const LATE_FINE_TYPE_OPTIONS = [
    { value: 'fixed', label: '💰 Fixed Amount' },
    { value: 'percentage', label: '📊 Percentage' }
];

const COMPONENT_TYPE_OPTIONS = [
    { value: 'fee', label: '💰 Fee Component' },
    { value: 'discount', label: '🏷️ Discount Component' }
];

const AMOUNT_TYPE_OPTIONS = [
    { value: 'fixed', label: '💰 Fixed' },
    { value: 'percentage', label: '📊 Percentage' }
];

const APPLICABLE_ON_OPTIONS = [
    { value: 'base', label: 'Base Amount' },
    { value: 'subtotal', label: 'Subtotal' },
    { value: 'total', label: 'Total' }
];

// ✅ FIXED: Zod Schema with proper optional fields
const componentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Component name zaroori hai'),
    type: z.enum(['fee', 'discount']),
    amount_type: z.enum(['fixed', 'percentage']),
    amount_value: z.coerce.number()
        .min(0, 'Amount positive hona chahiye')
        .max(9999999, 'Amount bohot zyada hai'),
    discount_type: z.enum(['fixed', 'percentage']).optional(),
    discount_value: z.coerce.number()
        .min(0, 'Discount positive hona chahiye')
        .max(100, 'Percentage discount 100% se zyada nahi ho sakta')
        .optional(),
    is_optional: z.boolean().default(false),
    description: z.string().optional(),
    applicable_on: z.enum(['base', 'subtotal', 'total']).default('base')
}).refine((data) => {
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount 100% se zyada nahi ho sakta',
    path: ['discount_value']
});

const feeTemplateSchema = z.object({
    name: z.string().min(3, 'Name kam se kam 3 characters ka hona chahiye'),
    code: z.string().optional(),
    description: z.string().optional(),

    // ✅ FIX: branch_id properly optional and nullable
    branch_id: z.string().optional().nullable(),

    academic_year_id: z.string().min(1, 'Academic year select karna zaroori hai'),
    fee_basis: z.enum(['monthly', 'quarterly', 'half_yearly', 'annually', 'one_time']),
    due_day: z.coerce.number()
        .min(1, 'Day 1-31 ke darmiyan hona chahiye')
        .max(31, 'Day 1-31 ke darmiyan hona chahiye'),
    late_fine_config: z.object({
        enabled: z.boolean(),
        type: z.enum(['fixed', 'percentage']),
        amount: z.coerce.number().min(0),
        grace_days: z.coerce.number().min(0).max(30, 'Grace days 30 se zyada nahi ho sakte'),
        max_fine: z.coerce.number().min(0).optional().nullable()
    }),
    components: z.array(componentSchema).default([]),
    applicable_to: z.object({
        all_classes: z.boolean(),
        class_ids: z.array(z.string()),
        section_ids: z.array(z.string()),
        student_ids: z.array(z.string()),
        all_branches: z.boolean(),
        branch_ids: z.array(z.string())
    }),
    is_active: z.boolean().default(true),
    is_default: z.boolean().default(false)
});

// Component Card Component
const ComponentCard = ({
    index,
    control,
    errors,
    onRemove,
    onCopy,
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
                        <Badge variant={type === 'fee' ? 'default' : 'success'}>
                            {type === 'fee' ? '💰 Fee' : '🏷️ Discount'}
                        </Badge>
                        {watch(`components.${index}.is_optional`) && (
                            <Badge variant="outline">Optional</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            type="button"
                        >
                            {showDetails ? 'Simple' : 'Details'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopy(index)}
                            type="button"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
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

                {/* Simple View */}
                {!showDetails ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Component Name - ✅ Using InputField */}
                            <InputField
                                label="Component Name"
                                name={`components.${index}.name`}
                                control={control}
                                error={errors?.components?.[index]?.name}
                                required
                                placeholder="e.g. Tuition Fee"
                            />

                            <div className="space-y-1">
                                <Label>Amount</Label>
                                <div className="flex gap-2">
                                    {/* Amount Type - ✅ Using SelectField */}
                                    <div className="w-32">
                                        <SelectField
                                            label=""
                                            name={`components.${index}.amount_type`}
                                            control={control}
                                            options={AMOUNT_TYPE_OPTIONS}
                                            placeholder="Type"
                                        />
                                    </div>

                                    {/* Amount Value - ✅ Using InputField with number type */}
                                    <InputField
                                        label=""
                                        name={`components.${index}.amount_value`}
                                        control={control}
                                        type="number"
                                        error={errors?.components?.[index]?.amount_value}
                                        placeholder="Amount"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Discount Section (only for fee type) */}
                        {type === 'fee' && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                {/* Discount Type - ✅ Using SelectField */}
                                <SelectField
                                    label="Discount Type"
                                    name={`components.${index}.discount_type`}
                                    control={control}
                                    options={[
                                        { value: 'fixed', label: 'Fixed' },
                                        { value: 'percentage', label: 'Percentage' }
                                    ]}
                                    placeholder="Select"
                                />

                                {/* Discount Value - ✅ Using InputField */}
                                <InputField
                                    label="Discount Value"
                                    name={`components.${index}.discount_value`}
                                    control={control}
                                    type="number"
                                    error={errors?.components?.[index]?.discount_value}
                                    placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    /* Detailed View */
                    <div className="space-y-3">
                        {/* Component Name - ✅ Using InputField */}
                        <InputField
                            label="Component Name"
                            name={`components.${index}.name`}
                            control={control}
                            error={errors?.components?.[index]?.name}
                            required
                            placeholder="e.g. Tuition Fee"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            {/* Component Type - ✅ Using SelectField */}
                            <SelectField
                                label="Component Type"
                                name={`components.${index}.type`}
                                control={control}
                                options={COMPONENT_TYPE_OPTIONS}
                            />

                            {/* Apply On - ✅ Using SelectField */}
                            <SelectField
                                label="Apply On"
                                name={`components.${index}.applicable_on`}
                                control={control}
                                options={APPLICABLE_ON_OPTIONS}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Amount Type - ✅ Using SelectField */}
                            <SelectField
                                label="Amount Type"
                                name={`components.${index}.amount_type`}
                                control={control}
                                options={AMOUNT_TYPE_OPTIONS}
                            />

                            {/* Amount - ✅ Using InputField */}
                            <InputField
                                label="Amount"
                                name={`components.${index}.amount_value`}
                                control={control}
                                type="number"
                                error={errors?.components?.[index]?.amount_value}
                                placeholder="Amount"
                            />
                        </div>

                        {type === 'fee' && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Discount Type - ✅ Using SelectField */}
                                    <SelectField
                                        label="Discount Type"
                                        name={`components.${index}.discount_type`}
                                        control={control}
                                        options={[
                                            { value: 'fixed', label: 'Fixed Discount' },
                                            { value: 'percentage', label: 'Percentage Discount' }
                                        ]}
                                    />

                                    {/* Discount Value - ✅ Using InputField */}
                                    <InputField
                                        label="Discount Value"
                                        name={`components.${index}.discount_value`}
                                        control={control}
                                        type="number"
                                        error={errors?.components?.[index]?.discount_value}
                                        placeholder="Discount value"
                                    />
                                </div>
                            </>
                        )}

                        {/* Description - ✅ Using TextareaField */}
                        <TextareaField
                            label="Description (Optional)"
                            name={`components.${index}.description`}
                            control={control}
                            rows={2}
                            placeholder="Component ki detail..."
                        />

                        {/* Optional Checkbox - ✅ Using CheckboxField */}
                        <CheckboxField
                            label="Optional Component"
                            name={`components.${index}.is_optional`}
                            control={control}
                        />
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
            applicable_to: {
                all_classes: false,
                class_ids: [],
                section_ids: [],
                student_ids: [],
                all_branches: true,
                branch_ids: []
            },
            is_active: true,
            is_default: false,
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
                is_optional: c.is_optional || false,
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
    });

    // Reset when defaultValues change
    useEffect(() => {
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            console.log('🔄 Resetting form with new values:', defaultValues);
            reset(getInitialValues());
        }
    }, [defaultValues?.id]);

    // Field arrays
    const { fields, append, remove, insert } = useFieldArray({
        control,
        name: 'components'
    });

    // Watch values
    const components = watch('components') || [];
    const lateFineEnabled = watch('late_fine_config.enabled');
    const allClasses = watch('applicable_to.all_classes');
    const allBranches = watch('applicable_to.all_branches');
    const lateFineType = watch('late_fine_config.type');
    const lateFineAmount = watch('late_fine_config.amount') || 0;
    const graceDays = watch('late_fine_config.grace_days') || 0;

    // Calculate totals
    const totals = useMemo(() => {
        let baseTotal = 0;
        let totalDiscount = 0;
        let discountComponents = 0;

        (components || []).forEach(comp => {
            if (comp?.type === 'fee') {
                baseTotal += comp?.amount_value || 0;

                if (comp?.discount_value && comp.discount_value > 0) {
                    discountComponents++;
                    if (comp.discount_type === 'percentage') {
                        totalDiscount += (comp.amount_value * comp.discount_value / 100);
                    } else {
                        totalDiscount += comp.discount_value;
                    }
                }
            }
        });

        const finalTotal = Math.max(0, baseTotal - totalDiscount);

        return {
            baseTotal,
            totalDiscount,
            finalTotal,
            componentCount: components?.length || 0,
            discountComponents
        };
    }, [components]);

    // Navigation
    const nextTab = () => {
        const tabs = ['basic', 'components', 'applicability'];
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
            is_optional: false,
            description: '',
            applicable_on: 'base'
        });
    }, [append]);

    // Copy component
    const copyComponent = useCallback((index) => {
        const component = getValues(`components.${index}`);
        insert(index + 1, {
            ...component,
            id: Date.now().toString(),
            name: `${component.name} (Copy)`
        });
    }, [getValues, insert]);

    // Quick add templates
    const quickAddTemplates = [
        { name: 'Tuition Fee', amount: 5000, type: 'fee' },
        { name: 'Admission Fee', amount: 10000, type: 'fee' },
        { name: 'Transport Fee', amount: 2000, type: 'fee' },
        { name: 'Sports Fee', amount: 1000, type: 'fee', optional: true },
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
            is_optional: template.optional || false,
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
                    <TabsList className={`inline-flex w-auto sm:grid ${isMobile ? 'flex-nowrap' : 'grid-cols-3'} mb-4 sm:mb-6`}>
                        <TabsTrigger value="basic" className="px-3 sm:px-4">
                            Basic Info
                            {(errors.name || errors.academic_year_id || errors.fee_basis || errors.due_day) && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-destructive inline-block" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="components" className="px-3 sm:px-4">
                            Components
                            {components.length > 0 && (
                                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                                    {components.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="applicability" className="px-3 sm:px-4">
                            Applicability
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
                                    placeholder="Template ki details likhen..."
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
                                                "text-xs",
                                                template.type === 'fee'
                                                    ? 'border-blue-200 hover:bg-blue-50'
                                                    : 'border-green-200 hover:bg-green-50'
                                            )}
                                        >
                                            {template.type === 'fee' ? '💰' : '🏷️'} {template.name}
                                        </Button>
                                    ))}
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
                                                onCopy={copyComponent}
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

                {/* Tab 3: Applicability */}
                <TabsContent value="applicability" className="space-y-4">
                    <Card>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <h3 className="font-semibold">Class & Section Applicability</h3>

                            {/* ✅ Using CheckboxField */}
                            <CheckboxField
                                label="Apply to all classes"
                                name="applicable_to.all_classes"
                                control={control}
                            />

                            {!allClasses && (
                                <div className="pl-6 space-y-4">
                                    <div>
                                        <MultiSelectField
                                            label="Select Classes"
                                            name="applicable_to.class_ids"
                                            control={control}
                                            options={classes}
                                            placeholder="Select classes..."
                                            error={errors.applicable_to?.class_ids?.message}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ✅ Branch Card - Sirf tab show hoga jab hasBranches true ho */}
                    {hasBranches() && (
                        <Card>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <h3 className="font-semibold">Branch Applicability</h3>

                                {/* ✅ Using CheckboxField */}
                                <CheckboxField
                                    label="Apply to all branches"
                                    name="applicable_to.all_branches"
                                    control={control}
                                />

                                {!allBranches && (
                                    <div className="pl-6">
                                        <MultiSelectField
                                            label="Select Branches"
                                            name="applicable_to.branch_ids"
                                            control={control}
                                            options={branches}
                                            placeholder="Select branches..."
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <h3 className="font-semibold">Student Applicability</h3>

                            <MultiSelectField
                                label="Specific Students (Optional)"
                                name="applicable_to.student_ids"
                                control={control}
                                options={students}
                                placeholder="Select students..."
                            />

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    If no students are selected, template will apply based on class/branch rules above.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <h3 className="font-semibold">Default Setting</h3>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* ✅ Using CheckboxField */}
                                <CheckboxField
                                    label="Set as Default Template"
                                    name="is_default"
                                    control={control}
                                />
                            </div>

                            {watch('is_default') && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        This will be the default template for new students/classes.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
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