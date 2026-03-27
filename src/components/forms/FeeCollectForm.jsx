/**
 * FeeCollectForm — Collect payment against a fee voucher
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   maxAmount      number  (outstanding amount for display)
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  TextareaField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash',         label: 'Cash'          },
  { value: 'bank_transfer',label: 'Bank Transfer'  },
  { value: 'online',       label: 'Online Payment' },
  { value: 'cheque',       label: 'Cheque'        },
];

export default function FeeCollectForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading    = false,
  maxAmount  = null,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {maxAmount != null && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm">
          Outstanding: <span className="font-semibold">PKR {Number(maxAmount).toLocaleString()}</span>
        </div>
      )}

      <InputField
        label="Amount Paid (PKR)"
        name="amount_paid"
        register={register}
        error={errors.amount_paid}
        type="number"
        required
        placeholder="e.g. 5000"
      />
      <SelectField
        label="Payment Method"
        name="payment_method"
        control={control}
        error={errors.payment_method}
        options={PAYMENT_METHOD_OPTIONS}
        placeholder="Select method"
        required
      />
      <InputField
        label="Transaction / Reference ID"
        name="transaction_id"
        register={register}
        error={errors.transaction_id}
        placeholder="Optional bank slip or transaction ID"
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
          label="Collect Payment"
          loadingLabel="Processing…"
        />
      </div>
    </form>
  );
}
