'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SelectField } from '@/components/common';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import useInstituteStore from '@/store/instituteStore';
import { branchService } from '@/services';
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch, schoolHasBranches } from '@/lib/auth';
import { DUMMY_BRANCHES } from '@/data/dummyData';

/**
 * BranchSelectField — Role-Adaptive Branch Field for Creation & Edit Forms
 *
 * Rules:
 * • For Super Admin:
 *   - Mandatory  Select Branch dropdown field.
 *   - Super Admin must explicitly choose which branch the record belongs to.
 *   - Pre-populates with currently active branch if one is selected in global switcher.
 *
 * • For Branch Admin:
 *   - Completely HIDDEN from the form.
 *   - Automatically populates ranch_id with their assigned branch in the background.
 */
export default function BranchSelectField({
  name = 'branch_id',
  label = 'Branch',
  control,
  register,
  error,
  setValue,
  watch,
  required = true,
  disabled = false,
  placeholder = 'Select Branch',
  hint = '',
  className = '',
  branches: customBranches = null,
}) {
  const { user } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { activeBranchId } = useUIStore();

  const isBranchAdmin = checkIsBranchAdmin(user);
  const assignedBranch = getAssignedBranch(user);
  const hasBranches = schoolHasBranches(user);

  // Fetch branches from API if not provided
  const { data: apiBranches } = useQuery({
    queryKey: ['branch-field-options', currentInstitute?.id],
    queryFn: async () => {
      try {
        const res = await branchService.getAll({ limit: 100, is_active: true });
        const list = res?.data?.rows ?? res?.data ?? res ?? [];
        if (Array.isArray(list) && list.length > 0) return list;
      } catch (e) {
        // fallback
      }
      return currentInstitute?.branches ?? user?.institute?.branches ?? user?.branches ?? DUMMY_BRANCHES;
    },
    enabled: !isBranchAdmin,
    staleTime: 2 * 60 * 1000,
  });

  const rawBranches = customBranches || apiBranches || currentInstitute?.branches || user?.institute?.branches || DUMMY_BRANCHES;
  const branchList = Array.isArray(rawBranches) ? rawBranches : (rawBranches?.data || []);

  const branchOptions = branchList.map((b) => ({
    value: String(b.id || b.value || ''),
    label: b.name || b.label || `Branch ${b.id || ''}`,
  }));

  const currentValue = watch ? watch(name) : undefined;

  // Background auto-tagging for Branch Admin
  useEffect(() => {
    if (isBranchAdmin && setValue) {
      const branchId = assignedBranch?.id || user?.branch_id || user?.branch?.id;
      if (branchId && String(currentValue || '') !== String(branchId)) {
        setValue(name, String(branchId), { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [isBranchAdmin, assignedBranch?.id, user?.branch_id, user?.branch?.id, name, setValue, currentValue]);

  // Pre-fill with activeBranchId for Super Admin if field is currently empty (ignore 'all')
  useEffect(() => {
    if (!isBranchAdmin && setValue && activeBranchId && activeBranchId !== 'all' && (!currentValue || currentValue === '')) {
      setValue(name, String(activeBranchId), { shouldValidate: false, shouldDirty: false });
    }
  }, [isBranchAdmin, activeBranchId, currentValue, name, setValue]);

  // 1. Branch Admin: Completely Hidden
  if (isBranchAdmin) {
    return null;
  }

  // 2. Super Admin: Mandatory Select Branch dropdown field
  return (
    <div className={className}>
      <SelectField
        label={label}
        name={name}
        control={control}
        register={register}
        error={error}
        options={branchOptions}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        hint={hint}
      />
    </div>
  );
}
