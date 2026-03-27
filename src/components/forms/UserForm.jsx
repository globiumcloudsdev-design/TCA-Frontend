/**
 * UserForm — Create / Edit portal user
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   roleOptions    { value, label }[]
 *   branchOptions  { value, label }[]
 *   isEdit         boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

export default function UserForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading       = false,
  roleOptions   = [],
  branchOptions = [],
  isEdit        = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="First Name"
          name="first_name"
          register={register}
          error={errors.first_name}
          required
          placeholder="e.g. Sara"
        />
        <InputField
          label="Last Name"
          name="last_name"
          register={register}
          error={errors.last_name}
          required
          placeholder="e.g. Khan"
        />
      </div>

      <InputField
        label="Email"
        name="email"
        register={register}
        error={errors.email}
        type="email"
        required
        placeholder="user@school.com"
      />

      {!isEdit && (
        <InputField
          label="Password"
          name="password"
          register={register}
          error={errors.password}
          type="password"
          required
          placeholder="Min 8 characters"
        />
      )}

      <InputField
        label="Phone"
        name="phone"
        register={register}
        error={errors.phone}
        type="tel"
        placeholder="e.g. 03001234567"
      />

      <SelectField
        label="Role"
        name="role_id"
        control={control}
        error={errors.role_id}
        options={roleOptions}
        placeholder="Select role"
        required
      />

      {branchOptions.length > 0 && (
        <SelectField
          label="Branch"
          name="branch_id"
          control={control}
          error={errors.branch_id}
          options={branchOptions}
          placeholder="Select branch (optional)"
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create User'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
        />
      </div>
    </form>
  );
}
