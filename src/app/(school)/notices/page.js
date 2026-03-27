'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { noticeService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, NOTICE_AUDIENCE, NOTICE_PRIORITY } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const PRIORITY_STYLES = {
  low:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  normal:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  urgent:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const AUDIENCE_STYLES = {
  all:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  students: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  parents:  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  staff:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  teachers: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const buildColumns = (onEdit, onDelete, onTogglePublish, canDelete, canCreate) => [
  {
    id: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const n = row.original;
      return (
        <div>
          <p className="font-medium text-sm leading-tight">{n.title}</p>
          {n.content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.content}</p>}
        </div>
      );
    },
  },
  {
    id: 'audience',
    header: 'Audience',
    cell: ({ row }) => {
      const a = row.original.audience ?? 'all';
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${AUDIENCE_STYLES[a] ?? ''}`}>{a}</span>;
    },
  },
  {
    id: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const p = row.original.priority ?? 'normal';
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[p] ?? ''}`}>{p}</span>;
    },
  },
  {
    id: 'publish_date',
    header: 'Published',
    cell: ({ row }) => {
      const n = row.original;
      return (
        <span className="text-sm text-muted-foreground">
          {n.is_published ? formatDate(n.publish_date ?? n.created_at) : '—'}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.is_published ? 'published' : 'draft'} />,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const n = row.original;
      const extraActions = canCreate ? [
        {
          label: n.is_published ? 'Unpublish' : 'Publish',
          onClick: () => onTogglePublish(n),
          icon: n.is_published ? EyeOff : Eye,
        },
      ] : [];
      return (
        <TableRowActions
          onEdit={canCreate ? () => onEdit(n) : undefined}
          onDelete={canDelete ? () => onDelete(n) : undefined}
          extraActions={extraActions}
        />
      );
    },
  },
];

export default function NoticesPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.NOTICE_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.NOTICE_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,           setPage]           = useState(1);
  const [pageSize,       setPageSize]       = useState(10);
  const [search,         setSearch]         = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notices', { page, pageSize, search, audienceFilter, priorityFilter }],
    queryFn:  () => noticeService.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      audience: audienceFilter || undefined,
      priority: priorityFilter || undefined,
    }),
  });

  const notices    = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? notices.length;

  const createMutation = useMutation({
    mutationFn: noticeService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice created'); setCreateOpen(false); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => noticeService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice updated'); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => noticeService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice deleted'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => noticeService.togglePublish(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice status updated'); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const audienceOptions = (NOTICE_AUDIENCE ?? []).map(({ value, label }) => ({ value, label }));
  const priorityOptions = (NOTICE_PRIORITY ?? []).map(({ value, label }) => ({ value, label }));

  const columns = buildColumns(
    (n) => setEditTarget(n),
    (n) => setDeleteTarget(n),
    (n) => toggleMutation.mutate(n.id),
    canDelete,
    canCreate,
  );

  const filters = [
    {
      name: 'audience',
      label: 'Audience',
      value: audienceFilter,
      onChange: (v) => { setAudienceFilter(v); setPage(1); },
      options: audienceOptions,
    },
    {
      name: 'priority',
      label: 'Priority',
      value: priorityFilter,
      onChange: (v) => { setPriorityFilter(v); setPage(1); },
      options: priorityOptions,
    },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notice Board"
        description="Publish notices to students, parents, and staff"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Notice
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={notices}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={filters}
        enableColumnVisibility
        exportConfig={{ fileName: 'notices' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Create modal */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Notice">
        <NoticeForm
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
          audienceOptions={audienceOptions}
          priorityOptions={priorityOptions}
        />
      </AppModal>

      {/* Edit modal */}
      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Notice">
        <NoticeForm
          defaultValues={editTarget}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          isLoading={updateMutation.isPending}
          audienceOptions={audienceOptions}
          priorityOptions={priorityOptions}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Notice"
        description={`Delete notice "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Notice form ─────────────────────────────────────────────── */
/* Notice Form (react-hook-form) */
function NoticeForm({ defaultValues, audienceOptions, priorityOptions, onSubmit, onCancel, isLoading }) {
  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title:        defaultValues?.title        ?? '',
      content:      defaultValues?.content      ?? '',
      audience:     defaultValues?.audience     ?? 'all',
      priority:     defaultValues?.priority     ?? 'normal',
      is_published: defaultValues?.is_published ?? false,
    },
  });

  const isPublished = watch('is_published');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      <div className="space-y-1.5">
        <Label>Title <span className="text-destructive">*</span></Label>
        <Input {...register('title', { required: 'Required' })} placeholder="Notice title" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Content <span className="text-destructive">*</span></Label>
        <textarea
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
          placeholder="Notice content…"
          {...register('content', { required: 'Required' })}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Audience"
          name="audience"
          control={control}
          error={errors.audience}
          options={audienceOptions}
          placeholder="Select audience…"
        />
        <SelectField
          label="Priority"
          name="priority"
          control={control}
          error={errors.priority}
          options={priorityOptions}
          placeholder="Select priority…"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setValue('is_published', e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm">Publish immediately</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save Notice'}</Button>
      </div>
    </form>
  );
}
