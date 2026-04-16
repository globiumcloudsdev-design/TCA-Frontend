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

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2, Loader2, IdCard, Power, Filter } from 'lucide-react';
import { toast } from 'sonner';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import { studentService, academicYearService, classService } from '@/services';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import StudentForm from '@/components/forms/StudentForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Status badge color map
const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
};

// Build react-table ColumnDef[] dynamically from studentColumns config
function buildColumns(studentColumns, type, terms, canDo, router, onDelete, onEdit, onGenerateIdCard, onToggleStatus) {
  const cols = studentColumns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    cell: ({ row }) => <StudentCell student={row.original} columnKey={col.key} />,
    enableSorting: ['name', 'roll_number', 'cgpa'].includes(col.key),
  }));

  // Actions column
  cols.push({
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'} className="capitalize">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
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
          {canDo('students.read') && (
            <button
              onClick={() => onGenerateIdCard(stu)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
              title="Generate ID Card"
            >
              <IdCard size={13} />
            </button>
          )}
          {canDo('students.update') && (
            <button
              onClick={() => onToggleStatus(stu.id, !stu.is_active)}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent",
                stu.is_active ? "text-amber-600" : "text-emerald-600"
              )}
              title={stu.is_active ? "Deactivate" : "Activate"}
            >
              <Power size={13} />
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
  const user = useAuthStore((s) => s.user);
  const { currentInstitute } = useInstituteStore();
  const { terms, studentColumns } = useInstituteConfig();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Filter state
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [feeStatus, setFeeStatus] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch academic years and set current as default
  const { data: academicYearsData } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id],
    queryFn: () => academicYearService.getAll({ 
      institute_id: currentInstitute?.id,
      is_active: true 
    }),
    enabled: !!currentInstitute?.id,
  });

  // Set current academic year as default on first load
  useEffect(() => {
    if (academicYearsData?.data && !academicYearId) {
      const currentYear = academicYearsData.data.find(y => y.is_current);
      if (currentYear) {
        setAcademicYearId(currentYear.id);
      } else if (academicYearsData.data.length > 0) {
        setAcademicYearId(academicYearsData.data[0].id);
      }
    }
  }, [academicYearsData?.data]);

  // Fetch classes for selected academic year
  const { data: classesData } = useQuery({
    queryKey: ['classes', academicYearId],
    queryFn: () => classService.getAll({ 
      academic_year_id: academicYearId,
      is_active: true 
    }),
    enabled: !!academicYearId,
  });

  // Extract sections from selected class
  const sections = useMemo(() => {
    if (!classId || !classesData?.data) return [];
    const selectedClass = classesData.data.find(c => String(c.id) === String(classId));
    return selectedClass?.sections || [];
  }, [classId, classesData?.data]);

  // Reset class and section when academic year changes
  useEffect(() => {
    setClassId('');
    setSectionId('');
  }, [academicYearId]);

  // Reset section when class changes
  useEffect(() => {
    setSectionId('');
  }, [classId]);

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

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => studentService.toggleStatus(id, is_active),
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? 'Student activated' : 'Student deactivated');
      qc.invalidateQueries({ queryKey: ['students', type] });
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      console.log('🚀 Deleting student:', { id, type });
      return await studentService.delete(id, type);
    },
    onSuccess: () => {
      toast.success('Student deleted successfully');
      console.log('✅ Student deleted, invalidating cache...');
      // Invalidate with exact query key including filters
      qc.invalidateQueries({ queryKey: ['students', type, filters] });
      // Also clear all students queries for this type as fallback
      qc.invalidateQueries({ queryKey: ['students'] });
      setDeleting(null);
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete student';
      toast.error(errorMsg);
    }
  });

  const filters = useMemo(() => {
    const f = {
      page, 
      limit: pageSize, 
      search, 
    };

    // Handle student status filter
    if (status === 'active') {
      f.is_active = true;
    } else if (status === 'inactive') {
      f.is_active = false;
    }
    // If status === 'all', don't add is_active filter (shows both active and inactive)

    // Add optional filters only if they're selected
    if (academicYearId) f.academic_year_id = academicYearId;
    if (classId) f.class_id = classId;
    if (sectionId) f.section_id = sectionId;
    if (feeStatus) f.fee_status = feeStatus;

    return f;
  }, [page, pageSize, search, status, academicYearId, classId, sectionId, feeStatus]);

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
    enabled: !!classId, // Only fetch when class is selected
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

  const handleGenerateIdCard = (student) => {
    const institute = currentInstitute || user?.institute || user?.school || {};
    generateAndDownloadIdCard({ role: 'student', person: student, institute });
  };

  const columns = useMemo(
    () => buildColumns(studentColumns, type, terms, canDo, router, setDeleting, (stu) => setEditingId(stu.id), handleGenerateIdCard, (id, is_active) => toggleStatusMutation.mutate({ id, is_active })),
    [studentColumns, type, terms, canDo, router, currentInstitute, user],
  );

  const statusOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const feeStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'partial', label: 'Partial' },
  ];

  const academicYearOptions = useMemo(() => {
    if (!academicYearsData?.data) return [];
    return academicYearsData.data.map(year => ({
      value: year.id,
      label: year.name || `${year.start_year} - ${year.end_year}`
    }));
  }, [academicYearsData?.data]);

  const classOptions = useMemo(() => {
    if (!classesData?.data) return [];
    return classesData.data.map(cls => ({
      value: cls.id,
      label: cls.name
    }));
  }, [classesData?.data]);

  const sectionOptions = useMemo(() => {
    return sections.map(s => ({
      value: s.id,
      label: s.name || s.section_name
    }));
  }, [sections]);

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

      // Normalize data: map frontend field names to backend field names
      const normalizedData = importedData.map(row => {
        const normalized = { ...row };
        
        // Map academy_program_name back to program_name for backend
        if (normalized.academy_program_name !== undefined) {
          normalized.program_name = normalized.academy_program_name;
          delete normalized.academy_program_name;
        }
        
        // Ensure academic_year_name is used (some fields might still have old names)
        if (normalized.academic_year && !normalized.academic_year_name) {
          normalized.academic_year_name = normalized.academic_year;
        }
        
        // Clean up empty values
        Object.keys(normalized).forEach(key => {
          if (normalized[key] === '' || normalized[key] === null || normalized[key] === undefined) {
            delete normalized[key];
          }
        });
        
        return normalized;
      });

      // Call bulk import API
      const response = await studentService.bulkCreate(normalizedData, type);

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
    { key: 'class_name', label: 'Class/Course/Program', required: true, validation: 'text' },
    { key: 'section_name', label: 'Section/Batch', required: false, validation: 'text' },
    { key: 'roll_no', label: 'Roll Number', required: false, validation: 'text' },
    { key: 'academic_year_name', label: 'Academic Year', required: true, validation: 'text' },
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
    { key: 'academy_program_name', label: 'Program', required: false, validation: 'text' },
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
    { key: 'fee_status', label: 'Fee Status', required: false, validation: 'select', options: [ 'pending', 'overdue', 'partial'] },

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

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={terms.students}
        description={`${total} ${total === 1 ? terms.student : terms.students} total`}
      />

      {/* Filters Card */}
      <Card className="border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            {/* Academic Year Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Academic Year
              </label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {academicYearOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {terms.class || 'Class'}
              </label>
              <Select value={classId} onValueChange={setClassId} disabled={!academicYearId}>
                <SelectTrigger className="w-full h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!academicYearId}>
                  <SelectValue placeholder={`Select ${terms.class || 'Class'}`} />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {classOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {terms.section || 'Section'}
              </label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!classId || sections.length === 0}>
                <SelectTrigger className="w-full h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!classId || sections.length === 0}>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {sectionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Student Status
              </label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fee Status Filter */}
            {/* <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Fee Status
              </label>
              <Select value={feeStatus} onValueChange={(v) => { setFeeStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select Fee Status" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {feeStatusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage={!classId ? `Select a ${terms.class || 'Class'} to view ${terms.students.toLowerCase()}` : `No ${terms.students.toLowerCase()} found`}
        // Toolbar props
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[]}
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
    case 'academy_program_name': return <span>{val('academy_program_name') || val('program_name') || s.program?.name || '—'}</span>;
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








