'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Plus, Building2, CheckCircle2, Clock, XCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal, InputField, SelectField,
  SwitchField, StatsCard, DatePickerField,
} from '@/components/common';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Status & Lookup constants ────────────────────────────────────────────────
const SUB_STATUS_OPTIONS = [
  { value: 'trial',     label: '🕐 Trial / Pending'      },
  { value: 'active',    label: '✅ Active / Approved'     },
  { value: 'expired',   label: '⏰ Expired'               },
  { value: 'suspended', label: '🚫 Suspended / Rejected'  },
];

const SUB_STATUS_BADGE = {
  trial:     { cls: 'bg-amber-100   text-amber-700   border-amber-200',   label: 'Trial'     },
  active:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Active'    },
  expired:   { cls: 'bg-red-100     text-red-700     border-red-200',     label: 'Expired'   },
  suspended: { cls: 'bg-slate-100   text-slate-600   border-slate-200',   label: 'Suspended' },
};

const COUNTRY_OPTIONS  = ['Pakistan','UAE','Saudi Arabia','UK','USA','Canada'].map((v)=>({value:v,label:v}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SubStatusBadge({ status }) {
  const cfg = SUB_STATUS_BADGE[status] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: status ?? '—' };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ─── Table columns ────────────────────────────────────────────────────────────
function buildColumns(onEdit, onDelete, onToggle, onStatusChange, router, activeTab, onRestore) {
  return [
    {
      id: 'name',
      header: 'Institute',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="cursor-pointer flex items-center gap-2.5" onClick={() => router.push(`/master-admin/institutes/${s.id}`)}
          >
            {s.institute_logo_url
              ? <img src={s.institute_logo_url} alt={s.institute_name} className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              : <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 text-xs font-bold">{s.institute_name?.[0]?.toUpperCase() ?? '?'}</span>
                </div>
            }
            <div className="max-w-[160px] min-w-0">
              <p className="font-semibold text-slate-800 hover:text-emerald-700 transition-colors truncate">{s.institute_name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{s.institute_code}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.institute_email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const t = row.original.type;
        if (!t) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {t.icon} {t.name}
          </span>
        );
      },
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ row }) => {
        const p = row.original.plan;
        if (!p) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div>
            <p className="text-xs font-semibold text-slate-700">{p.name}</p>
            <p className="text-[10px] text-muted-foreground">{p.cycle}</p>
          </div>
        );
      },
    },
    {
      id: 'sub_status',
      header: 'Status',
      cell: ({ row }) => <SubStatusBadge status={row.original.subscription_status} />,
    },
    {
      id: 'joining_date',
      header: 'Joined On',
      cell: ({ row }) => {
        const d = row.original.joining_date;
        if (!d) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <p className="text-xs font-medium text-slate-700">
            {new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        );
      },
    },
    {
      id: 'trial',
      header: 'Trial Ends',
      cell: ({ row }) => {
        const d = row.original.trial_end_date;
        if (!d) return <span className="text-xs text-muted-foreground">—</span>;
        const date     = new Date(d);
        const daysLeft = Math.ceil((date - new Date()) / 86400000);
        return (
          <div>
            <p className="text-xs font-medium text-slate-700">{date.toLocaleDateString('en-PK')}</p>
            {daysLeft > 0
              ? <p className={cn('text-[10px]', daysLeft <= 7 ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>{daysLeft}d left</p>
              : <p className="text-[10px] text-red-500 font-semibold">Expired</p>
            }
          </div>
        );
      },
    },
    {
      id: 'active',
      header: 'Active',
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const s = row.original;
        if (activeTab === 'deleted') {
          return (
            <Button size="sm" variant="outline" onClick={() => onRestore(s)} className="gap-2">
              <RefreshCw size={14} /> Restore
            </Button>
          );
        }
        return (
          <TableRowActions
            onView={() => router.push(`/master-admin/institutes/${s.id}`)}
            onEdit={() => onEdit(s)}
            onDelete={() => onDelete(s)}
            extra={[
              { label: s.is_active ? 'Deactivate' : 'Activate', onClick: () => onToggle(s) },
              { label: 'Change Status', onClick: () => onStatusChange(s) },
            ]}
          />
        );
      },
    },
  ];
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1">
      {children}
    </p>
  );
}

// ─── Status change dialog ─────────────────────────────────────────────────────
function StatusChangeDialog({ open, target, onClose, onConfirm, loading }) {
  const [status, setStatus] = useState('trial');
  useEffect(() => { if (target) setStatus(target.subscription_status ?? 'trial'); }, [target]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Update Institute Status"
      description={
        <span className="pt-2 block">
          Change subscription status of <strong>{target?.institute_name}</strong>
        </span>
      }
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onConfirm(status)} disabled={loading} className="min-w-[120px]">
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Update Status
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Subscription Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {SUB_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            This affects login access and billing cycles for the institute.
          </p>
        </div>
      </div>
    </AppModal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MasterAdminInstitutesPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [activeTab,    setActiveTab]    = useState('active'); // active | deleted

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  // ── Fetch institutes ───────────────────────────────────────────────────────
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['master-institutes', page, search, statusFilter, typeFilter, activeTab],
    queryFn:  () => masterAdminService.getSchools({
      page, limit: 15,
      search:              search       || undefined,
      subscription_status: statusFilter || undefined,
      institute_type_id:   typeFilter   || undefined,
      is_deleted:          activeTab === 'deleted' ? 'true' : 'false',
    }),
    staleTime: 0,
  });

  const institutes  = data?.data?.rows  ?? [];
  const totalPages  = data?.data?.totalPages ?? 1;
  const totalCount  = data?.data?.total      ?? institutes.length;
  const activeCount = institutes.filter((i) => i.is_active).length;
  const trialCount  = institutes.filter((i) => i.subscription_status === 'trial').length;

  // ── Institute type options ─────────────────────────────────────────────────
  const { data: typesData } = useQuery({
    queryKey: ['institute-types'],
    queryFn:  () => masterAdminService.getInstituteTypes(),
    staleTime: 5 * 60_000,
  });
  const typeOptions = (typesData?.data ?? []).map((t) => ({
    value: String(t.id), label: `${t.icon}  ${t.name}`,
  }));

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-institutes'] });

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createSchool(body),
    onSuccess: (res) => {
      invalidate();
      toast.success(`✅ "${res?.data?.institute_name ?? 'Institute'}" created!`);
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Create failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => masterAdminService.updateSchool(id, body),
    onSuccess: (res) => {
      invalidate();
      toast.success(`✅ "${res?.data?.institute_name ?? 'Institute'}" updated!`);
      setEditTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => masterAdminService.deleteSchool(id),
    onSuccess: () => { invalidate(); toast.success('Institute deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => masterAdminService.restoreSchool(id),
    onSuccess: () => { invalidate(); toast.success('Institute restored'); setRestoreTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Restore failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => masterAdminService.toggleSchoolStatus(id, is_active),
    onSuccess: (_, { is_active }) => {
      invalidate();
      toast.success(is_active ? 'Institute activated' : 'Institute deactivated');
      setToggleTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, subscription_status }) =>
      masterAdminService.updateInstituteSubscriptionStatus(id, subscription_status),
    onSuccess: () => { invalidate(); toast.success('Status updated'); setStatusTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const handleFormSubmit = (body) => {
    if (editTarget) updateMutation.mutate({ id: editTarget.id, body });
    else            createMutation.mutate(body);
  };

  const columns = useMemo(
    () => buildColumns(setEditTarget, setDeleteTarget, setToggleTarget, setStatusTarget, router, activeTab, setRestoreTarget),
    [router, activeTab],
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <PageHeader
        title="🏢 Institute Management"
        description="Manage all institutes registered on the platform"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={cn('mr-1', isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus size={15} /> New Institute
            </Button>
          </div>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total"    value={isLoading ? '…' : totalCount}               icon={<Building2    size={16} />} />
        <StatsCard label="Active"   value={isLoading ? '…' : activeCount}              icon={<CheckCircle2 size={16} />} />
        <StatsCard label="In Trial" value={isLoading ? '…' : trialCount}               icon={<Clock        size={16} />} />
        <StatsCard label="Inactive" value={isLoading ? '…' : totalCount - activeCount} icon={<XCircle      size={16} />} />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="active">Active Institutes</TabsTrigger>
          <TabsTrigger value="deleted">Restore / Delete Institutes</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={institutes}
        loading={isLoading}
        emptyMessage="No institutes found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, code or email…"
        enableColumnVisibility
        exportConfig={{ fileName: 'institutes' }}
        filters={[
          {
            name: 'type', label: 'Type', value: typeFilter,
            onChange: (v) => { setTypeFilter(v); setPage(1); },
            options: typeOptions,
          },
          {
            name: 'status', label: 'Status', value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: SUB_STATUS_OPTIONS,
          },
        ]}
        pagination={{ page, totalPages, total: totalCount, onPageChange: setPage }}
      />

      {/* ── Create / Edit Modal ── */}
      <InstituteFormModal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        institute={editTarget}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        typeOptions={typeOptions}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Institute"
        description={`Delete "${deleteTarget?.institute_name}"? It will be moved to the Restore / Delete Institutes tab.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ── Restore Confirm ── */}
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => restoreMutation.mutate(restoreTarget?.id)}
        loading={restoreMutation.isPending}
        title="Restore Institute"
        description={`Restore "${restoreTarget?.institute_name}" to active status?`}
        confirmLabel="Restore"
      />

      {/* ── Toggle Active Confirm ── */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleMutation.mutate({ id: toggleTarget.id, is_active: !toggleTarget.is_active })}
        loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate Institute' : 'Activate Institute'}
        description={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.institute_name}"?`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />

      {/* ── Status Change ── */}
      <StatusChangeDialog
        open={!!statusTarget}
        target={statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={(subscription_status) => statusMutation.mutate({ id: statusTarget.id, subscription_status })}
        loading={statusMutation.isPending}
      />
    </div>
  );
}

function InstituteFormModal({ open, onClose, institute, onSubmit, loading, typeOptions }) {
  const isEdit = !!institute?.id;

  const toDefaults = (inst) => ({
    institute_name:       inst?.institute_name       ?? '',
    institute_code:       inst?.institute_code       ?? '',
    institute_email:      inst?.institute_email      ?? '',
    institute_contact:    inst?.institute_contact    ?? '',
    institute_type_id:    inst?.institute_type_id    ? String(inst.institute_type_id) : '',
    institute_logo_url:   inst?.institute_logo_url   ?? '',
    institute_address:    inst?.institute_address    ?? '',
    institute_city:       inst?.institute_city       ?? '',
    institute_country:    inst?.institute_country    ?? 'Pakistan',
    institute_zip_code:   inst?.institute_zip_code   ?? '',
    principal_name:       inst?.principal_name       ?? '',
    principal_email:      inst?.principal_email      ?? '',
    principal_phone:      inst?.principal_phone      ?? '',
    joining_date:         inst?.joining_date
      ? new Date(inst.joining_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    admin_email:          inst?.principal?.email     ?? '',
    admin_password:       '',
    institute_role_id:    inst?.institute_role_id    ?? '',
    subscription_plan_id: inst?.subscription_plan_id ?? '',
    trial_days:           inst?.trial_days           ?? 30,
    trial_end_date:       inst?.trial_end_date
      ? new Date(inst.trial_end_date).toISOString().split('T')[0]
      : '',
    subscription_status:  inst?.subscription_status  ?? 'trial',
    is_active:            inst?.is_active            ?? true,
    
    // Settings fields with proper defaults
    has_branches:         inst?.settings?.has_branches ?? false,
    enable_parent_portal: inst?.settings?.enable_parent_portal ?? true,
    enable_teacher_portal: inst?.settings?.enable_teacher_portal ?? true,
    enable_student_portal: inst?.settings?.enable_student_portal ?? true,
    enable_sms_notifications: inst?.settings?.enable_sms_notifications ?? false,

    // Document settings
    enable_header_logo:   inst?.settings?.document_settings?.enable_header_logo ?? true,
    enable_footer_sign:   inst?.settings?.document_settings?.enable_footer_sign ?? true,
    document_stamp:       inst?.settings?.document_settings?.document_stamp ?? true,
    watermark_text:       inst?.settings?.document_settings?.watermark_text ?? '',
    student_docs_allowed: inst?.settings?.document_settings?.student_docs_allowed ?? true,
    teacher_docs_allowed: inst?.settings?.document_settings?.teacher_docs_allowed ?? true,
    staff_docs_allowed:   inst?.settings?.document_settings?.staff_docs_allowed ?? true,

    // Print settings
    printer_type:         inst?.settings?.print_settings?.printer_type ?? 'regular',
    page_size:            inst?.settings?.print_settings?.page_size ?? 'A4',
    orientation:          inst?.settings?.print_settings?.orientation ?? 'portrait',
    color_mode:           inst?.settings?.print_settings?.color_mode ?? 'color',
    show_border:          inst?.settings?.print_settings?.show_border ?? true,
    voucher_format:       inst?.settings?.print_settings?.voucher_format ?? inst?.settings?.voucher_format ?? 'three_part',

    // Conditional switch state
    show_subscription_settings: false,
  });0

  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [activeTab,   setActiveTab]   = useState('basic');

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: toDefaults(null),
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
      setLogoFile(null);
      setLogoPreview(institute?.institute_logo_url ?? '');
      reset(toDefaults(institute ?? null));
      setActiveTab('basic');
    }
  }, [institute, open]);

  // ── Fetch plans ──
  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn:  () => masterAdminService.getSubscriptionTemplates(),
    enabled:   open,
    staleTime: 5 * 60_000,
  });
  const planOptions = (plansData?.data?.rows ?? plansData?.data ?? []).map((p) => ({
    value:      p.id,
    label:      `${p.name} — ${p.currency ?? 'PKR'} ${Number(p.price ?? 0).toLocaleString()} / ${(p.cycle ?? '').toLowerCase()}`,
    trial_days: p.trial_days,
  }));

  // ── Fetch platform roles ──
  const { data: rolesData } = useQuery({
    queryKey: ['platform-roles'],
    queryFn:  () => masterAdminService.getPlatformRoles(),
    enabled:   open,
    staleTime: 5 * 60_000,
  });
  const roleOptions = (rolesData?.data ?? []).map((r) => ({
    value: r.id,
    label: `${r.name} (${r.code})`,
  }));

  // 🔥 Auto-fill trial_days ONLY in CREATE mode
  const selectedPlanId = watch('subscription_plan_id');
  useEffect(() => {
    if (!isEdit && selectedPlanId) {
      const plan = planOptions.find((p) => p.value === selectedPlanId);
      if (!plan) return;
      
      const days = plan.trial_days ?? 30;
      setValue('trial_days', days, { shouldDirty: false });
      
      const d = new Date();
      d.setDate(d.getDate() + days);
      setValue('trial_end_date', d.toISOString().split('T')[0], { shouldDirty: false });
    }
  }, [selectedPlanId, planOptions.length, isEdit]);

  // 🔥 Auto-compute trial_end_date ONLY in CREATE mode
  const trialDays = watch('trial_days');
  useEffect(() => {
    if (!isEdit) {
      const d = parseInt(trialDays);
      if (d && d > 0 && !selectedPlanId) {
        const end = new Date();
        end.setDate(end.getDate() + d);
        setValue('trial_end_date', end.toISOString().split('T')[0], { shouldDirty: false });
      }
    }
  }, [trialDays, isEdit, selectedPlanId]);

  const handleLogoChange = (files) => {
    if (!files?.length) return;
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    const file = files[0];
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // 🔥 FIXED: Properly format data before submit
  const handleInternalSubmit = (data) => {
    // Create settings object from individual fields
    const settings = {
      has_branches: data.has_branches,
      enable_parent_portal: data.enable_parent_portal,
      enable_teacher_portal: data.enable_teacher_portal,
      enable_student_portal: data.enable_student_portal,
      enable_sms_notifications: data.enable_sms_notifications,
      document_settings: {
        enable_header_logo: data.enable_header_logo,
        enable_footer_sign: data.enable_footer_sign,
        document_stamp: data.document_stamp,
        watermark_text: data.watermark_text,
        student_docs_allowed: data.student_docs_allowed,
        teacher_docs_allowed: data.teacher_docs_allowed,
        staff_docs_allowed: data.staff_docs_allowed,
      },
      print_settings: {
        printer_type: data.printer_type,
        page_size: data.page_size,
        orientation: data.orientation,
        color_mode: data.color_mode,
        show_border: data.show_border,
        voucher_format: data.voucher_format,
      },
      voucher_format: data.voucher_format,
    };

    // Remove individual settings fields from main data
    const { 
      has_branches, 
      enable_parent_portal, 
      enable_teacher_portal, 
      enable_student_portal, 
      enable_sms_notifications,
      enable_header_logo,
      enable_footer_sign,
      document_stamp,
      watermark_text,
      student_docs_allowed,
      teacher_docs_allowed,
      staff_docs_allowed,
      printer_type,
      page_size,
      orientation,
      color_mode,
      show_border,
      voucher_format,
      show_subscription_settings,
      ...mainData 
    } = data;

    // Add settings object to main data
    const submitData = {
      ...mainData,
      settings
    };

    // Keep password empty if not supplied during edit
    if (isEdit && !submitData.admin_password) {
      delete submitData.admin_password;
    }

    if (logoFile) {
      const fd = new FormData();
      fd.append('institute_logo', logoFile);
      Object.entries(submitData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          // Handle nested objects like settings
          if (k === 'settings') {
            fd.append(k, JSON.stringify(v));
          } else {
            fd.append(k, String(v));
          }
        }
      });
      onSubmit(fd);
    } else {
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview('');
    reset(toDefaults(null));
    onClose();
  };

  // Watchers for conditional layout
  const showSubSettings = watch('show_subscription_settings');
  const currentPrinterType = watch('printer_type');

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? `✏️ Edit — ${institute?.institute_name}` : '➕ Register New Institute'}
      description={isEdit ? 'Update institute information and configurations' : 'Fill all required fields to register a new institute on the platform'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit(handleInternalSubmit)} disabled={loading} className="min-w-[140px] gap-1.5">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Institute'}
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic">1. Basic Details</TabsTrigger>
          <TabsTrigger value="login_sub">2. Login &amp; Plans</TabsTrigger>
          <TabsTrigger value="settings">3. Settings &amp; Prints</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(handleInternalSubmit)} className="space-y-4">
          
          {/* ─────── TAB 1: BASIC DETAILS ─────── */}
          <TabsContent value="basic" className="space-y-4 outline-none">
            {/* Identity */}
            <SectionLabel>Institute Identity</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Institute Name *" name="institute_name" register={register} error={errors.institute_name}
                rules={{ required: 'Name is required' }} placeholder="The Clouds Academy" required
              />
              <InputField
                label="Institute Code *" name="institute_code" register={register} error={errors.institute_code}
                rules={{ required: 'Code is required' }} placeholder="TCA-LHR-001" required
                hint="Unique short code — auto UPPERCASE"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Institute Type *" name="institute_type_id" control={control} error={errors.institute_type_id}
                options={typeOptions} placeholder="Select type" required
                rules={{ required: 'Type is required' }}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Institute Logo</label>
                <div className="flex items-center gap-3">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Institute logo"
                      className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <div className="flex-1">
                    <FileUpload
                      accept="image/*"
                      maxSize={2 * 1024 * 1024}
                      onChange={handleLogoChange}
                      onError={(msg) => toast.error(msg)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <SectionLabel>Contact &amp; Address</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Institute Email *" name="institute_email" register={register} error={errors.institute_email}
                rules={{ required: 'Email is required' }} placeholder="info@institute.edu.pk" required type="email"
              />
              <InputField
                label="Institute Contact No *" name="institute_contact" register={register} error={errors.institute_contact}
                rules={{ required: 'Contact no is required' }} placeholder="+92-42-35761234" required
              />
            </div>
            <InputField
              label="Address *" name="institute_address" register={register} error={errors.institute_address}
              rules={{ required: 'Address is required' }} placeholder="12-B, Gulberg III, Lahore" required
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <InputField
                label="City *" name="institute_city" register={register} error={errors.institute_city}
                rules={{ required: 'City is required' }} placeholder="Lahore" required
              />
              <SelectField label="Country" name="institute_country" control={control} options={COUNTRY_OPTIONS} />
              <InputField  label="Province / State" name="province" register={register} placeholder="Punjab" />
              <InputField  label="Zip / Postal"     name="institute_zip_code" register={register} placeholder="54000" />
            </div>

            {/* Principal */}
            <SectionLabel>Principal / Owner</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InputField
                label="Principal Name *" name="principal_name" register={register} error={errors.principal_name}
                rules={{ required: 'Principal name is required' }} placeholder="Dr. Ahmed Raza" required
              />
              <InputField
                label="Principal Email *" name="principal_email" register={register} error={errors.principal_email}
                rules={{ required: 'Principal email is required' }} placeholder="principal@institute.edu.pk" required type="email"
              />
              <InputField
                label="Principal Phone *" name="principal_phone" register={register} error={errors.principal_phone}
                rules={{ required: 'Principal phone is required' }} placeholder="+92-300-1234567" required
              />
            </div>
            <div className="pt-2">
              <DatePickerField
                label="Joining Date *" name="joining_date" control={control}
                placeholder="Select joining date"
                required
                hint="Date when the institute officially joined the platform"
              />
            </div>
          </TabsContent>

          {/* ─────── TAB 2: LOGIN & PLANS ─────── */}
          <TabsContent value="login_sub" className="space-y-4 outline-none">
            <SectionLabel>Admin Login Account</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Admin Email *" name="admin_email" register={register} error={errors.admin_email}
                rules={{ required: 'Admin email is required' }} placeholder="admin@institute.edu.pk" type="email"
                hint="Creates or updates portal credentials for the institute administrator" required
              />
              <InputField
                label={isEdit ? "New Admin Password (leave blank to keep current)" : "Admin Password *"}
                name="admin_password" register={register} error={errors.admin_password}
                rules={!isEdit ? { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } } : { minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                placeholder="Min. 8 characters" type="password"
                hint={isEdit ? "Provide a new password ONLY if you wish to reset it" : "Temporary credentials — admin should change after first login"}
                required={!isEdit}
              />
            </div>

            {isEdit && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-800">Advanced Subscription Controls</p>
                  <p className="text-xs text-muted-foreground">Toggle visibility of platform roles, plans, trial days, and status</p>
                </div>
                <SwitchField
                  label=""
                  name="show_subscription_settings"
                  control={control}
                />
              </div>
            )}

            {/* Conditionally render role and plan selections */}
            {(!isEdit || showSubSettings) && (
              <div className="space-y-4 p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 transition-all duration-300">
                {/* Institute Role */}
                <SectionLabel>Institute Permission Role</SectionLabel>
                <SelectField
                  label="Assign Role (defines default permissions) *" name="institute_role_id" control={control}
                  error={errors.institute_role_id}
                  options={roleOptions.length > 0 ? roleOptions : [{ value: 'loading', label: '⏳ Loading roles…' }]}
                  placeholder="Select platform role"
                  rules={{ required: 'Role is required' }}
                  required
                  hint="Controls what features this institute admin can access on the portal"
                />

                {/* Subscription Plan & Trial */}
                <SectionLabel>Subscription Plan &amp; Trial</SectionLabel>
                <SelectField
                  label="Subscription Plan" name="subscription_plan_id" control={control}
                  options={planOptions.length > 0 ? planOptions : [{ value: 'loading', label: '⏳ Loading plans…' }]}
                  placeholder="Select plan — trial days will auto-fill"
                  hint={isEdit 
                    ? "Change plan (trial dates won't auto-update - you must manually set them if needed)" 
                    : "Selecting a plan automatically fills trial days and end date"
                  }
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InputField
                    label="Trial Days" name="trial_days" register={register} type="number"
                    placeholder="30" 
                    hint={isEdit 
                      ? "Manual entry - won't auto-update" 
                      : "Auto-filled when you select a plan"
                    }
                    readOnly={!isEdit && !!selectedPlanId}
                  />
                  <DatePickerField
                    label="Trial End Date" name="trial_end_date" control={control}
                    placeholder="Pick end date"
                    hint={isEdit 
                      ? "Manual entry - won't auto-update" 
                      : "Auto-computed from trial days"
                    }
                  />
                  <SelectField
                    label="Subscription Status" name="subscription_status" control={control}
                    options={SUB_STATUS_OPTIONS}
                  />
                </div>

                {/* Status */}
                <SectionLabel>Account Status</SectionLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <SwitchField 
                    label="Is Active" 
                    name="is_active" 
                    control={control} 
                    hint="Inactive institutes cannot log in to the portal" 
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─────── TAB 3: SETTINGS & PRINTS ─────── */}
          <TabsContent value="settings" className="space-y-4 outline-none">
            
            {/* Portal Settings */}
            <SectionLabel>Portal Settings &amp; Access</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SwitchField 
                label="Has Branches" 
                name="has_branches" 
                control={control} 
                hint="Institute operates from multiple distinct branch campuses" 
              />
              <SwitchField 
                label="Enable Parent Portal" 
                name="enable_parent_portal" 
                control={control} 
                hint="Parents can login and view student reports &amp; fee status" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Enable Teacher Portal" 
                name="enable_teacher_portal" 
                control={control} 
                hint="Teachers can login, take attendance, and post marks" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Enable Student Portal" 
                name="enable_student_portal" 
                control={control} 
                hint="Students can login and view academic details" 
                defaultChecked={true}
              />
            </div>

            {/* Document Settings */}
            <SectionLabel>Document &amp; Form Settings</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SwitchField 
                label="Header Logo on Prints" 
                name="enable_header_logo" 
                control={control} 
                hint="Print institute logo in the header of PDF vouchers/reports" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Principal Signature Footer" 
                name="enable_footer_sign" 
                control={control} 
                hint="Render principal signature block in document footers" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Document Digital Stamp" 
                name="document_stamp" 
                control={control} 
                hint="Render institute digital watermark/official stamp on PDF exports" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Student Form Uploads Allowed" 
                name="student_docs_allowed" 
                control={control} 
                hint="Allow attachments and digital documents on Student Form" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Teacher Form Uploads Allowed" 
                name="teacher_docs_allowed" 
                control={control} 
                hint="Allow attachments and digital documents on Teacher Form" 
                defaultChecked={true}
              />
              <SwitchField 
                label="Staff Form Uploads Allowed" 
                name="staff_docs_allowed" 
                control={control} 
                hint="Allow attachments and digital documents on Staff Form" 
                defaultChecked={true}
              />
            </div>
            <div className="pt-2">
              <InputField
                label="Document Watermark Text" name="watermark_text" register={register} error={errors.watermark_text}
                placeholder="e.g. TCA OFFICIAL"
                hint="Subtle background text displayed behind printed PDFs"
              />
            </div>

            {/* Print Settings */}
            <SectionLabel>Print &amp; Printer Layouts</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Voucher Print Format *"
                name="voucher_format"
                control={control}
                error={errors.voucher_format}
                options={[
                  { value: 'three_part', label: 'Classic Three-Part Slip (Bank, School & Parent Copies - A4)' },
                  { value: 'compact', label: 'Compact Receipt (Small Shop Receipt - Thermal / A5)' }
                ]}
                placeholder="Select voucher print format"
                hint="Default voucher layout used when printing or downloading fee vouchers for this school"
                required
              />
              <SelectField
                label="Printer Type *" name="printer_type" control={control} error={errors.printer_type}
                options={[
                  { value: 'regular', label: 'Laser Printer (Standard A4/A5/Letter)' },
                  { value: 'thermal', label: 'Thermal Printer (Continuous Receipt Roll)' }
                ]}
                placeholder="Select printer type" required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Color Mode" name="color_mode" control={control}
                options={[
                  { value: 'color', label: 'Harmonious Color Mode' },
                  { value: 'grayscale', label: 'Eco Grayscale / Monochrome' }
                ]}
              />
            </div>

            {currentPrinterType === 'regular' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200 transition-all duration-300">
                <SelectField
                  label="Standard Page Size" name="page_size" control={control}
                  options={[
                    { value: 'A4', label: 'A4 (210 x 297 mm)' },
                    { value: 'A5', label: 'A5 (148 x 210 mm)' },
                    { value: 'Letter', label: 'Letter (8.5 x 11 in)' }
                  ]}
                />
                <SelectField
                  label="Print Orientation" name="orientation" control={control}
                  options={[
                    { value: 'portrait', label: 'Portrait' },
                    { value: 'landscape', label: 'Landscape' }
                  ]}
                />
                <div className="pt-4 flex items-center">
                  <SwitchField 
                    label="Show Page Border" 
                    name="show_border" 
                    control={control} 
                    hint="Include frame lines" 
                    defaultChecked={true}
                  />
                </div>
              </div>
            )}

            {currentPrinterType === 'thermal' && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 leading-relaxed">
                ℹ️ <strong>Thermal Printing Mode Active:</strong> Document size and orientation will automatically scale to receipt layouts (80mm/58mm roll width) to prevent margins overflow. Standard borders are hidden by default to preserve paper length.
              </div>
            )}
          </TabsContent>

        </form>
      </Tabs>
    </AppModal>
  );
}