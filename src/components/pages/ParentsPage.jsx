'use client';
/**
 * ParentsPage — Parent/Guardian management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCheck, Search } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { parentService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';

const RELATION_OPTS = [{ value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' }, { value: 'guardian', label: 'Guardian' }, { value: 'other', label: 'Other' }];
const STATUS_OPTS = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];

const schema = z.object({
  first_name: z.string().min(2, 'Required'),
  last_name: z.string().min(2, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10, 'Required'),
  relation: z.string().min(1, 'Required'),
  cnic: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  status: z.string().min(1, 'Required'),
});

export default function ParentsPage({ type }) {
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [foundStudents, setFoundStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [findingStudents, setFindingStudents] = useState(false);

  const { register, handleSubmit, control, reset, getValues, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'active', relation: 'father' } });

  const { data, isLoading } = useQuery({
    queryKey: ['parents', type, page, pageSize, search, status],
    queryFn: () => parentService.getAll({ page, limit: pageSize, search, status }),
    placeholderData: (p) => p,
  });

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      const payload = {
        ...vals,
        student_ids: selectedStudentIds,
      };
      return editing ? parentService.update(editing.id, payload) : parentService.create(payload);
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['parents'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: (id) => parentService.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['parents'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd = () => {
    setEditing(null);
    setFoundStudents([]);
    setSelectedStudentIds([]);
    reset({ status: 'active', relation: 'father' });
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFoundStudents(Array.isArray(row.students) ? row.students : []);
    setSelectedStudentIds(Array.isArray(row.student_ids) ? row.student_ids : []);
    reset({ ...row });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setFoundStudents([]);
    setSelectedStudentIds([]);
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
      setSelectedStudentIds((prev) => {
        const existing = new Set(prev);
        list.forEach((s) => {
          if (existing.has(s.id)) return;
        });
        return prev;
      });

      if (list.length === 0) {
        toast.info('No matching students found for this parent info');
      } else {
        toast.success(`${list.length} student(s) found`);
      }
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
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      accessorFn: (row) =>                          // ← add karo
        `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      header: 'Parent/Guardian', cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-xs text-muted-foreground">{r.email || r.phone}</p></div>
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'relation', header: 'Relation', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'children', header: `${terms.students}`, cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    {
      id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {canDo('parents.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
          {canDo('parents.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
        </div>
      )
    },
  ], [canDo, terms]);

  return (
    <div className="space-y-5">
      <PageHeader title="Parents & Guardians" description={`${total} registered`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Parents" value={total} icon={<UserCheck size={18} />} />
        <StatsCard label="Active" value={rows.filter(r => r.status === 'active').length} icon={<UserCheck size={18} />} />
        <StatsCard label="Linked Students" value={rows.reduce((s, r) => s + (r.children ?? 0), 0)} icon={<UserCheck size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No parents found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search parents…"
        filters={[{ name: 'status', label: 'Status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, options: STATUS_OPTS }]}
        action={canDo('parents.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Parent</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'parents' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Parent' : 'New Parent'} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="parent-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}</button></>}>
        <form id="parent-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">First Name *</label><input {...register('first_name')} className="input-base" />{errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Last Name *</label><input {...register('last_name')} className="input-base" />{errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone *</label><input {...register('phone')} className="input-base" />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><input type="email" {...register('email')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">CNIC</label><input {...register('cnic')} className="input-base" placeholder="XXXXX-XXXXXXX-X" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Occupation</label><input {...register('occupation')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Relation *" name="relation" control={control} error={errors.relation} options={RELATION_OPTS} required />
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><input {...register('address')} className="input-base" /></div>

          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Linked {terms.students}</p>
                <p className="text-xs text-muted-foreground">Use parent info to find and attach students</p>
              </div>
              <button
                type="button"
                onClick={findStudents}
                disabled={findingStudents}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-60"
              >
                <Search size={14} />
                {findingStudents ? 'Finding…' : 'Find Students'}
              </button>
            </div>

            {foundStudents.length > 0 ? (
              <div className="max-h-48 overflow-auto space-y-2">
                {foundStudents.map((s) => (
                  <label key={s.id} className="flex items-start gap-3 rounded border p-2 cursor-pointer hover:bg-accent/40">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.registration_no || '—'} | {s.class_name || '—'} - {s.section_name || '—'} | Roll: {s.roll_no || '—'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No linked students selected yet.</p>
            )}

            <p className="text-xs font-medium">Selected: {selectedStudentIds.length}</p>
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Parent" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
