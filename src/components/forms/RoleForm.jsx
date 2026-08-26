/**
 * RoleForm — Create / Edit role with full permission matrix
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object  { name, code, permissions: string[] }
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   isEdit         boolean
 */
'use client';

import { useForm, Controller } from 'react-hook-form';
import { InputField, FormSubmitButton } from '@/components/common';
import { Button }    from '@/components/ui/button';
import { Checkbox }  from '@/components/ui/checkbox';
import { Label }     from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// ─── Permission Matrix (grouped by module) ────────────────────────────
export const PERMISSION_GROUPS = [
  {
    module: 'Students',
    permissions: [
      { code: 'students.create', label: 'Create' },
      { code: 'students.read', label: 'View' },
      { code: 'students.update', label: 'Edit' },
      { code: 'students.delete', label: 'Delete' },
      { code: 'students.deactivate', label: 'Deactivate / Activate' },
      { code: 'students.export', label: 'Export' },
      { code: 'students.import', label: 'Import' },
      { code: 'students.bulk_actions', label: 'Bulk Actions' },
      { code: 'students.promote', label: 'Promote' },
      { code: 'students.transfer', label: 'Transfer' },
    ],
  },
  {
    module: 'Teachers',
    permissions: [
      { code: 'teachers.create', label: 'Create' },
      { code: 'teachers.read', label: 'View' },
      { code: 'teachers.update', label: 'Edit' },
      { code: 'teachers.delete', label: 'Delete' },
      { code: 'teachers.deactivate', label: 'Deactivate' },
      { code: 'teachers.leave_approve', label: 'Approve Leave' },
      { code: 'teachers.view_schedule', label: 'View Schedule' },
    ],
  },
  {
    module: 'Parents',
    permissions: [
      { code: 'parents.create', label: 'Create' },
      { code: 'parents.read', label: 'View' },
      { code: 'parents.update', label: 'Edit' },
      { code: 'parents.delete', label: 'Delete' },
      { code: 'parents.communicate', label: 'Communicate' },
      { code: 'parents.view_children', label: 'View Children' },
    ],
  },
  {
    module: 'Classes & Sections',
    permissions: [
      { code: 'classes.create', label: 'Create Class' },
      { code: 'classes.read', label: 'View Classes' },
      { code: 'classes.update', label: 'Edit Class' },
      { code: 'classes.delete', label: 'Delete Class' },
      { code: 'sections.create', label: 'Create Section' },
      { code: 'sections.read', label: 'View Sections' },
      { code: 'sections.update', label: 'Edit Section' },
      { code: 'sections.delete', label: 'Delete Section' },
    ],
  },
  {
    module: 'Subjects',
    permissions: [
      { code: 'subjects.create', label: 'Create' },
      { code: 'subjects.read', label: 'View' },
      { code: 'subjects.update', label: 'Edit' },
      { code: 'subjects.delete', label: 'Delete' },
    ],
  },
  {
    module: 'Attendance',
    permissions: [
      { code: 'attendance.mark', label: 'Mark Attendance' },
      { code: 'attendance.view', label: 'View Attendance' },
      { code: 'attendance.report', label: 'Attendance Report' },
      { code: 'attendance.export', label: 'Export' },
      { code: 'attendance.bulk_mark', label: 'Bulk Mark' },
      { code: 'attendance.self_mark', label: 'Self Mark' },
    ],
  },
  {
    module: 'Fees & Finance',
    permissions: [
      { code: 'fees.create', label: 'Create Voucher' },
      { code: 'fees.read', label: 'View Fees' },
      { code: 'fees.update', label: 'Edit Fees' },
      { code: 'fees.delete', label: 'Delete Fees' },
      { code: 'fees.collect', label: 'Collect Fee' },
      { code: 'fees.refund', label: 'Refund' },
      { code: 'fees.export', label: 'Export' },
      { code: 'fees.discount', label: 'Discount' },
      { code: 'fee_templates.create', label: 'Create Fee Template' },
      { code: 'fee_templates.read', label: 'View Fee Templates' },
      { code: 'fee_templates.update', label: 'Edit Fee Template' },
      { code: 'fee_templates.delete', label: 'Delete Fee Template' },
    ],
  },
  {
    module: 'Exams & Results',
    permissions: [
      { code: 'exams.create', label: 'Create Exam' },
      { code: 'exams.read', label: 'View Exams' },
      { code: 'exams.update', label: 'Edit Exam' },
      { code: 'exams.delete', label: 'Delete Exam' },
      { code: 'exam_results.enter', label: 'Enter Marks' },
      { code: 'exam_results.view', label: 'View Results' },
      { code: 'exam_results.publish', label: 'Publish Results' },
      { code: 'exam_results.delete', label: 'Delete Results' },
    ],
  },
  {
    module: 'Payroll',
    permissions: [
      { code: 'payroll.create', label: 'Create' },
      { code: 'payroll.read', label: 'View' },
      { code: 'payroll.process', label: 'Process' },
      { code: 'payroll.report', label: 'Report' },
    ],
  },
  {
    module: 'Notices & Communication',
    permissions: [
      { code: 'notices.create', label: 'Create Notice' },
      { code: 'notices.read', label: 'View Notices' },
      { code: 'notices.update', label: 'Edit Notice' },
      { code: 'notices.delete', label: 'Delete Notice' },
      { code: 'notifications.send', label: 'Send Notifications' },
    ],
  },
  {
    module: 'Roles & Users',
    permissions: [
      { code: 'roles.create', label: 'Create Role' },
      { code: 'roles.read', label: 'View Roles' },
      { code: 'roles.update', label: 'Edit Role' },
      { code: 'roles.delete', label: 'Delete Role' },
      { code: 'roles.assign', label: 'Assign Role' },
      { code: 'users.create', label: 'Create User' },
      { code: 'users.read', label: 'View Users' },
      { code: 'users.update', label: 'Edit User' },
      { code: 'users.delete', label: 'Delete User' },
    ],
  },
  {
    module: 'Academic Years',
    permissions: [
      { code: 'academic_years.create', label: 'Create' },
      { code: 'academic_years.read', label: 'View' },
      { code: 'academic_years.update', label: 'Edit' },
      { code: 'academic_years.delete', label: 'Delete' },
      { code: 'academic_years.activate', label: 'Activate' },
    ],
  },
  {
    module: 'Branches',
    permissions: [
      { code: 'branches.create', label: 'Create Branch' },
      { code: 'branches.read', label: 'View Branches' },
      { code: 'branches.update', label: 'Edit Branch' },
      { code: 'branches.delete', label: 'Delete Branch' },
    ],
  },
  {
    module: 'School Settings',
    permissions: [
      { code: 'settings.view', label: 'View Settings' },
      { code: 'settings.update', label: 'Update Settings' },
    ],
  },
  {
    module: 'Reports',
    permissions: [
      { code: 'reports.student', label: 'Student Reports' },
      { code: 'reports.attendance', label: 'Attendance Reports' },
      { code: 'reports.fee', label: 'Fee Reports' },
      { code: 'reports.exam', label: 'Exam Reports' },
      { code: 'reports.payroll', label: 'Payroll Reports' },
      { code: 'reports.export', label: 'Export Reports' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Expand permissions to include both plural and singular variants
 * so backend permission checks (whether 'students.delete' or 'student.delete') will ALWAYS succeed.
 */
function expandPermissions(perms = []) {
  const result = new Set();
  const aliasPairs = [
    ['student.', 'students.'],
    ['teacher.', 'teachers.'],
    ['parent.', 'parents.'],
    ['class.', 'classes.'],
    ['section.', 'sections.'],
    ['subject.', 'subjects.'],
    ['fee.', 'fees.'],
    ['fee_template.', 'fee_templates.'],
    ['exam.', 'exams.'],
    ['notice.', 'notices.'],
    ['role.', 'roles.'],
    ['user.', 'users.'],
    ['branch.', 'branches.'],
    ['academic_year.', 'academic_years.'],
    ['expense.', 'expenses.'],
    ['policy.', 'policies.'],
  ];

  perms.forEach((p) => {
    if (typeof p !== 'string' || !p.trim()) return;
    const str = p.trim();
    result.add(str);

    for (const [singular, plural] of aliasPairs) {
      if (str.startsWith(singular)) {
        result.add(str.replace(singular, plural));
      } else if (str.startsWith(plural)) {
        result.add(str.replace(plural, singular));
      }
    }
  });

  return Array.from(result);
}

/**
 * Check if permission list contains a given code (supporting aliases)
 */
function hasPerm(currentList = [], code) {
  if (!Array.isArray(currentList)) return false;
  if (currentList.includes(code)) return true;

  const aliasPairs = [
    ['student.', 'students.'],
    ['teacher.', 'teachers.'],
    ['parent.', 'parents.'],
    ['class.', 'classes.'],
    ['section.', 'sections.'],
    ['subject.', 'subjects.'],
    ['fee.', 'fees.'],
    ['fee_template.', 'fee_templates.'],
    ['exam.', 'exams.'],
    ['notice.', 'notices.'],
    ['role.', 'roles.'],
    ['user.', 'users.'],
    ['branch.', 'branches.'],
    ['academic_year.', 'academic_years.'],
  ];

  for (const [singular, plural] of aliasPairs) {
    if (code.startsWith(plural) && currentList.includes(code.replace(plural, singular))) return true;
    if (code.startsWith(singular) && currentList.includes(code.replace(singular, plural))) return true;
  }

  return false;
}

function togglePermission(current = [], code) {
  const isSelected = hasPerm(current, code);
  if (isSelected) {
    // Remove both singular and plural forms
    return current.filter((c) => {
      if (c === code) return false;
      if (code.startsWith('students.') && c === code.replace('students.', 'student.')) return false;
      if (code.startsWith('student.') && c === code.replace('student.', 'students.')) return false;
      if (code.startsWith('teachers.') && c === code.replace('teachers.', 'teacher.')) return false;
      if (code.startsWith('teacher.') && c === code.replace('teacher.', 'teachers.')) return false;
      if (code.startsWith('classes.') && c === code.replace('classes.', 'class.')) return false;
      if (code.startsWith('class.') && c === code.replace('class.', 'classes.')) return false;
      if (code.startsWith('sections.') && c === code.replace('sections.', 'section.')) return false;
      if (code.startsWith('section.') && c === code.replace('section.', 'sections.')) return false;
      if (code.startsWith('fees.') && c === code.replace('fees.', 'fee.')) return false;
      if (code.startsWith('fee.') && c === code.replace('fee.', 'fees.')) return false;
      if (code.startsWith('exams.') && c === code.replace('exams.', 'exam.')) return false;
      if (code.startsWith('exam.') && c === code.replace('exam.', 'exams.')) return false;
      if (code.startsWith('roles.') && c === code.replace('roles.', 'role.')) return false;
      if (code.startsWith('role.') && c === code.replace('role.', 'roles.')) return false;
      if (code.startsWith('users.') && c === code.replace('users.', 'user.')) return false;
      if (code.startsWith('user.') && c === code.replace('user.', 'users.')) return false;
      return true;
    });
  } else {
    return [...current, code];
  }
}

function toggleModule(current = [], module) {
  const codes = module.permissions.map((p) => p.code);
  const allSelected = codes.every((c) => hasPerm(current, c));

  if (allSelected) {
    // Deselect all in module
    return current.filter((c) => !codes.some((code) => {
      if (c === code) return true;
      if (code.startsWith('students.') && c === code.replace('students.', 'student.')) return true;
      if (code.startsWith('student.') && c === code.replace('student.', 'students.')) return true;
      if (code.startsWith('teachers.') && c === code.replace('teachers.', 'teacher.')) return true;
      if (code.startsWith('teacher.') && c === code.replace('teacher.', 'teachers.')) return true;
      if (code.startsWith('classes.') && c === code.replace('classes.', 'class.')) return true;
      if (code.startsWith('class.') && c === code.replace('class.', 'classes.')) return true;
      if (code.startsWith('sections.') && c === code.replace('sections.', 'section.')) return true;
      if (code.startsWith('section.') && c === code.replace('section.', 'sections.')) return true;
      if (code.startsWith('fees.') && c === code.replace('fees.', 'fee.')) return true;
      if (code.startsWith('fee.') && c === code.replace('fee.', 'fees.')) return true;
      if (code.startsWith('exams.') && c === code.replace('exams.', 'exam.')) return true;
      if (code.startsWith('exam.') && c === code.replace('exam.', 'exams.')) return true;
      if (code.startsWith('roles.') && c === code.replace('roles.', 'role.')) return true;
      if (code.startsWith('role.') && c === code.replace('role.', 'roles.')) return true;
      if (code.startsWith('users.') && c === code.replace('users.', 'user.')) return true;
      if (code.startsWith('user.') && c === code.replace('user.', 'users.')) return true;
      return false;
    }));
  } else {
    // Select all in module
    return [...new Set([...current, ...codes])];
  }
}

// ─── Component ────────────────────────────────────────────────────────
export default function RoleForm({
  defaultValues = { name: '', code: '', permissions: [] },
  onSubmit,
  onCancel,
  loading = false,
  isEdit  = false,
}) {
  const initialPerms = useMemo(() => {
    const raw = defaultValues.permissions ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [defaultValues.permissions]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...defaultValues,
      permissions: initialPerms,
    }
  });

  const currentPerms = watch('permissions') || [];

  const handleFormSubmit = (data) => {
    // Expand permissions so backend checks for either 'students.delete' or 'student.delete' succeed
    const expanded = expandPermissions(data.permissions || []);
    onSubmit({
      ...data,
      permissions: expanded,
    });
  };

  const handleSelectAll = () => {
    const allCodes = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.code));
    setValue('permissions', allCodes);
  };

  const handleDeselectAll = () => {
    setValue('permissions', []);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Basic */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Role Name"
          name="name"
          register={register}
          error={errors.name}
          required
          placeholder="e.g. Principal, Admin, Teacher"
        />
        {!isEdit && (
          <InputField
            label="Role Code"
            name="code"
            register={register}
            error={errors.code}
            required
            placeholder="e.g. SCHOOL_ADMIN, TEACHER"
            hint="Uppercase, underscored, unique"
          />
        )}
      </div>

      <Separator />

      {/* Permissions Header & Quick Toggles */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Permissions ({currentPerms.length} selected)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleDeselectAll}
            >
              Deselect All
            </Button>
          </div>
        </div>

        <Controller
          name="permissions"
          control={control}
          defaultValue={initialPerms}
          render={({ field }) => (
            <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-2">
              {PERMISSION_GROUPS.map((group) => {
                const codes = group.permissions.map((p) => p.code);
                const allSelected = codes.every((c) => hasPerm(field.value, c));
                const someSelected = codes.some((c) => hasPerm(field.value, c));

                return (
                  <div key={group.module} className="rounded-lg border p-3.5 bg-card">
                    {/* Module toggle */}
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`module-${group.module}`}
                          checked={allSelected}
                          data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                          onCheckedChange={() =>
                            field.onChange(toggleModule(field.value, group))
                          }
                        />
                        <Label
                          htmlFor={`module-${group.module}`}
                          className="cursor-pointer text-sm font-semibold"
                        >
                          {group.module}
                        </Label>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {codes.filter((c) => hasPerm(field.value, c)).length}/{codes.length}
                      </span>
                    </div>

                    <Separator className="my-2" />

                    {/* Individual permissions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {group.permissions.map((perm) => {
                        const checked = hasPerm(field.value, perm.code);
                        return (
                          <div
                            key={perm.code}
                            className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${
                              checked ? 'bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              id={perm.code}
                              checked={checked}
                              onCheckedChange={() =>
                                field.onChange(togglePermission(field.value, perm.code))
                              }
                            />
                            <Label
                              htmlFor={perm.code}
                              className="cursor-pointer text-xs font-normal text-foreground leading-none"
                            >
                              {perm.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create Role'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
        />
      </div>
    </form>
  );
}
