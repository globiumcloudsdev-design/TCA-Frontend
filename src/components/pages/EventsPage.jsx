'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';

import useAuthStore from '@/store/authStore';
import {
  AppModal,
  DataTable,
  DatePickerField,
  MultiSelectField,
  PageHeader,
  SelectField,
  TableRowActions,
} from '@/components/common';
import TimePickerField from '@/components/common/TimePickerField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { classService, eventService, userService } from '@/services';
import { PERMISSIONS } from '@/constants';
import { cn, formatDate } from '@/lib/utils';

const EVENT_TYPES = [
  { value: 'Academic', label: 'Academic' },
  { value: 'Sports', label: 'Sports' },
  { value: 'PTM', label: 'PTM' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Seminar', label: 'Seminar' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Other', label: 'Other' },
];

const AUDIENCE_OPTIONS = [
  { value: 'all_students', label: 'All Students' },
  { value: 'all_teachers', label: 'All Teachers' },
  { value: 'all_staff', label: 'All Staff' },
  { value: 'selected_classes', label: 'Selected Classes' },
  { value: 'custom_users', label: 'Custom Users' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const audienceLabel = Object.fromEntries(AUDIENCE_OPTIONS.map((o) => [o.value, o.label]));

const schema = z.object({
  event_name: z.string().min(2, 'Event name is required'),
  description: z.string().optional(),
  event_type: z.string().min(1, 'Event type is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  audience: z.string().min(1, 'Audience is required'),
  status: z.string().min(1, 'Status is required'),
  selected_classes: z.array(z.string()).optional(),
  custom_users: z.array(z.string()).optional(),
}).superRefine((val, ctx) => {
  if (val.audience === 'selected_classes' && (!val.selected_classes || val.selected_classes.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['selected_classes'],
      message: 'Select at least one class',
    });
  }

  if (val.audience === 'custom_users' && (!val.custom_users || val.custom_users.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['custom_users'],
      message: 'Select at least one user',
    });
  }
});

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

export default function EventsPage({ type }) {
  const qc = useQueryClient();

  const canDo = useAuthStore((s) => s.canDo);
  const canDoAny = useAuthStore((s) => s.canDoAny);

  const canRead = canDoAny([
    PERMISSIONS.EVENT_READ,
    'fees.read',
    'calendar.events',
  ]);
  const canCreate = canDoAny([PERMISSIONS.EVENT_CREATE, 'fees.create', 'calendar.events']);
  const canUpdate = canDoAny([PERMISSIONS.EVENT_UPDATE, 'fees.update', 'calendar.events']);
  const canDelete = canDoAny([PERMISSIONS.EVENT_DELETE, 'fees.delete', 'calendar.events']);
  const canSendSms = canDoAny([PERMISSIONS.EVENT_SEND_SMS, 'fees.send_sms', 'notification.send']);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { control, register, watch, setValue, reset, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      event_name: '',
      description: '',
      event_type: '',
      date: '',
      time: '',
      location: '',
      audience: 'all_students',
      status: 'draft',
      selected_classes: [],
      custom_users: [],
    },
  });

  const selectedAudience = watch('audience');

  const { data, isLoading } = useQuery({
    queryKey: ['events', type, page, pageSize, search, eventTypeFilter, audienceFilter, statusFilter, fromDate, toDate],
    queryFn: () => eventService.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      event_type: eventTypeFilter || undefined,
      audience: audienceFilter || undefined,
      status: statusFilter || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    enabled: canRead,
  });

  const { data: classesData } = useQuery({
    queryKey: ['event-class-options'],
    queryFn: () => classService.getAll({ page: 1, limit: 200 }),
    enabled: createOpen || !!editing,
  });

  const { data: usersData } = useQuery({
    queryKey: ['event-user-options'],
    queryFn: () => userService.getAll({ page: 1, limit: 300 }),
    enabled: createOpen || !!editing,
  });

  const classesOptions = useMemo(() => {
    const rows = extractRows(classesData);
    return rows.map((c) => ({ value: String(c.id), label: c.name || c.class_name || `Class ${c.id}` }));
  }, [classesData]);

  const usersOptions = useMemo(() => {
    const rows = extractRows(usersData);
    return rows.map((u) => {
      const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.name || u.email || `User ${u.id}`;
      return { value: String(u.id), label: name };
    });
  }, [usersData]);

  const rows = extractRows(data);
  const totalPages = extractPages(data);
  const total = data?.data?.total ?? rows.length;

  const createMutation = useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      toast.success('Event created');
      setCreateOpen(false);
      reset();
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to create event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => eventService.update(id, body),
    onSuccess: () => {
      toast.success('Event updated');
      setEditing(null);
      reset();
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to update event'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventService.delete(id),
    onSuccess: () => {
      toast.success('Event deleted');
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to delete event'),
  });

  const sendSmsMutation = useMutation({
    mutationFn: (id) => eventService.sendSMS(id),
    onSuccess: () => toast.success('SMS sent successfully'),
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed to send SMS'),
  });

  const importMutation = useMutation({
    mutationFn: (batch) => eventService.bulkImport(batch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const onSubmit = (vals) => {
    const payload = {
      ...vals,
      selected_classes: vals.audience === 'selected_classes' ? vals.selected_classes : [],
      custom_users: vals.audience === 'custom_users' ? vals.custom_users : [],
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, body: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const openCreate = () => {
    setEditing(null);
    reset({
      event_name: '',
      description: '',
      event_type: '',
      date: '',
      time: '',
      location: '',
      audience: 'all_students',
      status: 'draft',
      selected_classes: [],
      custom_users: [],
    });
    setCreateOpen(true);
  };

  const openEdit = (event) => {
    setCreateOpen(false);
    setEditing(event);
    reset({
      event_name: event.event_name ?? '',
      description: event.description ?? '',
      event_type: event.event_type ?? '',
      date: event.date ?? '',
      time: event.time ?? '',
      location: event.location ?? '',
      audience: event.audience ?? 'all_students',
      status: event.status ?? 'draft',
      selected_classes: (event.selected_classes ?? []).map(String),
      custom_users: (event.custom_users ?? []).map(String),
    });
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'event_name',
      header: 'Event Name',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div>
            <p className="font-medium text-sm">{e.event_name}</p>
            {e.description && <p className="text-xs text-muted-foreground line-clamp-1">{e.description}</p>}
          </div>
        );
      },
    },
    { accessorKey: 'event_type', header: 'Event Type' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ getValue }) => getValue() || '-',
    },
    { accessorKey: 'location', header: 'Location' },
    {
      accessorKey: 'audience',
      header: 'Audience',
      cell: ({ getValue }) => audienceLabel[getValue()] ?? getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue() || 'draft';
        return (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[value] || STATUS_STYLES.draft)}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;
        const extra = canSendSms
          ? [{
              label: 'Send SMS',
              onClick: () => sendSmsMutation.mutate(event.id),
              icon: Send,
            }]
          : [];

        return (
          <TableRowActions
            onView={() => setViewing(event)}
            onEdit={canUpdate ? () => openEdit(event) : undefined}
            onDelete={canDelete ? () => setDeleting(event) : undefined}
            extra={extra}
          />
        );
      },
    },
  ], [canDelete, canSendSms, canUpdate, sendSmsMutation]);

  const filters = [
    {
      name: 'event_type',
      label: 'Event Type',
      value: eventTypeFilter,
      onChange: (v) => { setEventTypeFilter(v); setPage(1); },
      options: EVENT_TYPES,
    },
    {
      name: 'audience',
      label: 'Audience',
      value: audienceFilter,
      onChange: (v) => { setAudienceFilter(v); setPage(1); },
      options: AUDIENCE_OPTIONS,
    },
    {
      name: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: STATUS_OPTIONS,
    },
  ];

  const importColumns = [
    { key: 'event_name', label: 'Event Name', required: true },
    { key: 'description', label: 'Description' },
    { key: 'event_type', label: 'Event Type', required: true },
    { key: 'date', label: 'Date', required: true },
    { key: 'time', label: 'Time', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'audience', label: 'Audience', required: true },
    { key: 'status', label: 'Status' },
  ];

  if (!canRead) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">You do not have permission to view events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Events"
        description="Manage institute events, communication audience, and SMS notifications"
        action={
          canCreate && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> New Event
            </Button>
          )
        }
      />

      <div className="rounded-lg border p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date Range Filter</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <DatePickerField label="From" value={fromDate} onChange={(v) => { setFromDate(v || ''); setPage(1); }} />
          <DatePickerField label="To" value={toDate} onChange={(v) => { setToDate(v || ''); setPage(1); }} />
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
            >
              Clear Date Range
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search events..."
        filters={filters}
        enableColumnVisibility
        importConfig={{
          columns: importColumns,
          fileName: 'events',
          onImport: async (batch) => {
            await importMutation.mutateAsync(batch);
            toast.success(`Imported ${batch.length} records`);
          },
          sampleData: [{
            event_name: 'Annual Day',
            event_type: 'Cultural',
            date: '2026-05-20',
            time: '10:00',
            location: 'Auditorium',
            audience: 'all_students',
            status: 'scheduled',
          }],
        }}
        exportConfig={{ fileName: 'events', dateField: 'date' }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      <AppModal open={createOpen || !!editing} onClose={() => { setCreateOpen(false); setEditing(null); }} title={editing ? 'Edit Event' : 'Create Event'} size="2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Event Name <span className="text-destructive">*</span></Label>
            <Input {...register('event_name')} placeholder="Enter event name" />
            {errors.event_name && <p className="text-xs text-destructive">{errors.event_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add event details"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SelectField label="Event Type" name="event_type" control={control} error={errors.event_type} options={EVENT_TYPES} required />
            <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTIONS} required />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DatePickerField label="Date" name="date" control={control} error={errors.date} required />
            <div className="space-y-1.5">
              <Label>Time <span className="text-destructive">*</span></Label>
              <TimePickerField value={watch('time')} onChange={(v) => setValue('time', v)} mode="simple" />
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Location <span className="text-destructive">*</span></Label>
              <Input {...register('location')} placeholder="Event location" />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
          </div>

          <SelectField label="Audience" name="audience" control={control} error={errors.audience} options={AUDIENCE_OPTIONS} required />

          {selectedAudience === 'selected_classes' && (
            <MultiSelectField
              label="Selected Classes"
              name="selected_classes"
              control={control}
              options={classesOptions}
              required
              error={errors.selected_classes?.message}
              placeholder="Select classes"
            />
          )}

          {selectedAudience === 'custom_users' && (
            <MultiSelectField
              label="Custom Users"
              name="custom_users"
              control={control}
              options={usersOptions}
              required
              error={errors.custom_users?.message}
              placeholder="Select users"
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </AppModal>

      <AppModal open={!!viewing} onClose={() => setViewing(null)} title="Event Details" size="lg">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{viewing.event_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Event Type" value={viewing.event_type} />
              <Info label="Status" value={<Badge className={cn('capitalize', STATUS_STYLES[viewing.status] || STATUS_STYLES.draft)}>{viewing.status || 'draft'}</Badge>} />
              <Info label="Date" value={formatDate(viewing.date)} />
              <Info label="Time" value={viewing.time || '-'} />
              <Info label="Location" value={viewing.location || '-'} />
              <Info label="Audience" value={audienceLabel[viewing.audience] ?? viewing.audience} />
            </div>
            <Info label="Description" value={viewing.description || '-'} />
          </div>
        )}
      </AppModal>

      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Event" size="sm">
        <p className="text-sm text-muted-foreground">Delete event <strong>{deleting?.event_name}</strong>? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </AppModal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
