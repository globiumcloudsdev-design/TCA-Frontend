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
const PERMISSION_GROUPS = [
  {
    module: 'Students',
    permissions: [
      { code: 'student.create', label: 'Create'  },
      { code: 'student.read',   label: 'View'    },
      { code: 'student.update', label: 'Edit'    },
      { code: 'student.delete', label: 'Delete'  },
      { code: 'student.export', label: 'Export'  },
    ],
  },
  {
    module: 'Teachers',
    permissions: [
      { code: 'teacher.create', label: 'Create' },
      { code: 'teacher.read',   label: 'View'   },
      { code: 'teacher.update', label: 'Edit'   },
      { code: 'teacher.delete', label: 'Delete' },
    ],
  },
  {
    module: 'Classes & Sections',
    permissions: [
      { code: 'class.create',   label: 'Create Class'   },
      { code: 'class.read',     label: 'View Classes'   },
      { code: 'class.update',   label: 'Edit Class'     },
      { code: 'class.delete',   label: 'Delete Class'   },
      { code: 'section.create', label: 'Create Section' },
      { code: 'section.read',   label: 'View Sections'  },
      { code: 'section.update', label: 'Edit Section'   },
      { code: 'section.delete', label: 'Delete Section' },
    ],
  },
  {
    module: 'Attendance',
    permissions: [
      { code: 'attendance.create', label: 'Mark'   },
      { code: 'attendance.read',   label: 'View'   },
      { code: 'attendance.update', label: 'Edit'   },
      { code: 'attendance.export', label: 'Export' },
    ],
  },
  {
    module: 'Fees',
    permissions: [
      { code: 'fee.create',  label: 'Create Voucher' },
      { code: 'fee.read',    label: 'View'           },
      { code: 'fee.update',  label: 'Edit'           },
      { code: 'fee.delete',  label: 'Delete'         },
      { code: 'fee.collect', label: 'Collect'        },
      { code: 'fee.refund',  label: 'Refund'         },
      { code: 'fee.export',  label: 'Export'         },
    ],
  },
  {
    module: 'Exams',
    permissions: [
      { code: 'exam.create',  label: 'Create'  },
      { code: 'exam.read',    label: 'View'    },
      { code: 'exam.update',  label: 'Edit'    },
      { code: 'exam.delete',  label: 'Delete'  },
      { code: 'exam.publish', label: 'Publish' },
    ],
  },
  {
    module: 'Roles',
    permissions: [
      { code: 'role.create', label: 'Create' },
      { code: 'role.read',   label: 'View'   },
      { code: 'role.update', label: 'Edit'   },
      { code: 'role.delete', label: 'Delete' },
      { code: 'role.assign', label: 'Assign' },
    ],
  },
  {
    module: 'Users',
    permissions: [
      { code: 'user.create', label: 'Create' },
      { code: 'user.read',   label: 'View'   },
      { code: 'user.update', label: 'Edit'   },
      { code: 'user.delete', label: 'Delete' },
    ],
  },
  {
    module: 'Academic Years',
    permissions: [
      { code: 'academic_year.create', label: 'Create' },
      { code: 'academic_year.read',   label: 'View'   },
      { code: 'academic_year.update', label: 'Edit'   },
      { code: 'academic_year.delete', label: 'Delete' },
    ],
  },
  {
    module: 'School',
    permissions: [
      { code: 'school.update',      label: 'Update Profile' },
      { code: 'school.settings',    label: 'Settings'       },
      { code: 'school.assign_role', label: 'Assign Roles'   },
    ],
  },
  {
    module: 'Reports',
    permissions: [
      { code: 'report.financial',  label: 'Financial'  },
      { code: 'report.attendance', label: 'Attendance' },
      { code: 'report.student',    label: 'Students'   },
      { code: 'report.exam',       label: 'Exams'      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function togglePermission(current = [], code) {
  return current.includes(code)
    ? current.filter((c) => c !== code)
    : [...current, code];
}

function toggleModule(current = [], module) {
  const codes = module.permissions.map((p) => p.code);
  const allSelected = codes.every((c) => current.includes(c));
  return allSelected
    ? current.filter((c) => !codes.includes(c))
    : [...new Set([...current, ...codes])];
}

// ─── Component ────────────────────────────────────────────────────────
export default function RoleForm({
  defaultValues = { name: '', code: '', permissions: [] },
  onSubmit,
  onCancel,
  loading = false,
  isEdit  = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Basic */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Role Name"
          name="name"
          register={register}
          error={errors.name}
          required
          placeholder="e.g. Class Teacher"
        />
        {!isEdit && (
          <InputField
            label="Role Code"
            name="code"
            register={register}
            error={errors.code}
            required
            placeholder="e.g. CLASS_TEACHER"
            hint="Uppercase, underscored, unique"
          />
        )}
      </div>

      <Separator />

      {/* Permissions */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Permissions
        </p>
        <Controller
          name="permissions"
          control={control}
          defaultValue={defaultValues.permissions ?? []}
          render={({ field }) => (
            <div className="space-y-5">
              {PERMISSION_GROUPS.map((group) => {
                const codes = group.permissions.map((p) => p.code);
                const allSelected = codes.every((c) => field.value.includes(c));
                const someSelected = codes.some((c) => field.value.includes(c));

                return (
                  <div key={group.module}>
                    {/* Module toggle */}
                    <div className="mb-2 flex items-center gap-2">
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
                    {/* Individual permissions */}
                    <div className="ml-6 flex flex-wrap gap-x-6 gap-y-2">
                      {group.permissions.map((perm) => (
                        <div key={perm.code} className="flex items-center gap-2">
                          <Checkbox
                            id={perm.code}
                            checked={field.value.includes(perm.code)}
                            onCheckedChange={() =>
                              field.onChange(togglePermission(field.value, perm.code))
                            }
                          />
                          <Label
                            htmlFor={perm.code}
                            className="cursor-pointer text-sm font-normal text-muted-foreground"
                          >
                            {perm.label}
                          </Label>
                        </div>
                      ))}
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
