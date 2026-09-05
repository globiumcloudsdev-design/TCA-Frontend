'use client';

import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import { SelectField } from '@/components/common';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import useInstituteStore from '@/store/instituteStore';
import { branchService } from '@/services';
import { isBranchAdmin as checkIsBranchAdmin, getAssignedBranch } from '@/lib/auth';
import { resolveBranchName, registerBranches } from '@/lib/branchUtils';

/**
 * BranchSelectField — Role-Adaptive Branch Field for Creation & Edit Forms
 *
 * Rules:
 * 1. Branch Admin:
 *    - Completely hidden from the form UI.
 *    - Automatically sets form value `name` to their assigned branch ID.
 *
 * 2. Super Admin:
 *    - Single Branch (institute has <= 1 branch):
 *      - Hidden from the form UI (does not ask the user to select a branch).
 *      - Automatically sets form value `name` to that single branch's ID.
 *    - Multiple Branches (institute has > 1 branch):
 *      - Renders the Select dropdown showing all available branches.
 *      - Automatically pre-selects the Main Branch (`is_main === true`) in the select input
 *        if no branch is currently chosen (or scopes to active branch from header if set).
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

  // Determine if valid custom branches were provided as non-empty array
  const hasCustomBranches = Array.isArray(customBranches) && customBranches.length > 0;

  const instituteId = currentInstitute?.id || user?.institute_id || user?.school_id;

  // Fetch real branches from API if not provided via valid customBranches
  const { data: apiBranches, isLoading } = useQuery({
    queryKey: ['branch-field-options', instituteId],
    queryFn: async () => {
      try {
        const res = await branchService.getAll({ limit: 100, is_active: true });
        const list = res?.data?.rows ?? (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list)) return list;
      } catch (err) {
        console.error('Error fetching branches in BranchSelectField:', err);
      }
      return [];
    },
    enabled: !isBranchAdmin && !hasCustomBranches,
    staleTime: 2 * 60 * 1000,
  });

  // Consolidate branches: prefer customBranches (if non-empty) -> API branches -> institute store
  const rawBranches = useMemo(() => {
    if (hasCustomBranches) return customBranches;
    if (Array.isArray(apiBranches) && apiBranches.length > 0) return apiBranches;
    const storeBranches = currentInstitute?.branches || user?.institute?.branches || user?.branches;
    if (Array.isArray(storeBranches) && storeBranches.length > 0) return storeBranches;
    return Array.isArray(apiBranches) ? apiBranches : [];
  }, [hasCustomBranches, customBranches, apiBranches, currentInstitute?.branches, user?.institute?.branches, user?.branches]);

  const branchList = useMemo(() => {
    if (!Array.isArray(rawBranches)) {
      return Array.isArray(rawBranches?.data) ? rawBranches.data : [];
    }
    return rawBranches;
  }, [rawBranches]);

  useEffect(() => {
    if (branchList.length > 0) {
      registerBranches(branchList);
    }
  }, [branchList]);

  // Find the Main Branch
  const mainBranch = useMemo(() => {
    if (!branchList || branchList.length === 0) return null;
    return (
      branchList.find((b) => b.is_main === true || b.is_main === 'true') ||
      branchList.find((b) => {
        const code = String(b.code || '').toUpperCase();
        return code.endsWith('-MAIN') || code === 'MAIN';
      }) ||
      branchList.find((b) => String(b.name || b.label || '').toLowerCase().includes('main')) ||
      branchList[0]
    );
  }, [branchList]);

  // Default branch to pre-select for Super Admin
  const defaultBranchId = useMemo(() => {
    if (!branchList || branchList.length === 0) return '';
    if (activeBranchId && activeBranchId !== 'all' && branchList.some((b) => String(b.id || b.value) === String(activeBranchId))) {
      return String(activeBranchId);
    }
    const mainId = mainBranch?.id || mainBranch?.value;
    return mainId ? String(mainId) : String(branchList[0].id || branchList[0].value || '');
  }, [branchList, activeBranchId, mainBranch]);

  // Read current field value
  const watchedValue = control ? useWatch({ control, name }) : (watch ? watch(name) : undefined);
  const currentValue = watchedValue;

  // 1. Background auto-tagging for Branch Admin
  useEffect(() => {
    if (isBranchAdmin && setValue) {
      const branchId = assignedBranch?.id || user?.branch_id || user?.branch?.id;
      if (branchId && String(currentValue || '') !== String(branchId)) {
        setValue(name, String(branchId), { shouldValidate: true, shouldDirty: false });
      }
    }
  }, [isBranchAdmin, assignedBranch?.id, user?.branch_id, user?.branch?.id, name, setValue, currentValue]);

  // 2. Auto-tag single branch if institute only has 1 branch
  useEffect(() => {
    if (!isBranchAdmin && setValue && branchList.length === 1) {
      const singleBranchId = String(branchList[0].id || branchList[0].value || '');
      if (singleBranchId && String(currentValue || '') !== singleBranchId) {
        setValue(name, singleBranchId, { shouldValidate: true, shouldDirty: false });
      }
    }
  }, [isBranchAdmin, setValue, branchList, currentValue, name]);

  // 3. Pre-select Main Branch for Super Admin when multiple branches exist and field is empty
  useEffect(() => {
    if (!isBranchAdmin && setValue && branchList.length > 1 && defaultBranchId && required) {
      if (!currentValue || currentValue === '') {
        setValue(name, defaultBranchId, { shouldValidate: true, shouldDirty: false });
      }
    }
  }, [isBranchAdmin, setValue, branchList.length, defaultBranchId, currentValue, name, required]);

  // Case 1: Branch Admin -> completely hidden
  if (isBranchAdmin) {
    const branchId = assignedBranch?.id || user?.branch_id || user?.branch?.id || '';
    return register ? <input type="hidden" {...register(name)} value={branchId} /> : null;
  }

  // Case 2: Loading state when no branches loaded yet
  if (isLoading && branchList.length === 0) {
    return (
      <div className={className}>
        <SelectField
          label={label}
          name={name}
          control={control}
          register={register}
          options={[]}
          disabled={true}
          placeholder="Loading branches..."
          hint={hint}
        />
      </div>
    );
  }

  // Case 3: Only 1 branch (or 0 branches) -> do NOT ask for branch
  if (branchList.length <= 1) {
    const singleBranchId = branchList[0] ? String(branchList[0].id || branchList[0].value || '') : '';
    return register ? <input type="hidden" {...register(name)} value={singleBranchId} /> : null;
  }

  // Case 4: Multiple branches -> show select with main branch pre-selected & rest of branches listed
  const branchOptions = branchList.map((b) => {
    const val = String(b.id || b.value || '');
    const isMain = b.is_main === true || b.is_main === 'true' ||
      String(b.code || '').toUpperCase().endsWith('-MAIN') ||
      String(b.code || '').toUpperCase() === 'MAIN' ||
      String(b.name || b.label || '').toLowerCase().includes('main');
    const baseLabel = b.name || b.label || b.branch_name || resolveBranchName(val, 'Branch');
    const displayLabel = isMain && !baseLabel.toLowerCase().includes('(main')
      ? `${baseLabel} (Main)`
      : baseLabel;

    return {
      value: val,
      label: displayLabel,
    };
  });

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
