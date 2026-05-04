
'use client';
/**
 * ParentsPage — Parent/Guardian management
 */
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCheck, Search, Eye, EyeOff, RefreshCw, Power, MoreHorizontal } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { TableRowActions } from '@/components/common';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { parentService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import PhoneInputField from '@/components/common/PhoneInput';
import CnicInput from '@/components/common/CnicInput';
import PasswordInputField from '@/components/common/PasswordInputField';
import StatsCard from '@/components/common/StatsCard';
import PageLoader from '@/components/common/PageLoader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const RELATION_OPTS = [
  { value: 'father', label: 'Father' }, 
  { value: 'mother', label: 'Mother' }, 
  { value: 'guardian', label: 'Guardian' }, 
  { value: 'other', label: 'Other' }
];

const STATUS_OPTS = [
  { value: 'active', label: 'Active' }, 
  { value: 'inactive', label: 'Inactive' }
];

const schema = z.object({
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number required'),
  relation: z.string().min(1, 'Relation required'),
  cnic: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  status: z.string().min(1, 'Status required'),
  password: z.string().optional(),
});

export default function ParentsPage({ type }) {
  const qc = useQueryClient();
  const router = useRouter();
  const { canDo } = useAuthStore();
  const canCreate = canDo('parents.create');
  const canUpdate = canDo('parents.update');
  const canDelete = canDo('parents.delete');
  const { terms } = useInstituteConfig();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [foundStudents, setFoundStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [findingStudents, setFindingStudents] = useState(false);
  const [showStudentWarning, setShowStudentWarning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, control, reset, getValues, formState: { errors } } = useForm({ 
    resolver: zodResolver(schema), 
    defaultValues: { status: 'active', relation: 'father', password: '' } 
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['parents', page, pageSize, search, statusFilter],
    queryFn: () => {
      const fetchFn = search ? parentService.search : parentService.getAll;
      return fetchFn({
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    },
  });

  const parents = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const canSubmit = editing || selectedStudentIds.length > 0;

  const save = useMutation({
    mutationFn: async (vals) => {
      const payload = { ...vals, student_ids: selectedStudentIds };
      if (!payload.password) delete payload.password;
      return editing ? parentService.update(editing.id, payload) : parentService.create(payload);
    },
    onSuccess: () => { 
      toast.success(editing ? 'Updated successfully' : 'Parent created successfully'); 
      qc.invalidateQueries({ queryKey: ['parents'] }); 
      closeModal(); 
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Save failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('student')) setShowStudentWarning(true);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => parentService.delete(id),
    onSuccess: () => { 
      toast.success('Deleted successfully'); 
      qc.invalidateQueries({ queryKey: ['parents'] }); 
      setDeleting(null); 
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Delete failed');
    },
  });

  const handleAdd = () => {
    setEditing(null);
    setFoundStudents([]);
    setSelectedStudentIds([]);
    reset({ status: 'active', relation: 'father', password: '' });
    setModal(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFoundStudents(Array.isArray(row.students) ? row.students : []);
    setSelectedStudentIds(Array.isArray(row.student_ids) ? row.student_ids : []);
    reset({ ...row, password: '' });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    reset();
  };

  const findStudents = async () => {
    try {
      setFindingStudents(true);
      const vals = getValues();
      const result = await parentService.findStudents({
        first_name: vals.first_name,
        last_name: vals.last_name,
        email: vals.email,
        phone: vals.phone,
        cnic: vals.cnic,
      });
      const list = Array.isArray(result?.data) ? result.data : [];
      setFoundStudents(list);
      if (!editing) setSelectedStudentIds(list.map(s => s.id));
    } catch (error) {
      toast.error(error?.message || 'Failed to find students');
    } finally {
      setFindingStudents(false);
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => (
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    ));
    if (showStudentWarning) setShowStudentWarning(false);
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(foundStudents.map(s => s.id));
  };

  const clearAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      header: 'Parent/Guardian', 
      cell: ({ row: { original: r } }) => (
        <div>
          <p className="font-medium">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-muted-foreground">{r.email || r.phone}</p>
        </div>
      )
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'relation', header: 'Relation', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'children', header: `${terms.students}` },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ getValue }) => (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
          {getValue()}
        </span>
      ) 
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-center">
            <TableRowActions
              onView={() => router.push(`/${type}/parents/${p.id}`)}
              onEdit={canUpdate ? () => handleEdit(p) : undefined}
              onDelete={canDelete ? () => setDeleting(p) : undefined}
              extra={canUpdate ? [
                {
                  label: p.status === 'active' ? 'Deactivate' : 'Activate',
                  icon: Power,
                  onClick: () => save.mutate({ ...p, status: p.status === 'active' ? 'inactive' : 'active' })
                }
              ] : []}
            />
          </div>
        );
      },
    },
  ], [canUpdate, canDelete, type, router, terms]);

  if (!mounted) return null;

  // Loading
  if (isLoading && !data && !search) {
    return <PageLoader message={`Loading ${terms.parents || 'parents'}...`} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parents & Guardians"
        description={`${total} parents registered`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={cn('mr-1', isFetching && 'animate-spin')} /> Refresh
            </Button>
            {canCreate && (
              <Button onClick={handleAdd} className="gap-1.5">
                <Plus size={15} /> Add Parent
              </Button>
            )}
          </div>
        }
      />
      
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Parents" value={total} icon={<UserCheck size={18} />} />
        <StatsCard label="Active" value={parents.filter(r => r.status === 'active').length} icon={<UserCheck size={18} />} />
        <StatsCard label="Linked Students" value={parents.reduce((s, r) => s + (r.children ?? 0), 0)} icon={<UserCheck size={18} />} />
      </div>
      
      <DataTable
        columns={columns}
        data={parents}
        loading={isLoading || isFetching}
        emptyMessage="No parents found"
        search={search} 
        onSearch={(v) => { setSearch(v); setPage(1); }} 
        searchPlaceholder="Search parents…"
        filters={[
          { 
            name: 'status', 
            label: 'Status', 
            onChange: (v) => { setStatusFilter(v); setPage(1); }, 
            options: STATUS_OPTS 
          }
        ]}
        enableColumnVisibility
        exportConfig={{ fileName: 'parents' }}
        pagination={{ 
          page, 
          totalPages, 
          onPageChange: setPage, 
          total, 
          pageSize, 
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); } 
        }}
      />

      <AppModal 
        open={modal} 
        onClose={closeModal} 
        title={editing ? 'Edit Parent' : 'New Parent'} 
        size="lg"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="parent-form" 
              disabled={save.isPending || (!editing && !canSubmit)}
              title={!editing && !canSubmit ? "Please select at least one student" : ""}
            >
              {save.isPending ? 'Saving…' : editing ? 'Update' : 'Add Parent'}
            </Button>
          </div>
        }
      >
        <form id="parent-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name *"
              name="first_name"
              register={register}
              error={errors.first_name}
              placeholder="e.g. Hassan"
              required
            />
            <InputField
              label="Last Name *"
              name="last_name"
              register={register}
              error={errors.last_name}
              placeholder="e.g. Raza"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInputField
                  label="Phone *"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.phone}
                  required
                />
              )}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="hassan.raza@example.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="cnic"
              control={control}
              render={({ field }) => (
                <CnicInput
                  label="CNIC"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.cnic}
                />
              )}
            />
            <InputField
              label="Occupation"
              name="occupation"
              register={register}
              error={errors.occupation}
              placeholder="e.g. Software Engineer"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <SelectField 
              label="Relation *" 
              name="relation" 
              control={control} 
              error={errors.relation} 
              options={RELATION_OPTS} 
              required 
            />
            <SelectField 
              label="Status *" 
              name="status" 
              control={control} 
              error={errors.status} 
              options={STATUS_OPTS} 
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <InputField
              label="Address"
              name="address"
              register={register}
              error={errors.address}
              placeholder="e.g. House 123, Block A, North Nazimabad, Karachi"
            />
          </div>

          {/* Password field for new parents */}
          {!editing && (
            <PasswordInputField
              label="Password (Leave empty to auto-generate)"
              name="password"
              register={register}
              error={errors.password}
              placeholder="Enter password or leave blank"
            />
          )}

          {/* Students Section */}
          <div className={cn(
            "rounded-lg border p-3 space-y-3",
            !editing && !canSubmit && selectedStudentIds.length === 0 && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
          )}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Linked {terms.students}</p>
                <p className="text-xs text-muted-foreground">Use parent info to find and attach students</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={findStudents}
                disabled={findingStudents}
                className="gap-1.5"
              >
                <Search size={14} />
                {findingStudents ? 'Finding…' : 'Find Students'}
              </Button>
            </div>

            {/* Warning message for no students selected */}
            {!editing && selectedStudentIds.length === 0 && (
              <div className="text-sm text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>Please select at least one student to link with this parent</span>
              </div>
            )}

            {showStudentWarning && (
              <div className="text-sm text-red-700 bg-red-100 dark:bg-red-900/30 p-2 rounded-md flex items-center gap-2">
                <span className="text-lg">❌</span>
                <span>Failed to save. Please ensure at least one student is selected.</span>
              </div>
            )}

            {foundStudents.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium">Found Students: {foundStudents.length}</p>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={selectAllStudents}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllStudents}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="max-h-48 overflow-auto space-y-2 border rounded-md p-2">
                  {foundStudents.map((s) => (
                    <label key={s.id} className="flex items-start gap-3 rounded border p-2 cursor-pointer hover:bg-accent/40">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <p className="font-medium">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.registration_no || '—'} | {s.class_name || '—'} - {s.section_name || '—'} | Roll: {s.roll_no || '—'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  Click "Find Students" to search and link students
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Parent's name, email, phone, or CNIC will be used to find matching students
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-xs font-medium">
                Selected: <span className={cn(
                  selectedStudentIds.length === 0 && "text-yellow-600 font-bold"
                )}>{selectedStudentIds.length}</span> {terms.students}
              </p>
              {!editing && selectedStudentIds.length === 0 && (
                <span className="text-xs text-yellow-600">* Required</span>
              )}
            </div>
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm Modal */}
      <AppModal 
        open={!!deleting} 
        onClose={() => setDeleting(null)} 
        title="Delete Parent" 
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => remove.mutate(deleting.id)} 
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}