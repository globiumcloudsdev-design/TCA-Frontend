
// frontend/src/components/pages/ExamsPage.jsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, GraduationCap, Calendar, BookOpen, Pencil, Eye } from 'lucide-react';
import { format } from 'date-fns';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useBranchAccess from '@/hooks/useBranchAccess';
import { EXAM_TYPES } from '@/constants';

import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AppModal from '@/components/common/AppModal';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import PageLoader from '@/components/common/PageLoader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableRowActions from '@/components/common/TableRowActions';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { examService } from '@/services/examService';
import { classService } from '@/services/classService';
import ExamForm from '@/components/forms/ExamForm';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'results_published', label: 'Results Published' }
];

// Add "All Types" option to EXAM_TYPES for filtering
const EXAM_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  ...EXAM_TYPES
];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  results_published: 'bg-purple-100 text-purple-700'
};

export default function ExamsPage({ type }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canDo, isSuperAdmin, isBranchAdmin, user } = useAuthStore();
  const isAdminUser = isSuperAdmin?.() || isBranchAdmin?.() || ['SUPER_ADMIN', 'BRANCH_ADMIN', 'INSTITUTE_ADMIN'].includes(String(user?.role_code || user?.user_type || '').toUpperCase());
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();
  const { activeBranchId } = useBranchAccess();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [examType, setExamType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);
  const [publishingExam, setPublishingExam] = useState(null);
  const [statusExam, setStatusExam] = useState(null);

  const label = type === 'coaching' ? 'Test' : type === 'academy' ? 'Assessment' : 'Exam';
  const labelP = type === 'coaching' ? 'Tests' : type === 'academy' ? 'Assessments' : 'Exams';

  // Fetch exams
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exams', currentInstitute?.id, activeBranchId, page, pageSize, search, status, examType],
    queryFn: () => examService.getAll({
      institute_id: currentInstitute?.id,
      branch_id: activeBranchId || undefined,
      page,
      limit: pageSize,
      search,
      status: status !== 'all' ? status : undefined,
      type: examType !== 'all' ? examType : undefined
    }),
    enabled: !!currentInstitute?.id
  });

  const instituteId = currentInstitute?.id || user?.institute?.id || user?.school_id || user?.schoolId;

  // Fetch classes lookup for class & section names
  const { data: classesData } = useQuery({
    queryKey: ['classes-lookup', instituteId],
    queryFn: () => classService.getAll({
      institute_id: instituteId,
      fetchAll: true,
      limit: 1000
    }),
    enabled: true
  });

  const { classMap, sectionMap } = useMemo(() => {
    const rawClasses = classesData?.data?.rows || classesData?.rows || (Array.isArray(classesData?.data) ? classesData.data : []) || (Array.isArray(classesData) ? classesData : []);
    const cMap = {};
    const sMap = {};
    (rawClasses || []).forEach(cls => {
      if (cls && cls.id) {
        cMap[cls.id] = cls;
        (cls.sections || []).forEach(sec => {
          if (sec && sec.id) {
            sMap[sec.id] = sec;
          }
        });
      }
    });
    return { classMap: cMap, sectionMap: sMap };
  }, [classesData]);

  const exams = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // On-demand fetch fallback for any class not found in bulk lookup
  const [fetchedClassMap, setFetchedClassMap] = useState({});

  useEffect(() => {
    if (!exams || exams.length === 0) return;

    exams.forEach(async (exam) => {
      const cId = exam.class_id;
      if (cId && !classMap[cId] && !fetchedClassMap[cId]) {
        try {
          const res = await classService.getById(cId);
          const cls = res?.data || res;
          if (cls && (cls.id || cls.name)) {
            setFetchedClassMap(prev => {
              const updated = { ...prev, [cId]: cls };
              (cls.sections || []).forEach(sec => {
                if (sec && sec.id) {
                  updated[sec.id] = sec;
                }
              });
              return updated;
            });
          }
        } catch (err) {
          console.warn('Could not fetch class details for ID:', cId, err);
        }
      }
    });
  }, [exams, classMap, fetchedClassMap]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const scheduled = exams.filter(e => e.status === 'scheduled').length;
    const ongoing = exams.filter(e => e.status === 'ongoing').length;
    const completed = exams.filter(e => ['completed', 'results_published'].includes(e.status)).length;
    return { scheduled, ongoing, completed, total: exams.length };
  }, [exams]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => examService.delete(id),
    onSuccess: () => {
      toast.success(`${label} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setDeletingExam(null);
    },
    onError: (error) => toast.error(error.message || `Failed to delete ${label.toLowerCase()}`)
  });

  const publishMutation = useMutation({
    mutationFn: (id) => examService.publish(id),
    onSuccess: (data) => {
      toast.success(`${label} published successfully`);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setPublishingExam(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to publish ${label.toLowerCase()}`);
      setPublishingExam(null);
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => examService.updateStatus(id, status),
    onSuccess: () => {
      toast.success(`Status updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setStatusExam(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  const handleEdit = async (exam) => {
    try {
      const fullExam = await examService.getById(exam.id);
      setEditingExam(fullExam || exam);
    } catch (err) {
      console.error('Failed to load full exam details:', err);
      setEditingExam(exam);
    }
    setModalOpen(true);
  };

  const handleDelete = (exam) => {
    setDeletingExam(exam);
  };

  const handlePublish = (exam) => {
    setPublishingExam(exam);
  };

  const handleEnterResults = (exam) => {
    router.push(`exams/${exam.id}/results`);
  };

  const handleViewResults = (exam) => {
    router.push(`exams/${exam.id}/results-report`);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditingExam(null);
    queryClient.invalidateQueries({ queryKey: ['exams'] });
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: `${label} Name`,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.code && (
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          )}
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => (
        <span className="capitalize">{getValue()?.replace('_', ' ')}</span>
      )
    },
    {
      id: 'class_section',
      header: `${terms.class || 'Class'} & Section`,
      cell: ({ row }) => {
        const exam = row.original;
        const cls = exam.class_id ? (classMap[exam.class_id] || fetchedClassMap[exam.class_id]) : null;
        const sec = exam.section_id ? (sectionMap[exam.section_id] || fetchedClassMap[exam.section_id]) : null;

        if (!cls && !exam.class_id) return <span className="text-muted-foreground">—</span>;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">
              {cls?.name ? cls.name : (exam.class_id ? 'Loading...' : '—')}
            </span>
            <div>
              {exam.section_id ? (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 font-normal">
                  {sec?.name ? `Sec ${sec.name}` : 'Specific Section'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] px-1.5 py-0 font-normal text-muted-foreground">
                  All Sections
                </Badge>
              )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'subject_schedules',
      header: 'Subjects',
      cell: ({ getValue }) => {
        const schedules = getValue() || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {schedules.slice(0, 3).map((s, idx) => (
              <Badge key={`${s.subject_id || 'sub'}-${idx}`} variant="outline" className="text-xs">
                {s.subject_name}
              </Badge>
            ))}
            {schedules.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{schedules.length - 3}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'total_marks',
      header: 'Total Marks',
      cell: ({ getValue }) => getValue() || '—'
    },
    {
      accessorKey: 'start_date',
      header: 'Exam Period',
      cell: ({ row }) => {
        const start = row.original.start_date;
        const end = row.original.end_date;
        if (!start) return '—';
        if (start === end) return format(new Date(start), 'dd MMM yyyy');
        return `${format(new Date(start), 'dd MMM')} - ${format(new Date(end), 'dd MMM yyyy')}`;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue()} customColors={STATUS_COLORS} />
      )
    },
    {
      accessorKey: 'results_summary',
      header: 'Results',
      cell: ({ row }) => {
        const summary = row.original.results_summary;
        const exam = row.original;
        const canEnterResults = (isAdminUser || canDo('exam_results.enter')) && exam.status !== 'cancelled' && exam.status !== 'results_published';

        if (!summary || summary.total_students === 0) {
          if (canEnterResults) {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1 font-medium"
                onClick={() => handleEnterResults(exam)}
              >
                <Pencil className="h-3 w-3" />
                Enter Marks
              </Button>
            );
          }
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <div className="text-xs space-y-1">
            <div>
              <span className="text-green-600 font-medium">Pass: {summary.passed}</span>
              {' | '}
              <span className="text-red-600 font-medium">Fail: {summary.failed}</span>
              {summary.absent > 0 && (
                <span className="text-gray-500"> | Absent: {summary.absent}</span>
              )}
            </div>
            <button
              onClick={() => handleViewResults(exam)}
              className="text-xs text-primary underline hover:opacity-80 block"
            >
              View Sheet
            </button>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const exam = row.original;
        const extraActions = [];

        const canManageExam = isAdminUser || canDo('exams.update');
        const canPublishExam = (isAdminUser || canDo('exam_results.publish')) && exam.status === 'draft';
        const canEnterResults = (isAdminUser || canDo('exam_results.enter')) && ['draft', 'scheduled', 'ongoing', 'completed'].includes(exam.status);
        const canViewResults = isAdminUser || canDo('exam_results.view');

        // Publish action (draft exams)
        if (canPublishExam) {
          extraActions.push({
            label: 'Publish',
            icon: '📢',
            onClick: () => handlePublish(exam)
          });
        }

        // Change Status Action
        if (canManageExam) {
          extraActions.push({
            label: 'Change Status',
            icon: '🔄',
            onClick: () => setStatusExam(exam)
          });
        }

        // Enter Results (draft, scheduled, ongoing, completed exams)
        if (canEnterResults) {
          extraActions.push({
            label: 'Enter Marks',
            icon: Pencil,
            onClick: () => handleEnterResults(exam)
          });
        }

        // View Results
        if (canViewResults) {
          extraActions.push({
            label: 'View Results',
            icon: Eye,
            onClick: () => handleViewResults(exam)
          });
        }

        return (
          <div className="flex items-center gap-1 justify-end">
            {canEnterResults && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 font-medium"
                onClick={() => handleEnterResults(exam)}
                title="Enter Marks"
              >
                <Pencil className="h-3 w-3" />
                <span className="hidden sm:inline">Enter Marks</span>
              </Button>
            )}
            <TableRowActions
              onEdit={canManageExam ? () => handleEdit(exam) : undefined}
              onDelete={canDo('exams.delete') || isAdminUser ? () => handleDelete(exam) : undefined}
              extra={extraActions}
            />
          </div>
        );
      }
    }
  ], [canDo, label, isAdminUser]);

  if (isLoading) return <PageLoader message={`Loading ${labelP.toLowerCase()}...`} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={labelP}
        description={`Manage ${labelP.toLowerCase()} for your institute`}
        action={
          canDo('exams.create') && (
            <Button onClick={() => { setEditingExam(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              New {label}
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard
          label="Total"
          value={stats.total}
          icon={<GraduationCap size={18} />}
        />
        <StatsCard
          label="Scheduled"
          value={stats.scheduled}
          icon={<Calendar size={18} />}
          variant="info"
        />
        <StatsCard
          label="Ongoing"
          value={stats.ongoing}
          icon={<BookOpen size={18} />}
          variant="warning"
        />
        <StatsCard
          label="Completed"
          value={stats.completed}
          icon={<GraduationCap size={18} />}
          variant="success"
        />
      </div>

      <DataTable
        columns={columns}
        data={exams}
        loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={`Search ${labelP.toLowerCase()}...`}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: STATUS_OPTIONS
          },
          {
            name: 'type',
            label: 'Exam Type',
            value: examType,
            onChange: (v) => { setExamType(v); setPage(1); },
            options: EXAM_TYPE_OPTIONS
          }
        ]}
        enableColumnVisibility
        exportConfig={{
          fileName: `${labelP.toLowerCase()}_export`,
          data: exams
        }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); }
        }}
      />

      {/* Exam Form Modal */}
      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExam(null); }}
        title={editingExam ? `Edit ${label}` : `Create New ${label}`}
        size="xl"
      >
        <ExamForm
          initialData={editingExam}
          isEdit={!!editingExam}
          onSuccess={handleSuccess}
          onCancel={() => { setModalOpen(false); setEditingExam(null); }}
          instituteId={currentInstitute?.id}
        />
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        onConfirm={() => deleteMutation.mutate(deletingExam.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${label}`}
        description={`Are you sure you want to delete "${deletingExam?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Publish Confirmation */}
      <ConfirmDialog
        open={!!publishingExam}
        onClose={() => setPublishingExam(null)}
        onConfirm={() => publishMutation.mutate(publishingExam.id)}
        loading={publishMutation.isPending}
        title={`Publish ${label}`}
        description={`Are you sure you want to publish "${publishingExam?.name}"? Once published, students will be able to view this ${label.toLowerCase()}. You can still enter and modify results after publishing.`}
        confirmLabel="Publish"
        variant="info"
      />

      {/* Change Status Modal */}
      <AppModal
        open={!!statusExam}
        onClose={() => setStatusExam(null)}
        title="Change Status"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusExam(null)}>Cancel</Button>
            <Button 
              onClick={() => statusMutation.mutate({ id: statusExam.id, status: statusExam.status })}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select the new status for <b>{statusExam?.name}</b></p>
          <div className="space-y-2">
            <SelectField
              name="status"
              value={statusExam?.status || ''}
              onChange={(value) => setStatusExam({ ...statusExam, status: value })}
              options={STATUS_OPTIONS}
              placeholder="Select Status"
            />
          </div>
        </div>
      </AppModal>
    </div>
  );
}