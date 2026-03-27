'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Bell, Info, Megaphone, AlertTriangle, AlertCircle,
  CreditCard, FileText, CheckCircle2, CalendarClock,
  BellRing, Send, Users, Clock, CalendarDays, Eye,
} from 'lucide-react';
import { toast } from 'sonner';

import { DUMMY_NOTIFICATIONS_HISTORY, DUMMY_INSTITUTES_REPORT } from '@/data/masterAdminDummyData';
import {
  PageHeader, StatsCard, DataTable, AppModal,
  InputField, SelectField, TextareaField, DatePickerField, FormSubmitButton,
} from '@/components/common';
import { cn } from '@/lib/utils';

// ─── Type config: icon + colour + label ─────────────────────────────────────
const TYPE_CONFIG = {
  info:         { icon: Info,          color: 'text-blue-700 bg-blue-50 border-blue-200',       label: 'Info'              },
  announcement: { icon: Megaphone,     color: 'text-purple-700 bg-purple-50 border-purple-200', label: 'Announcement'      },
  warning:      { icon: AlertTriangle, color: 'text-amber-700 bg-amber-50 border-amber-200',    label: 'Warning'           },
  alert:        { icon: AlertCircle,   color: 'text-red-700 bg-red-50 border-red-200',          label: 'Urgent Alert'      },
  reminder:     { icon: Bell,          color: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Reminder'          },
  payment:      { icon: CreditCard,    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Payment'        },
  subscription: { icon: FileText,      color: 'text-slate-700 bg-slate-100 border-slate-300',   label: 'Subscription'      },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', cfg.color)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function SentStatusBadge({ status }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
        <CheckCircle2 size={10} /> Sent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border-blue-200">
      <CalendarClock size={10} /> Scheduled
    </span>
  );
}

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

// ─── Table columns ────────────────────────────────────────────────────────────
function buildColumns(onView) {
  return [
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-800 line-clamp-1 max-w-[260px]">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <TypeBadge type={getValue()} />,
    },
    {
      accessorKey: 'recipientLabel',
      header: 'Recipient(s)',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.recipients === 'all' ? (
            <Users size={12} className="text-muted-foreground shrink-0" />
          ) : (
            <BellRing size={12} className="text-muted-foreground shrink-0" />
          )}
          <span className="text-sm text-slate-600 line-clamp-1">{row.original.recipientLabel}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <SentStatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'sentAt',
      header: 'Date / Time',
      cell: ({ getValue, row }) => (
        <div className="text-sm text-slate-600">
          <div className="flex items-center gap-1">
            {row.original.status === 'scheduled'
              ? <><CalendarClock size={11} className="text-blue-500" /> {fmtDate(row.original.scheduledAt)}</>
              : <><Clock size={11} className="text-muted-foreground" /> {fmtDate(getValue())}</>
            }
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'sentBy',
      header: 'Sent By',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original)}
          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
        >
          <Eye size={11} /> View
        </button>
      ),
    },
  ];
}

// ─── Send-notification options ────────────────────────────────────────────────
const NOTIF_RECIPIENT_OPTIONS = [
  { value: 'all', label: 'All Institutes' },
  ...DUMMY_INSTITUTES_REPORT.map((i) => ({ value: i.id.toString(), label: `${i.name} — ${i.city}` })),
];

const NOTIF_TYPE_OPTIONS = [
  { value: 'info',         label: 'Info / General'      },
  { value: 'announcement', label: 'Announcement'        },
  { value: 'warning',      label: 'Warning'             },
  { value: 'alert',        label: 'Urgent Alert'        },
  { value: 'reminder',     label: 'Reminder'            },
  { value: 'payment',      label: 'Payment / Invoice'   },
  { value: 'subscription', label: 'Subscription Notice' },
];

const TYPE_FILTER_OPTIONS = [
  ...NOTIF_TYPE_OPTIONS,
];
const STATUS_FILTER_OPTIONS = [
  { value: 'sent',      label: 'Sent'      },
  { value: 'scheduled', label: 'Scheduled' },
];

// ─── EXPORT config ────────────────────────────────────────────────────────────
const EXPORT_CONFIG = {
  filename: 'notifications-history',
  sheetName: 'Notifications',
  columns: [
    { key: 'subject',        label: 'Subject'     },
    { key: 'type',           label: 'Type'        },
    { key: 'recipientLabel', label: 'Recipient'   },
    { key: 'status',         label: 'Status'      },
    { key: 'sentAt',         label: 'Sent At'     },
    { key: 'sentBy',         label: 'Sent By'     },
    { key: 'message',        label: 'Message'     },
  ],
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [data, setData]         = useState(DUMMY_NOTIFICATIONS_HISTORY);
  const [viewItem, setViewItem] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const total      = data.length;
  const sentAll    = data.filter((n) => n.recipients === 'all').length;
  const targeted   = data.filter((n) => n.recipients !== 'all').length;
  const scheduled  = data.filter((n) => n.status === 'scheduled').length;

  const filteredData = useMemo(() => {
    return data.filter((n) => {
      if (typeFilter   && n.type   !== typeFilter)   return false;
      if (statusFilter && n.status !== statusFilter) return false;
      return true;
    });
  }, [data, typeFilter, statusFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData    = useMemo(
    () => filteredData.slice((page - 1) * pageSize, page * pageSize),
    [filteredData, page, pageSize],
  );

  // reset to page 1 when filters change
  const handleTypeFilter = (v)   => { setTypeFilter(v);   setPage(1); };
  const handleStatusFilter = (v) => { setStatusFilter(v); setPage(1); };

  const columns = useMemo(() => buildColumns(setViewItem), []);

  const handleNewSent = (newEntry) => {
    setData((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification History"
        description="All notifications sent to institute admins"
        action={
          <button
            onClick={() => setSendOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Send size={14} /> Send New
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard label="Total Sent"       value={total}     icon={<BellRing size={20} />}     />
        <StatsCard label="Broadcast (All)"  value={sentAll}   icon={<Megaphone size={20} />}    />
        <StatsCard label="Targeted"         value={targeted}  icon={<Users size={20} />}        />
        <StatsCard label="Scheduled"        value={scheduled} icon={<CalendarDays size={20} />} />
      </div>

      {/* Table */}
      <DataTable
        data={pagedData}
        columns={columns}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total: filteredData.length,
          pageSize,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
        enableColumnVisibility
        exportConfig={EXPORT_CONFIG}
        filters={[
          {
            name:     'typeFilter',
            label:    'Type',
            value:    typeFilter,
            onChange: handleTypeFilter,
            options:  TYPE_FILTER_OPTIONS,
          },
          {
            name:     'statusFilter',
            label:    'Status',
            value:    statusFilter,
            onChange: handleStatusFilter,
            options:  STATUS_FILTER_OPTIONS,
          },
        ]}
      />

      {/* View Detail Modal */}
      {viewItem && (
        <AppModal
          open={!!viewItem}
          onClose={() => setViewItem(null)}
          title="Notification Detail"
          description={viewItem.subject}
          size="md"
          footer={
            <div className="flex justify-end w-full">
              <button
                onClick={() => setViewItem(null)}
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Type + Status row */}
            <div className="flex flex-wrap items-center gap-3">
              <TypeBadge type={viewItem.type} />
              <SentStatusBadge status={viewItem.status} />
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Subject</p>
                <p className="font-medium text-slate-800">{viewItem.subject}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Sent By</p>
                <p className="text-slate-700">{viewItem.sentBy}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Recipient</p>
                <p className="text-slate-700">{viewItem.recipientLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                  {viewItem.status === 'scheduled' ? 'Scheduled For' : 'Sent At'}
                </p>
                <p className="text-slate-700">
                  {fmtDate(viewItem.status === 'scheduled' ? viewItem.scheduledAt : viewItem.sentAt)}
                </p>
              </div>
            </div>

            {/* Message body */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Message</p>
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {viewItem.message}
              </div>
            </div>
          </div>
        </AppModal>
      )}

      {/* Send New Notification Modal */}
      <SendNewModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSent={handleNewSent}
      />
    </div>
  );
}

// ─── SendNewModal ─────────────────────────────────────────────────────────────
function SendNewModal({ open, onClose, onSent }) {
  const [sending, setSending] = useState(false);
  const {
    register, control, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recipients:  'all',
      type:        'info',
      subject:     '',
      message:     '',
      schedule_at: null,
    },
  });

  const recipientsVal = watch('recipients');
  const recipientLabel =
    recipientsVal === 'all'
      ? 'All Institutes'
      : DUMMY_INSTITUTES_REPORT.find((i) => i.id.toString() === recipientsVal)?.name ?? recipientsVal;

  const onSubmit = (data) => {
    if (!data.subject?.trim()) { toast.error('Subject is required'); return; }
    if (!data.message?.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      const isScheduled = !!data.schedule_at;
      const newEntry = {
        id:             `notif-${Date.now()}`,
        subject:        data.subject.trim(),
        type:           data.type,
        recipients:     data.recipients,
        recipientLabel,
        message:        data.message.trim(),
        sentAt:         new Date().toISOString(),
        status:         isScheduled ? 'scheduled' : 'sent',
        sentBy:         'Super Admin',
        scheduled:      isScheduled,
        scheduledAt:    isScheduled ? data.schedule_at : undefined,
      };
      onSent?.(newEntry);
      toast.success(
        isScheduled
          ? `Notification scheduled for ${recipientLabel}`
          : `Notification sent to: ${recipientLabel}`,
      );
      reset();
      onClose();
    }, 1000);
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Send Notification"
      description="Send a message or alert to one or all institute admins"
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <FormSubmitButton
            loading={sending}
            label="Send Notification"
            loadingLabel="Sending…"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SelectField
          label="Send To"
          name="recipients"
          control={control}
          options={NOTIF_RECIPIENT_OPTIONS}
          placeholder="Select recipient…"
          required
        />
        <SelectField
          label="Notification Type"
          name="type"
          control={control}
          options={NOTIF_TYPE_OPTIONS}
          placeholder="Select type…"
          required
        />
        <InputField
          label="Subject"
          name="subject"
          register={register}
          error={errors.subject}
          placeholder="Notification subject…"
          required
        />
        <TextareaField
          label="Message"
          name="message"
          register={register}
          error={errors.message}
          rows={5}
          placeholder="Write the notification message…"
          required
        />
        <DatePickerField
          label="Schedule Date (optional — leave blank to send now)"
          name="schedule_at"
          control={control}
          placeholder="Send immediately or pick a future date"
        />
      </form>
    </AppModal>
  );
}
