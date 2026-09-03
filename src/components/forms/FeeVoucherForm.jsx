/**
 * FeeVoucherForm — Create / Edit fee voucher
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues   object
 *   onSubmit        (data) => void
 *   onCancel        () => void
 *   loading         boolean
 *   studentOptions  { value, label }[]
 *   isEdit          boolean
 */
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
  BranchSelectField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { studentService } from '@/services/studentService';

const MONTH_OPTIONS = [
  { value:  '1', label: 'January'   },
  { value:  '2', label: 'February'  },
  { value:  '3', label: 'March'     },
  { value:  '4', label: 'April'     },
  { value:  '5', label: 'May'       },
  { value:  '6', label: 'June'      },
  { value:  '7', label: 'July'      },
  { value:  '8', label: 'August'    },
  { value:  '9', label: 'September' },
  { value: '10', label: 'October'   },
  { value: '11', label: 'November'  },
  { value: '12', label: 'December'  },
];

export default function FeeVoucherForm({
  defaultValues   = {},
  onSubmit,
  onCancel,
  loading         = false,
  studentOptions  = [],
  isEdit          = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      month: String(new Date().getMonth() + 1),
      year: new Date().getFullYear(),
      amount: '',
      discount: '',
      arrears: '',
      ...defaultValues,
    }
  });

  const selectedStudentId = useWatch({ control, name: 'student_id' });

  // Fetch student details to auto-populate monthly fee & concession
  const { data: studentDetail = null } = useQuery({
    queryKey: ['student-fee-detail-form', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      try {
        const res = await studentService.getById(selectedStudentId);
        return res?.data?.data || res?.data || res || null;
      } catch (err) {
        return null;
      }
    },
    enabled: !!selectedStudentId && !isEdit,
  });

  // Fetch unpaid vouchers for arrears calculation
  const { data: unpaidVouchers = [] } = useQuery({
    queryKey: ['student-unpaid-dues-form', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      try {
        const vouchers = await studentService.getUnpaidVouchers(selectedStudentId);
        return vouchers || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!selectedStudentId && !isEdit,
  });

  useEffect(() => {
    if (studentDetail && !isEdit) {
      const baseMonthlyFee = Number(studentDetail.monthly_fee || studentDetail.monthlyFee || 0);
      if (baseMonthlyFee > 0) {
        setValue('amount', baseMonthlyFee);
        setValue('base_amount', baseMonthlyFee);
      }

      const concessionType = studentDetail.concession_type || studentDetail.discount_type;
      const concessionPct = Number(studentDetail.concession_percentage || 0);
      let disc = 0;
      if (concessionType === 'percentage' && concessionPct > 0) {
        disc = (baseMonthlyFee * concessionPct) / 100;
      } else {
        disc = Number(studentDetail.concession_amount || studentDetail.discount || 0);
      }
      if (disc > 0) {
        setValue('discount', disc);
      }

      const priorArrears = (unpaidVouchers || []).reduce(
        (sum, v) => sum + Number(v.pending_amount ?? (v.net_amount || v.amount || 0)),
        0
      );
      if (priorArrears > 0) {
        setValue('arrears', priorArrears);
      }
    }
  }, [studentDetail, unpaidVouchers, isEdit, setValue]);

  const handleFormSubmit = (data) => {
    const baseAmt = Number(data.amount || 0);
    const discAmt = Number(data.discount || 0);
    const arrAmt = Number(data.arrears || 0);
    const netAmt = Math.max(0, baseAmt - discAmt) + arrAmt;

    onSubmit({
      ...data,
      base_amount: baseAmt,
      baseAmount: baseAmt,
      amount: baseAmt,
      discount: discAmt,
      arrears: arrAmt,
      previous_arrears: arrAmt,
      net_amount: netAmt,
      netAmount: netAmt,
      include_arrears: true,
      carry_forward_arrears: true,
      preserve_previous_vouchers: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <BranchSelectField
        control={control}
        error={errors.branch_id}
        setValue={setValue}
        required
      />
      <SelectField
        label="Student"
        name="student_id"
        control={control}
        error={errors.student_id}
        options={studentOptions}
        placeholder="Select student"
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField
          label="Base Monthly Fee (PKR)"
          name="amount"
          register={register}
          error={errors.amount}
          type="number"
          required
          placeholder="e.g. 5000"
        />
        <InputField
          label="Discount / Concession (PKR)"
          name="discount"
          register={register}
          error={errors.discount}
          type="number"
          placeholder="e.g. 500"
        />
        <InputField
          label="Previous Charges / Arrears (PKR)"
          name="arrears"
          register={register}
          error={errors.arrears}
          type="number"
          placeholder="e.g. 0"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Month"
          name="month"
          control={control}
          error={errors.month}
          options={MONTH_OPTIONS}
          placeholder="Select month"
          required
        />
        <InputField
          label="Year"
          name="year"
          register={register}
          error={errors.year}
          type="number"
          placeholder={String(new Date().getFullYear())}
          required
        />
      </div>
      <DatePickerField
        label="Due Date"
        name="due_date"
        control={control}
        error={errors.due_date}
        required
      />
      <TextareaField
        label="Notes"
        name="notes"
        register={register}
        error={errors.notes}
        placeholder="Optional remarks"
        rows={2}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Generate Voucher'}
          loadingLabel={isEdit ? 'Saving…' : 'Generating…'}
        />
      </div>
    </form>
  );
}
