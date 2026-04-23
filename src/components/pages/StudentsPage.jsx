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

/**
 * StudentsPage — Adaptive for all institute types
 * Uses DELETE API with type parameter for Activate/Deactivate/Delete
 */
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Plus, Eye, Pencil, Trash2, Loader2, IdCard, Power, Filter,
  GraduationCap, Users, BookOpen, School, Building2, Layers,
  Calendar, Mail, Phone, MapPin, Shield
} from 'lucide-react';
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
import SelectField from '@/components/common/SelectField';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { cn } from '@/lib/utils';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Type-based terminology mapper
const getTerminology = (type) => {
  const terms = {
    school: {
      student: 'Student',
      students: 'Students',
      primaryUnit: 'Class',
      primaryUnitPlural: 'Classes',
      groupingUnit: 'Section',
      groupingUnitPlural: 'Sections',
      addButton: 'Add Student',
      searchPlaceholder: 'Search students...',
      emptyMessage: 'No students found',
      selectClass: 'Select Class',
      selectSection: 'Select Section',
      rollNumber: 'Roll Number',
    },
    coaching: {
      student: 'Candidate',
      students: 'Candidates',
      primaryUnit: 'Course',
      primaryUnitPlural: 'Courses',
      groupingUnit: 'Batch',
      groupingUnitPlural: 'Batches',
      addButton: 'Add Candidate',
      searchPlaceholder: 'Search candidates...',
      emptyMessage: 'No candidates found',
      selectClass: 'Select Course',
      selectSection: 'Select Batch',
      rollNumber: 'Candidate ID',
    },
    academy: {
      student: 'Trainee',
      students: 'Trainees',
      primaryUnit: 'Program',
      primaryUnitPlural: 'Programs',
      groupingUnit: 'Batch',
      groupingUnitPlural: 'Batches',
      addButton: 'Add Trainee',
      searchPlaceholder: 'Search trainees...',
      emptyMessage: 'No trainees found',
      selectClass: 'Select Program',
      selectSection: 'Select Batch',
      rollNumber: 'Trainee ID',
    },
    college: {
      student: 'Student',
      students: 'Students',
      primaryUnit: 'Department',
      primaryUnitPlural: 'Departments',
      groupingUnit: 'Semester',
      groupingUnitPlural: 'Semesters',
      addButton: 'Add Student',
      searchPlaceholder: 'Search students...',
      emptyMessage: 'No students found',
      selectClass: 'Select Department',
      selectSection: 'Select Semester',
      rollNumber: 'Registration No',
    },
    university: {
      student: 'Student',
      students: 'Students',
      primaryUnit: 'Department',
      primaryUnitPlural: 'Departments',
      groupingUnit: 'Semester',
      groupingUnitPlural: 'Semesters',
      addButton: 'Add Student',
      searchPlaceholder: 'Search students...',
      emptyMessage: 'No students found',
      selectClass: 'Select Department',
      selectSection: 'Select Semester',
      rollNumber: 'Registration No',
    },
  };
  return terms[type] || terms.school;
};

// Helper to flatten student object
const flattenStudent = (s) => {
  if (!s) return s;
  const details = s.details?.studentDetails || {};
  const flat = { ...s, ...details, id: s.id };
  if (flat.date_of_birth && !flat.dob) flat.dob = flat.date_of_birth;
  return flat;
};

export default function StudentsPage({ type }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { currentInstitute } = useInstituteStore();
  const { studentColumns } = useInstituteConfig();
  
  const terms = getTerminology(type);

  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Filter state
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch academic years
  const { data: academicYearsData } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id],
    queryFn: () => academicYearService.getAll({
      institute_id: currentInstitute?.id,
      is_active: true
    }),
    enabled: !!currentInstitute?.id,
  });

  // Set current academic year as default
  useEffect(() => {
    if (academicYearsData?.data?.length > 0 && !academicYearId) {
      const currentYear = academicYearsData.data.find(y => y.is_current);
      if (currentYear) {
        setAcademicYearId(currentYear.id);
      } else if (academicYearsData.data.length > 0) {
        setAcademicYearId(academicYearsData.data[0].id);
      }
    }
  }, [academicYearsData?.data]);

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ['classes', academicYearId, type],
    queryFn: () => classService.getAll({
      academic_year_id: academicYearId,
      is_active: true,
      institute_type: type
    }),
    enabled: !!academicYearId,
  });

  // Extract sections
  const sections = useMemo(() => {
    if (!classId || !classesData?.data) return [];
    const selectedClass = classesData.data.find(c => String(c.id) === String(classId));
    return selectedClass?.sections || [];
  }, [classId, classesData?.data]);

  // Reset filters
  useEffect(() => {
    setClassId('');
    setSectionId('');
  }, [academicYearId]);

  useEffect(() => {
    setSectionId('');
  }, [classId]);

  // Single DELETE API mutation for all actions (Activate/Deactivate/Delete)
  const processStudentMutation = useMutation({
    mutationFn: async ({ id, actionType }) => {
      console.log(`📡 Calling DELETE API with type: ${actionType}`, { id });
      return await studentService.delete(id, actionType);
    },
    onSuccess: (response, variables) => {
      const { actionType } = variables;
      let message = '';
      
      if (actionType === 'delete') {
        message = `${terms.student} permanently deleted successfully`;
      } else if (actionType === 'active') {
        message = `${terms.student} activated successfully`;
      } else {
        message = `${terms.student} deactivated successfully`;
      }
      
      toast.success(message);
      qc.invalidateQueries({ queryKey: ['students', type] });
      qc.invalidateQueries({ queryKey: ['students', type, filters] });
      setConfirmDialog(null);
    },
    onError: (error, variables) => {
      console.error('API Error:', error);
      const action = variables.actionType === 'active' ? 'activate' : 
                     variables.actionType === 'delete' ? 'delete' : 'deactivate';
      toast.error(error.message || `Failed to ${action} ${terms.student}`);
      setConfirmDialog(null);
    }
  });

  // Add Student Mutation
  const addStudent = useMutation({
    mutationFn: async (data) => {
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

  // Update Student Mutation
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

  // Handlers using single DELETE API
  const handleActivate = (id) => {
    setConfirmDialog({
      id,
      actionType: 'active',
      title: `Activate ${terms.student}`,
      description: `Are you sure you want to activate this ${terms.student.toLowerCase()}? They will be able to access the system.`,
      confirmLabel: 'Activate',
      variant: 'default'
    });
  };

  const handleDeactivate = (id) => {
    setConfirmDialog({
      id,
      actionType: 'inactive',
      title: `Deactivate ${terms.student}`,
      description: `Are you sure you want to deactivate this ${terms.student.toLowerCase()}? They will not be able to access the system.`,
      confirmLabel: 'Deactivate',
      variant: 'warning'
    });
  };

  const handlePermanentDelete = (student) => {
    setConfirmDialog({
      id: student.id,
      actionType: 'delete',
      title: `Permanently Delete ${terms.student}`,
      description: `Are you sure you want to permanently delete ${student.first_name} ${student.last_name}? This action cannot be undone. All data including documents and QR code will be removed.`,
      confirmLabel: 'Permanently Delete',
      variant: 'destructive'
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog) return;
    processStudentMutation.mutate({ 
      id: confirmDialog.id, 
      actionType: confirmDialog.actionType 
    });
  };

  const filters = useMemo(() => {
    const f = { page, limit: pageSize, search };
    
    if (status === 'active') f.is_active = true;
    else if (status === 'inactive') f.is_active = false;
    
    if (academicYearId) f.academic_year_id = academicYearId;
    
    if (classId) {
      if (type === 'school') f.class_id = classId;
      else if (type === 'coaching') f.course_id = classId;
      else if (type === 'academy') f.program_id = classId;
      else f.department_id = classId;
    }
    
    if (sectionId) {
      if (type === 'school') f.section_id = sectionId;
      else if (type === 'coaching' || type === 'academy') f.batch_id = sectionId;
      else f.semester_id = sectionId;
    }
    
    return f;
  }, [page, pageSize, search, status, academicYearId, classId, sectionId, type]);

  const { data, isLoading } = useQuery({
    queryKey: ['students', type, filters],
    queryFn: async () => {
      const res = await studentService.getAll(filters, type);
      if (res.data && Array.isArray(res.data)) {
        res.data = res.data.map(flattenStudent);
      }
      return res;
    },
    enabled: !!classId,
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

  const handleGenerateIdCard = async (student) => {
    try {
      toast.loading("Generating ID Card...", { id: "id-card" });
      const policy = useAuthStore.getState().getLatestPolicy('id_card');
      const policyConfig = policy?.config || {};
      await generateAndDownloadIdCard({
        person: student,
        institute: currentInstitute,
        policyConfig,
      });
      toast.success("ID Card Ready", { id: "id-card" });
    } catch (error) {
      toast.error(error.message, { id: "id-card" });
    }
  };

  // Build columns dynamically
  const columns = useMemo(() => {
    const cols = (studentColumns || []).map((col) => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row }) => <StudentCell student={row.original} columnKey={col.key} type={type} terms={terms} />,
    }));

    // Status column
    cols.push({
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'} className="capitalize">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    });

    // Actions column
    cols.push({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const stu = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {/* View */}
            <SimpleTooltip content={`View ${terms.student} Details`} side="top">
              <button
                onClick={() => router.push(`/${type}/students/${stu.id}`)}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
              >
                <Eye size={14} />
              </button>
            </SimpleTooltip>

            {/* Edit */}
            {canDo('students.update') && (
              <SimpleTooltip content={`Edit ${terms.student}`} side="top">
                <button
                  onClick={() => setEditingId(stu.id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </SimpleTooltip>
            )}

            {/* Activate/Deactivate - Uses same DELETE API with type */}
            {canDo('students.update') && (
              stu.is_active ? (
                <SimpleTooltip content={`Deactivate ${terms.student}`} side="top">
                  <button
                    onClick={() => handleDeactivate(stu.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Power size={14} />
                  </button>
                </SimpleTooltip>
              ) : (
                <SimpleTooltip content={`Activate ${terms.student}`} side="top">
                  <button
                    onClick={() => handleActivate(stu.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Power size={14} />
                  </button>
                </SimpleTooltip>
              )
            )}

            {/* Generate ID Card */}
            {canDo('students.read') && (
              <SimpleTooltip content="Generate ID Card" side="top">
                <button
                  onClick={() => handleGenerateIdCard(stu)}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <IdCard size={14} />
                </button>
              </SimpleTooltip>
            )}

            {/* Permanent Delete */}
            {canDo('students.delete') && (
              <SimpleTooltip content={`Permanently Delete ${terms.student}`} side="top">
                <button
                  onClick={() => handlePermanentDelete(stu)}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </SimpleTooltip>
            )}
          </div>
        );
      },
    });

    return cols;
  }, [studentColumns, type, terms, canDo, router]);

  // Options for SelectField
  const statusOptions = [
    { value: 'all', label: `All ${terms.students}` },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
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

  const addButton = canDo('students.create') ? (
    <SimpleTooltip content={`Add new ${terms.student.toLowerCase()}`} side="bottom">
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
      >
        <Plus size={14} /> Add {terms.student}
      </button>
    </SimpleTooltip>
  ) : null;

  // Export rows
  const studentExportRows = useMemo(() => {
    return students.map((s) => {
      const val = (k) => s[k] ?? s.details?.studentDetails?.[k] ?? '';
      return {
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        email: s.email || '',
        phone: s.phone || '',
        status: s.is_active ? 'Active' : 'Inactive',
        roll_number: val('roll_no') || val('roll_number') || '',
        class_name: val('class_name') || s.class?.name || '',
        section_name: val('section_name') || s.section?.name || '',
      };
    });
  }, [students]);

  // // Import columns
  // const ALL_STUDENT_COLUMNS = [
  //   { key: 'first_name', label: 'First Name', required: true },
  //   { key: 'last_name', label: 'Last Name', required: true },
  //   { key: 'email', label: 'Email', required: false },
  //   { key: 'phone', label: 'Phone', required: false },
  //   { key: 'academic_year_name', label: 'Academic Year', required: true },
  //   { key: 'class_name', label: terms.primaryUnit, required: true },
  //   { key: 'section_name', label: terms.groupingUnit, required: false },
  //   { key: 'roll_no', label: terms.rollNumber, required: false },
  //   { key: 'guardian_name', label: 'Guardian Name', required: false },
  //   { key: 'guardian_phone', label: 'Guardian Phone', required: false },
  // ];

  
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
    { key: 'fee_status', label: 'Fee Status', required: false, validation: 'select', options: ['pending', 'overdue', 'partial'] },

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

  const handleBulkImport = async (importedData) => {
    if (!importedData || importedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    try {
      const toastId = toast.loading(`Importing ${importedData.length} ${terms.students}...`);
      const response = await studentService.bulkCreate(importedData, type);
      toast.dismiss(toastId);

      if (response?.data?.failed?.length > 0) {
        toast.warning(`✅ ${response.data.imported} imported | ❌ ${response.data.failed.length} failed`);
      } else if (response?.data?.imported === response?.data?.total) {
        toast.success(`🎉 Successfully imported ${response.data.imported} ${terms.students}!`);
      } else {
        toast.error('Import failed');
      }

      qc.invalidateQueries({ queryKey: ['students', type] });
    } catch (error) {
      toast.error(error.message || 'Failed to import students');
    }
  };

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* Academic Year Filter - Using SelectField */}
            <SelectField
              label="Academic Year"
              value={academicYearId}
              onChange={setAcademicYearId}
              options={academicYearOptions}
              placeholder="Select Year"
            />

            {/* Primary Unit Filter */}
            <SelectField
              label={terms.primaryUnit}
              value={classId}
              onChange={setClassId}
              options={classOptions}
              placeholder={terms.selectClass}
              disabled={!academicYearId}
            />

            {/* Grouping Unit Filter */}
            <SelectField
              label={terms.groupingUnit}
              value={sectionId}
              onChange={setSectionId}
              options={sectionOptions}
              placeholder={terms.selectSection}
              disabled={!classId || sections.length === 0}
            />

            {/* Status Filter */}
            <SelectField
              label="Student Status"
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              options={statusOptions}
              placeholder="Select Status"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage={!classId ? `Select a ${terms.primaryUnit.toLowerCase()} to view ${terms.students.toLowerCase()}` : `No ${terms.students.toLowerCase()} found`}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={terms.searchPlaceholder}
        action={addButton}
        enableColumnVisibility
        importConfig={{
          columns: ALL_STUDENT_COLUMNS,
          onImport: handleBulkImport,
          fileName: `${type}-${terms.students.toLowerCase()}-import`,
        }}
        exportConfig={{
          fileName: `${type}-${terms.students.toLowerCase()}`,
          exportRows: studentExportRows,
        }}
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
          onSubmit={addStudent.mutate}
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
            onSubmit={updateStudent.mutate}
            onCancel={() => setEditingId(null)}
            loading={updateStudent.isPending}
            instituteType={type}
            instituteId={currentInstitute?.id}
            isEdit={true}
            defaultValues={studentToEdit}
          />
        )}
      </AppModal>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          onConfirm={handleConfirmAction}
          loading={processStudentMutation.isPending}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
        />
      )}
    </div>
  );
}

// StudentCell Component
function StudentCell({ student: s, columnKey, type, terms }) {
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
            {s.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{s.email}</span>
              </div>
            )}
          </div>
        </div>
      );
    
    case 'roll_number':
      return (
        <SimpleTooltip content={terms.rollNumber} side="top">
          <span className="font-mono text-xs cursor-help">
            {val('roll_no') || val('roll_number') || val('candidate_id') || val('trainee_id') || '—'}
          </span>
        </SimpleTooltip>
      );
    
    case 'phone':
      return (
        <SimpleTooltip content="Contact Number" side="top">
          <div className="flex items-center gap-1 cursor-help">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">{s.phone || '—'}</span>
          </div>
        </SimpleTooltip>
      );
    
    case 'cnic':
      return (
        <SimpleTooltip content="CNIC / B-Form Number" side="top">
          <div className="flex items-center gap-1 cursor-help">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-xs">{val('cnic') || '—'}</span>
          </div>
        </SimpleTooltip>
      );
    
    default:
      const defaultValue = val(columnKey);
      if (!defaultValue) return <span className="text-muted-foreground">—</span>;
      return (
        <SimpleTooltip content={columnKey.replace(/_/g, ' ')} side="top">
          <span className="cursor-help">{String(defaultValue)}</span>
        </SimpleTooltip>
      );
  }
}





