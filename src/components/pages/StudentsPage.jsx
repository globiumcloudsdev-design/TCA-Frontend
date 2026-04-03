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

  // StudentsPage.jsx - Complete function

  const handleBulkImport = async (importedData) => {
    if (!importedData || importedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    try {
      // Show loading
      const toastId = toast.loading(`Importing ${importedData.length} ${terms.students}...`);

      // Call bulk import API
      const response = await studentService.bulkCreate(importedData, type);

      // Dismiss loading
      toast.dismiss(toastId);

      // Handle response
      if (response?.data?.failed?.length > 0) {
        // Partial success
        toast.warning(
          `✅ ${response.data.imported} imported | ❌ ${response.data.failed.length} failed`,
          {
            duration: 5000,
            description: 'Check console for failed rows details'
          }
        );
        console.log('Failed imports:', response.data.failed);
      } else if (response?.data?.imported === response?.data?.total) {
        // Full success
        toast.success(`🎉 Successfully imported ${response.data.imported} ${terms.students}!`);
      } else {
        // Failed
        toast.error(`Import failed: ${response?.data?.errors?.join(', ') || 'Unknown error'}`);
      }

      // Refresh data
      qc.invalidateQueries({ queryKey: ['students', type] });
      qc.invalidateQueries({ queryKey: ['students', type, filters] });

      return response;

    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to import students');
      throw error;
    }
  };

  // All possible columns from StudentForm
  const ALL_STUDENT_COLUMNS = [
    // Personal Information
    { key: 'first_name', label: 'First Name', required: true, validation: 'text' },
    { key: 'last_name', label: 'Last Name', required: true, validation: 'text' },
    { key: 'email', label: 'Email', required: false, validation: 'email' },
    { key: 'phone', label: 'Phone', required: false, validation: 'phone' },
    { key: 'registration_no', label: 'Registration No', required: false, validation: 'text' },
    { key: 'cnic', label: 'CNIC/B-Form', required: false, validation: 'cnic' },
    { key: 'dob', label: 'Date of Birth', required: false, validation: 'date' },
    { key: 'gender', label: 'Gender', required: false, validation: 'select', options: ['male', 'female', 'other'] },
    { key: 'blood_group', label: 'Blood Group', required: false, validation: 'select' },
    { key: 'religion', label: 'Religion', required: false, validation: 'text' },
    { key: 'nationality', label: 'Nationality', required: false, validation: 'text' },

    // Academic Information (Institute Type Specific)
    { key: 'class_name', label: 'Class/Course/Program', required: false, validation: 'text' },
    { key: 'section_name', label: 'Section/Batch', required: false, validation: 'text' },
    { key: 'roll_no', label: 'Roll Number', required: false, validation: 'text' },
    { key: 'academic_year', label: 'Academic Year', required: false, validation: 'text' },
    { key: 'admission_date', label: 'Admission Date', required: false, validation: 'date' },

    // Coaching Specific
    { key: 'course_name', label: 'Course Name', required: false, validation: 'text' },
    { key: 'batch_name', label: 'Batch Name', required: false, validation: 'text' },
    { key: 'target_exam', label: 'Target Exam', required: false, validation: 'text' },
    { key: 'current_module', label: 'Current Module', required: false, validation: 'text' },
    { key: 'candidate_id', label: 'Candidate ID', required: false, validation: 'text' },

    // College/University Specific
    { key: 'department_name', label: 'Department', required: false, validation: 'text' },
    { key: 'program_name', label: 'Program', required: false, validation: 'text' },
    { key: 'semester_name', label: 'Semester', required: false, validation: 'text' },
    { key: 'cgpa', label: 'CGPA', required: false, validation: 'number' },
    { key: 'faculty_name', label: 'Faculty', required: false, validation: 'text' },

    // Academy Specific
    { key: 'program_name', label: 'Program', required: false, validation: 'text' },
    { key: 'module_name', label: 'Module', required: false, validation: 'text' },
    { key: 'trainee_id', label: 'Trainee ID', required: false, validation: 'text' },

    // Guardian Information (Primary Guardian)
    { key: 'guardian_name', label: 'Guardian Name', required: false, validation: 'text' },
    { key: 'guardian_phone', label: 'Guardian Phone', required: false, validation: 'phone' },
    { key: 'guardian_cnic', label: 'Guardian CNIC', required: false, validation: 'cnic' },
    { key: 'guardian_email', label: 'Guardian Email', required: false, validation: 'email' },
    { key: 'guardian_relation', label: 'Guardian Relation', required: false, validation: 'text' },
    { key: 'guardian_type', label: 'Guardian Type', required: false, validation: 'select', options: ['father', 'mother', 'guardian'] },

    // Multiple Guardians (JSON format)
    { key: 'guardians', label: 'Guardians (JSON)', required: false, validation: 'json' },

    // Contact Information
    { key: 'present_address', label: 'Present Address', required: false, validation: 'text' },
    { key: 'permanent_address', label: 'Permanent Address', required: false, validation: 'text' },
    { key: 'city', label: 'City', required: false, validation: 'text' },

    // Emergency Contact
    { key: 'emergency_contact_name', label: 'Emergency Contact Person', required: false, validation: 'text' },
    { key: 'emergency_contact_relation', label: 'Emergency Contact Relation', required: false, validation: 'text' },
    { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', required: false, validation: 'phone' },

    // Fee Information
    { key: 'monthly_fee', label: 'Monthly Fee', required: false, validation: 'number' },
    { key: 'admission_fee', label: 'Admission Fee', required: false, validation: 'number' },
    { key: 'concession_type', label: 'Concession Type', required: false, validation: 'select', options: ['none', 'merit', 'need', 'staff', 'sibling'] },
    { key: 'concession_percentage', label: 'Concession Percentage', required: false, validation: 'number' },
    { key: 'concession_reason', label: 'Concession Reason', required: false, validation: 'text' },
    { key: 'fee_status', label: 'Fee Status', required: false, validation: 'select', options: ['paid', 'pending', 'overdue', 'partial'] },

    // Medical Information
    { key: 'medical_conditions', label: 'Medical Conditions', required: false, validation: 'text' },
    { key: 'allergies', label: 'Allergies', required: false, validation: 'text' },

    // Previous Education
    { key: 'previous_school', label: 'Previous School/College', required: false, validation: 'text' },
    { key: 'previous_class', label: 'Previous Class/Grade', required: false, validation: 'text' },

    // Status
    { key: 'is_active', label: 'Active Status', required: false, validation: 'boolean' },
    { key: 'status', label: 'Status', required: false, validation: 'select', options: ['active', 'inactive', 'graduated', 'transferred'] },

    // Additional Fields
    { key: 'father_name', label: 'Father Name', required: false, validation: 'text' },
    { key: 'father_cnic', label: 'Father CNIC', required: false, validation: 'cnic' },
    { key: 'father_phone', label: 'Father Phone', required: false, validation: 'phone' },
    { key: 'father_occupation', label: 'Father Occupation', required: false, validation: 'text' },
    { key: 'mother_name', label: 'Mother Name', required: false, validation: 'text' },
    { key: 'mother_cnic', label: 'Mother CNIC', required: false, validation: 'cnic' },
    { key: 'mother_phone', label: 'Mother Phone', required: false, validation: 'phone' },
    { key: 'address', label: 'Address', required: false, validation: 'text' },
  ];

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
        importConfig={{
          columns: ALL_STUDENT_COLUMNS.map(col => ({
            key: col.key,
            label: col.label,
            required: col.required || false,
            validation: col.validation || null,
            options: col.options || null
          })),
          onImport: handleBulkImport,
          fileName: `${type}-students-import`,
        }}
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









