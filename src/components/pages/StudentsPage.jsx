/**
 * StudentsPage — Adaptive for all institute types
 *
 * School     → "Students"   | Class / Section filters
 * Coaching   → "Candidates" | Course / Batch filters
 * Academy    → "Trainees"   | Program / Batch filters
 * College    → "Students"   | Department / Semester filters
 * University → "Students"   | Faculty / Dept / Semester filters
 *
 * Uses shared DataTable component with @tanstack/react-table v8.
 */
'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { studentService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import StudentForm from '@/components/forms/StudentForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';

// Status badge color map
const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
};

// Build react-table ColumnDef[] dynamically from studentColumns config
function buildColumns(studentColumns, type, terms, canDo, router, onDelete, onEdit) {
  const cols = studentColumns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    cell: ({ row }) => <StudentCell student={row.original} columnKey={col.key} />,
    enableSorting: ['name', 'roll_number', 'cgpa'].includes(col.key),
  }));

  // Actions column
  cols.push({
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const stu = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/${type}/students/${stu.id}`)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
            title="View"
          >
            <Eye size={13} />
          </button>
          {canDo('students.update') && (
            <button
              onClick={() => onEdit(stu)} // Call the callback
              className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          {canDo('students.delete') && (
            <button
              onClick={() => onDelete(stu)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  });

  return cols;
}

// Helper to flatten student object
const flattenStudent = (s) => {
  if (!s) return s;
  const details = s.details?.studentDetails || {};
  const flat = { ...s, ...details, id: s.id }; // Ensure ID is preserved

  // Map fields for form compatibility
  if (flat.date_of_birth && !flat.dob) flat.dob = flat.date_of_birth;

  return flat;
};

export default function StudentsPage({ type }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { currentInstitute } = useInstituteStore();
  const { terms, studentColumns } = useInstituteConfig();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const addStudent = useMutation({
    mutationFn: async (data) => {
      // Direct API call without dummy fallback
      return await studentService.create(data, type);
    },
    onSuccess: () => {
      toast.success(`${terms.student} added successfully`);
      setIsAddModalOpen(false);
      qc.invalidateQueries({ queryKey: ['students', type] });
    },
    onError: (error) => {
      toast.error(error.message || `Failed to add ${terms.student}`);
    },
  });

  const updateStudent = useMutation({
    mutationFn: async (data) => {
      return await studentService.update(editingId, data);
    },
    onSuccess: () => {
      toast.success(`${terms.student} updated successfully`);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['students', type] });
      qc.invalidateQueries({ queryKey: ['student', editingId] });
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${terms.student}`);
    },
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      return await studentService.delete(id, type);
    },
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['students', type] });
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete');
    }
  });

  const filters = useMemo(() => ({
    page, limit: pageSize, search, is_active: status,
  }), [page, pageSize, search, status]);

  const { data, isLoading } = useQuery({
    queryKey: ['students', type, filters],
    queryFn: async () => {
      const res = await studentService.getAll(filters, type);
      // Flatten rows for easier consumption
      if (res.data && Array.isArray(res.data)) {
        res.data = res.data.map(flattenStudent);
      }
      return res;
    },
    placeholderData: (prev) => prev,
  });

  const { data: studentToEditData, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['student', editingId],
    queryFn: () => studentService.getById(editingId),
    enabled: !!editingId,
  });

  const studentToEdit = useMemo(() => {
    return flattenStudent(studentToEditData?.data || studentToEditData);
  }, [studentToEditData]);


  const students = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns = useMemo(
    () => buildColumns(studentColumns, type, terms, canDo, router, setDeleting, (stu) => setEditingId(stu.id)),
    [studentColumns, type, terms, canDo, router],
  );

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  const handleAddStudent = (formData) => {
    addStudent.mutate(formData);
  };

  const handleUpdateStudent = (formData) => {
    updateStudent.mutate(formData);
  };

  const addButton = canDo('students.create') ? (
    <button
      onClick={() => setIsAddModalOpen(true)}
      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
    >
      <Plus size={14} /> Add {terms.student}
    </button>
  ) : null;

  // StudentsPage mein — DataTable ko pass karne se pehle
  const studentExportRows = useMemo(() => {
    return students.map((s) => {
      const val = (k) => s[k] ?? s.details?.studentDetails?.[k] ?? '';
      return {
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        roll_number: val('roll_no') || val('roll_number') || val('candidate_id') ||
          val('trainee_id') || val('reg_number') || '',
        class_name: val('class_name') || s.class?.name || '',
        course_name: val('course_name') || s.course?.name || '',
        section_name: val('section_name') || s.section?.name || '',
        batch_name: val('batch_name') || s.batch?.name || '',
        semester: val('semester_name') ||
          (val('semester_number') ? `Semester ${val('semester_number')}` : ''),
        department: val('department_name') || s.department?.name || '',
        fee_status: s.fee_status || '',
        status: s.is_active ? 'Active' : 'Inactive',
        date_of_birth: val('date_of_birth')
          ? new Date(val('date_of_birth')).toLocaleDateString()
          : '',
        guardian: (() => {
          const g = val('guardians')?.[0] || {};
          const name = g.name || val('guardian_name') || '';
          const phone = g.phone || val('guardian_phone') || '';
          return name ? `${name} (${phone})`.trim() : '';
        })(),
      };
    });
  }, [students]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={terms.students}
        description={`${total} ${total === 1 ? terms.student : terms.students} total`}
      />

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage={`No ${terms.students.toLowerCase()} found`}
        // Toolbar props
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: statusOptions,
          },
        ]}
        action={addButton}
        enableColumnVisibility
        exportConfig={
          {
            fileName: `${type}-${terms.students.toLowerCase()}`,
            exportRows: studentExportRows,   // ← custom rows pass karo
          }
        }
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      {/* Add Student Modal */}
      <AppModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add ${terms.student}`}
        description={`Fill in the details to add a new ${terms.student.toLowerCase()}`}
        size="xl"
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setIsAddModalOpen(false)}
          loading={addStudent.isPending}
          instituteType={type}
          instituteId={currentInstitute?.id}
          isEdit={false}
        />
      </AppModal>

      {/* Edit Student Modal */}
      <AppModal
        open={!!editingId}
        onClose={() => setEditingId(null)}
        title={`Edit ${terms.student}`}
        description={`Update details for ${terms.student.toLowerCase()}`}
        size="xl"
      >
        {isLoadingEdit ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <StudentForm
            onSubmit={handleUpdateStudent}
            onCancel={() => setEditingId(null)}
            loading={updateStudent.isPending}
            instituteType={type}
            instituteId={currentInstitute?.id}
            isEdit={true}
            defaultValues={studentToEdit?.data || studentToEdit} /* Handle structure */
          />
        )}
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting?.id)}
        loading={remove.isPending}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleting?.first_name} ${deleting?.last_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cell renderer — per-column display logic
// ─────────────────────────────────────────────────────────────────────────────
function StudentCell({ student: s, columnKey }) {
  // Use flattened data where possible
  const val = (k) => s[k] ?? s.details?.studentDetails?.[k];

  switch (columnKey) {
    case 'name':
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {s.first_name?.[0]}{s.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium leading-tight">{s.first_name} {s.last_name}</p>
            {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
          </div>
        </div>
      );
    case 'roll_number':
      return <span className="font-mono text-xs">{val('roll_no') || val('roll_number') || val('candidate_id') || val('trainee_id') || val('reg_number') || '—'}</span>;
    case 'class_name': return <span>{val('class_name') || s.class?.name || '—'}</span>;
    case 'course_name': return <span>{val('course_name') || s.course?.name || '—'}</span>;
    case 'program_name': return <span>{val('program_name') || s.program?.name || '—'}</span>;
    case 'section_name': return <span>{val('section_name') || s.section?.name || '—'}</span>;
    case 'batch_name': return <span>{val('batch_name') || s.batch?.name || '—'}</span>;
    case 'semester': return <span>{val('semester_name') || s.semester?.name || (val('semester_number') ? `Semester ${val('semester_number')}` : '—')}</span>;
    case 'department': return <span>{val('department_name') || s.department?.name || '—'}</span>;
    case 'faculty': return <span>{val('faculty_name') || s.faculty?.name || '—'}</span>;
    case 'target_exam': return <span>{val('target_exam') || '—'}</span>;
    case 'module': return <span>{val('current_module') || '—'}</span>;
    case 'cgpa': return <span className="font-mono">{val('cgpa') ?? '—'}</span>;
    case 'fee_status': return displayFeeStatus(s.fee_status);
    case 'status':
      return (
        <span className={cn(
          "rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wide",
          s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
          {s.is_active ? 'Active' : 'Inactive'}
        </span>
      );
    case 'date_of_birth':
      return <span>{val('date_of_birth') ? new Date(val('date_of_birth')).toLocaleDateString() : '—'}</span>;
    case 'guardian': {
      const g = val('guardians')?.[0] || {};
      const name = g.name || val('guardian_name');
      if (!name) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col text-[11px] leading-tight">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground text-[10px]">{g.relation || val('guardian_relation')}</span>
          <span>{g.phone || val('guardian_phone')}</span>
        </div>
      );
    }
    default: return <span>{val(columnKey) ?? '—'}</span>;
  }
}

function displayFeeStatus(status) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const style = STATUS_COLORS[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wide', style)}>
      {status}
    </span>
  );
}









