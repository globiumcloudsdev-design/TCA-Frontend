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

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

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
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SelectField
        label="Student"
        name="student_id"
        control={control}
        error={errors.student_id}
        options={studentOptions}
        placeholder="Select student"
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Amount (PKR)"
          name="amount"
          register={register}
          error={errors.amount}
          type="number"
          required
          placeholder="e.g. 5000"
        />
        <InputField
          label="Discount (PKR)"
          name="discount"
          register={register}
          error={errors.discount}
          type="number"
          placeholder="e.g. 500"
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
