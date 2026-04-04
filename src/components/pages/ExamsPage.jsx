
// frontend/src/components/pages/ExamsPage.jsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { EXAM_TYPES } from '@/constants';

import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AppModal from '@/components/common/AppModal';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import PageLoader from '@/components/common/PageLoader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableRowActions from '@/components/common/TableRowActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { examService } from '@/services/examService';
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
  const { canDo } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [examType, setExamType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);
  const [publishingExam, setPublishingExam] = useState(null);

  const label = type === 'coaching' ? 'Test' : type === 'academy' ? 'Assessment' : 'Exam';
  const labelP = type === 'coaching' ? 'Tests' : type === 'academy' ? 'Assessments' : 'Exams';

  // Fetch exams
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exams', currentInstitute?.id, page, pageSize, search, status, examType],
    queryFn: () => examService.getAll({
      institute_id: currentInstitute?.id,
      page,
      limit: pageSize,
      search,
      status: status !== 'all' ? status : undefined,
      type: examType !== 'all' ? examType : undefined
    }),
    enabled: !!currentInstitute?.id
  });

  const exams = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  
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

  const handleEdit = (exam) => {
    setEditingExam(exam);
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
      accessorKey: 'subject_schedules',
      header: 'Subjects',
      cell: ({ getValue }) => {
        const schedules = getValue() || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {schedules.slice(0, 3).map(s => (
              <Badge key={s.subject_id} variant="outline" className="text-xs">
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
        if (!summary || summary.total_students === 0) return '—';
        return (
          <div className="text-xs">
            <span className="text-green-600">Pass: {summary.passed}</span>
            {' | '}
            <span className="text-red-600">Fail: {summary.failed}</span>
            {summary.absent > 0 && (
              <span className="text-gray-500"> | Absent: {summary.absent}</span>
            )}
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

        // Publish action (draft exams)
        if (canDo('exam_results.publish') && exam.status === 'draft') {
          extraActions.push({
            label: 'Publish',
            icon: '📢',
            onClick: () => handlePublish(exam)
          });
        }

        // Enter Results (published/ongoing exams)
        if (canDo('exam_results.enter') && ['scheduled', 'ongoing', 'completed'].includes(exam.status)) {
          extraActions.push({
            label: 'Enter Results',
            icon: '✏️',
            onClick: () => handleEnterResults(exam)
          });
        }

        // View Results (results published or completed)
        if (canDo('exam_results.view') && ['completed', 'results_published'].includes(exam.status)) {
          extraActions.push({
            label: 'View Results',
            icon: '👁️',
            onClick: () => handleViewResults(exam)
          });
        }

        return (
          <TableRowActions
            onEdit={canDo('exams.update') ? () => handleEdit(exam) : undefined}
            onDelete={canDo('exams.delete') ? () => handleDelete(exam) : undefined}
            extra={extraActions}
          />
        );
      }
    }
  ], [canDo, label]);

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
    </div>
  );
}