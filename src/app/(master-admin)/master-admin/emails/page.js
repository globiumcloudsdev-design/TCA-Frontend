'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Send, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  DUMMY_EMAIL_CAMPAIGNS,
  EMAIL_RECIPIENT_GROUPS,
  EMAIL_STATS,
} from '@/data/masterAdminDummyData';
import {
  PageHeader, DataTable, AppModal,
  InputField, SelectField, TextareaField, DatePickerField, FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const TEMPLATE_OPTIONS = [
  { value: 'none',               label: '— No template (blank) —'          },
  { value: 'renewal_reminder',   label: '🔔 Subscription Renewal Reminder' },
  { value: 'payment_due',        label: '💰 Payment Due Notice'            },
  { value: 'welcome',            label: '🎉 Welcome to Platform'           },
  { value: 'feature_update',     label: '🚀 New Feature Announcement'      },
  { value: 'maintenance',        label: '🔧 Scheduled Maintenance Notice'  },
  { value: 'invoice',            label: '🧾 Monthly Invoice'               },
  { value: 'newsletter',         label: '📰 Monthly Newsletter'            },
];

const EMAIL_TEMPLATES = {
  renewal_reminder: {
    subject: 'Action Required: Your Subscription Expires Soon',
    body: `Dear Institute Admin,

This is a friendly reminder that your subscription to The Clouds Academy Platform will expire on [EXPIRY_DATE].

To continue enjoying uninterrupted access to all features, please renew your subscription before the expiry date.

Plan Details:
• Current Plan: [PLAN_NAME]
• Renewal Amount: PKR [AMOUNT]
• Expiry Date: [EXPIRY_DATE]

To renew, please log in to your dashboard or contact our support team.

Best regards,
The Clouds Academy Team`,
  },
  payment_due: {
    subject: 'Invoice Due: Please Clear Your Payment',
    body: `Dear Institute Admin,

Your invoice for [MONTH] is pending. Please make the payment at the earliest to avoid service interruption.

Invoice Details:
• Invoice No: [INVOICE_NO]
• Amount: PKR [AMOUNT]
• Due Date: [DUE_DATE]

Contact us if you need any assistance.

Best regards,
The Clouds Academy Team`,
  },
  welcome: {
    subject: 'Welcome to The Clouds Academy Platform! 🎉',
    body: `Dear [INSTITUTE_NAME],

Welcome aboard! We're thrilled to have you join The Clouds Academy Platform.

Your account has been activated. You can now:
• Manage students, teachers, and staff
• Track attendance and generate reports
• Collect fees and manage payroll
• Send communications to parents and students

Login URL: https://app.cloudsacademy.pk
Username: [ADMIN_EMAIL]

If you need any help getting started, please reach out to our support team.

Best regards,
The Clouds Academy Team`,
  },
  feature_update: {
    subject: 'New Feature Available on Your Platform',
    body: `Dear Institute Admin,

We're excited to announce a new feature is now available on your platform!

[FEATURE_DESCRIPTION]

Log in to your dashboard to explore it.

Best regards,
The Clouds Academy Team`,
  },
  maintenance: {
    subject: 'Scheduled Maintenance Notice',
    body: `Dear Institute Admin,

We will be performing scheduled maintenance on [DATE] from [START_TIME] to [END_TIME] PKT.

During this time, the platform may be temporarily unavailable. Please plan accordingly.

We apologize for any inconvenience.

Best regards,
The Clouds Academy Team`,
  },
  invoice: {
    subject: 'Your Monthly Invoice — [MONTH]',
    body: `Dear Institute Admin,

Please find attached your invoice for [MONTH].

Invoice Summary:
• Invoice No: [INVOICE_NO]
• Period: [PERIOD]
• Amount: PKR [AMOUNT]
• Due Date: [DUE_DATE]

Please ensure timely payment to avoid service disruption.

Best regards,
The Clouds Academy Team`,
  },
  newsletter: {
    subject: 'The Clouds Academy — Monthly Newsletter [MONTH]',
    body: `Dear Institute Admin,

Here's what's new this month at The Clouds Academy Platform:

📊 Platform Stats This Month:
• New institutes: [COUNT]
• Total active users: [COUNT]
• Uptime: 99.9%

🚀 New Features:
• [FEATURE_1]
• [FEATURE_2]

📅 Upcoming:
• [EVENT_1]

Best regards,
The Clouds Academy Team`,
  },
};

const STATUS_BADGE = {
  sent:       { cls: 'bg-emerald-100 text-emerald-700', label: 'Sent'      },
  partial:    { cls: 'bg-amber-100 text-amber-700',     label: 'Partial'   },
  scheduled:  { cls: 'bg-blue-100 text-blue-700',       label: 'Scheduled' },
  failed:     { cls: 'bg-red-100 text-red-700',         label: 'Failed'    },
  draft:      { cls: 'bg-slate-100 text-slate-600',     label: 'Draft'     },
};

const fmtDate = (v) => v ? new Date(v).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Columns ─────────────────────────────────────────────────────────────────
function buildColumns(onView) {
  return [
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div
            className="cursor-pointer group"
            onClick={() => onView(c)}
          >
            <p className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {c.subject}
            </p>
            <p className="text-xs text-muted-foreground">{c.recipient_group}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'sent_to',
      header: 'Recipients',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-sm text-slate-700">
          <Users size={12} className="text-muted-foreground" /> {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'delivered',
      header: 'Delivered',
      cell: ({ row }) => {
        const c = row.original;
        const pct = c.sent_to > 0 ? Math.round((c.delivered / c.sent_to) * 100) : 0;
        return (
          <div className="text-sm">
            <span className="font-medium text-slate-700">{c.delivered}</span>
            <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'opened',
      header: 'Opened',
      cell: ({ row }) => {
        const c = row.original;
        const pct = c.delivered > 0 ? Math.round((c.opened / c.delivered) * 100) : 0;
        return (
          <div className="text-sm">
            <span className="font-medium text-emerald-600">{c.opened}</span>
            <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'failed',
      header: 'Failed',
      cell: ({ getValue }) => {
        const v = getValue();
        return (
          <span className={cn('text-sm font-medium', v > 0 ? 'text-red-500' : 'text-slate-400')}>
            {v}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = STATUS_BADGE[getValue()] ?? STATUS_BADGE.draft;
        return (
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', s.cls)}>
            {s.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'sent_at',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
      ),
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BulkEmailsPage() {
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [search,       setSearch]       = useState('');
  const [composeOpen,  setComposeOpen]  = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [sending,      setSending]      = useState(false);

  // Client-side filter & paginate dummy data
  const filtered = useMemo(() => {
    if (!search) return DUMMY_EMAIL_CAMPAIGNS;
    const q = search.toLowerCase();
    return DUMMY_EMAIL_CAMPAIGNS.filter((c) =>
      c.subject.toLowerCase().includes(q) ||
      c.recipient_group.toLowerCase().includes(q),
    );
  }, [search]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageData   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = useMemo(() => buildColumns(setViewTarget), []);

  const handleSend = (data) => {
    if (!data.recipients) { toast.error('Please select a recipient group'); return; }
    if (!data.subject?.trim()) { toast.error('Email subject is required'); return; }
    if (!data.body?.trim()) { toast.error('Message body is required'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setComposeOpen(false);
      const groupLabel = EMAIL_RECIPIENT_GROUPS.find((g) => g.value === data.recipients)?.label ?? data.recipients;
      const dateStr = data.schedule_date ? ` — scheduled for ${data.schedule_date}` : '';
      toast.success(`Email queued: "${data.subject}" → ${groupLabel}${dateStr}`);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="📧 Bulk Emails"
        description="Compose and send targeted emails to institutes, admins, and users"
        action={
          <Button onClick={() => setComposeOpen(true)} className="gap-1.5">
            <Send size={15} /> Compose Email
          </Button>
        }
      />

      {/* ── Stats Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Sent',     value: EMAIL_STATS.total_sent.toLocaleString(),    icon: Mail,         bg: 'bg-blue-50',    color: 'text-blue-600'    },
          { label: 'Delivered',      value: EMAIL_STATS.delivered.toLocaleString(),     icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Open Rate',      value: `${EMAIL_STATS.open_rate}%`,               icon: TrendingUp,   bg: 'bg-violet-50',  color: 'text-violet-600'  },
          { label: 'Failed',         value: EMAIL_STATS.failed.toLocaleString(),        icon: XCircle,      bg: 'bg-red-50',     color: 'text-red-500'     },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
            <div className={cn('rounded-lg p-2', s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none text-slate-800">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delivery Rate Bar ───────────────────────────────── */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Overall Delivery Rate</p>
          <span className="text-sm font-bold text-emerald-600">{EMAIL_STATS.delivery_rate}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${EMAIL_STATS.delivery_rate}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
          <span>{EMAIL_STATS.delivered.toLocaleString()} delivered</span>
          <span>{EMAIL_STATS.failed} failed</span>
        </div>
      </div>

      {/* ── Campaign History Table ──────────────────────────── */}
      <DataTable
        columns={columns}
        data={pageData}
        emptyMessage="No email campaigns found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by subject or recipient group…"
        enableColumnVisibility
        exportConfig={{ fileName: 'email-campaigns' }}
        pagination={{
          page,
          totalPages,
          total:            totalCount,
          pageSize,
          onPageChange:     (p) => setPage(p),
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      />

      {/* ── Compose Modal ──────────────────────────────────── */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSend}
        sending={sending}
      />

      {/* ── View Campaign Modal ─────────────────────────────── */}
      {viewTarget && (
        <CampaignDetailModal
          campaign={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Compose Email Modal ──────────────────────────────────────────────────────
function ComposeModal({ open, onClose, onSend, sending }) {
  const {
    register, control, handleSubmit, reset, watch, setValue,
  } = useForm({
    defaultValues: {
      template:      'none',
      recipients:    '',
      subject:       '',
      body:          '',
      schedule_date: null,
    },
  });

  // Watch template field and auto-fill subject + body
  const templateValue = watch('template');
  useEffect(() => {
    if (!templateValue || templateValue === 'none') return;
    const tpl = EMAIL_TEMPLATES[templateValue];
    if (tpl) {
      setValue('subject', tpl.subject, { shouldValidate: false });
      setValue('body',    tpl.body,    { shouldValidate: false });
    }
  }, [templateValue, setValue]);

  const EMPTY = { template: 'none', recipients: '', subject: '', body: '', schedule_date: null };
  const handleClose = () => { reset(EMPTY); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="✉️ Compose Bulk Email"
      description="Send targeted emails to one or more recipient groups"
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={sending}>Cancel</Button>
          <FormSubmitButton
            loading={sending}
            label="Send Email"
            loadingLabel="Sending…"
            onClick={handleSubmit(onSend)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSend)} className="space-y-4">

        {/* Template — auto-fills subject + body */}
        <SelectField
          label="Email Template"
          name="template"
          control={control}
          options={TEMPLATE_OPTIONS}
          placeholder="— No template (blank) —"
        />

        {/* Recipients */}
        <SelectField
          label="Recipients"
          name="recipients"
          control={control}
          options={EMAIL_RECIPIENT_GROUPS}
          placeholder="Select recipient group…"
          required
        />

        {/* Subject */}
        <InputField
          label="Subject"
          name="subject"
          register={register}
          placeholder="Email subject line…"
          required
        />

        {/* Body */}
        <TextareaField
          label="Message Body"
          name="body"
          register={register}
          rows={10}
          placeholder="Write your email message here…"
          required
          className="[&_textarea]:font-mono [&_textarea]:resize-none"
        />

        {/* Schedule Date — optional */}
        <DatePickerField
          label="Schedule Date (optional)"
          name="schedule_date"
          control={control}
          placeholder="Send immediately — or pick a future date"
        />

        <p className="text-[11px] text-muted-foreground">
          💡 Use placeholders like [INSTITUTE_NAME], [EXPIRY_DATE], [AMOUNT] — they will be replaced per recipient dynamically.
        </p>

      </form>
    </AppModal>
  );
}

// ─── Campaign Detail Modal ────────────────────────────────────────────────────
function CampaignDetailModal({ campaign: c, onClose }) {
  const s    = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;
  const pct  = c.sent_to > 0 ? Math.round((c.delivered  / c.sent_to)  * 100) : 0;
  const opct = c.delivered > 0 ? Math.round((c.opened   / c.delivered) * 100) : 0;

  return (
    <AppModal
      open={!!c}
      onClose={onClose}
      title="📨 Campaign Details"
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Subject</p>
          <p className="font-semibold text-slate-800">{c.subject}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Recipient Group</p>
            <p className="text-sm font-medium text-slate-700">{c.recipient_group}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', s.cls)}>{s.label}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Sent At</p>
            <p className="text-sm text-slate-700">{fmtDate(c.sent_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Sender</p>
            <p className="text-sm text-slate-700">{c.sender}</p>
          </div>
        </div>

        {/* Delivery stats */}
        <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Statistics</p>
          {[
            { label: 'Total Recipients', value: c.sent_to,   pct: null,  color: 'text-slate-700' },
            { label: 'Delivered',        value: c.delivered, pct: pct,   color: 'text-emerald-600' },
            { label: 'Opened',           value: c.opened,    pct: opct,  color: 'text-blue-600' },
            { label: 'Failed',           value: c.failed,    pct: null,  color: c.failed > 0 ? 'text-red-500' : 'text-slate-400' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{row.label}</span>
              <span className={cn('text-sm font-bold', row.color)}>
                {row.value}
                {row.pct != null && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">({row.pct}%)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppModal>
  );
}
