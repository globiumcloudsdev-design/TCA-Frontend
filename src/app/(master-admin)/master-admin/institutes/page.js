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
function buildColumns(onEdit, onDelete, onToggle, onStatusChange, router) {
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

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  // ── Fetch institutes ───────────────────────────────────────────────────────
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['master-institutes', page, search, statusFilter, typeFilter],
    queryFn:  () => masterAdminService.getSchools({
      page, limit: 15,
      search:              search       || undefined,
      subscription_status: statusFilter || undefined,
      institute_type_id:   typeFilter   || undefined,
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
    () => buildColumns(setEditTarget, setDeleteTarget, setToggleTarget, setStatusTarget, router),
    [router],
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
        description={`Permanently delete "${deleteTarget?.institute_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
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

// // ─── Institute Form Modal ─────────────────────────────────────────────────
// function InstituteFormModal({ open, onClose, institute, onSubmit, loading, typeOptions }) {
//   const isEdit = !!institute?.id;

//   const toDefaults = (inst) => ({
//     institute_name:       inst?.institute_name       ?? '',
//     institute_code:       inst?.institute_code       ?? '',
//     institute_email:      inst?.institute_email      ?? '',
//     institute_contact:    inst?.institute_contact    ?? '',
//     institute_type_id:    inst?.institute_type_id    ? String(inst.institute_type_id) : '',
//     institute_logo_url:   inst?.institute_logo_url   ?? '',
//     institute_address:    inst?.institute_address    ?? '',
//     institute_city:       inst?.institute_city       ?? '',
//     institute_country:    inst?.institute_country    ?? 'Pakistan',
//     institute_zip_code:   inst?.institute_zip_code   ?? '',
//     principal_name:       inst?.principal_name       ?? '',
//     principal_email:      inst?.principal_email      ?? '',
//     principal_phone:      inst?.principal_phone      ?? '',
//     joining_date:         inst?.joining_date
//       ? new Date(inst.joining_date).toISOString().split('T')[0]
//       : new Date().toISOString().split('T')[0],
//     admin_email:          '',
//     admin_password:       '',
//     institute_role_id:    inst?.institute_role_id    ?? '',
//     subscription_plan_id: inst?.subscription_plan_id ?? '',
//     trial_days:           inst?.trial_days           ?? 30,
//     trial_end_date:       inst?.trial_end_date
//       ? new Date(inst.trial_end_date).toISOString().split('T')[0]
//       : '',
//     subscription_status:  inst?.subscription_status  ?? 'trial',
//     is_active:            inst?.is_active             ?? true,
//     has_branches:         inst?.settings?.has_branches ?? false,
//   });

//   const [logoFile,    setLogoFile]    = useState(null);
//   const [logoPreview, setLogoPreview] = useState('');

//   const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
//     defaultValues: toDefaults(null),
//   });

//   // Reset form when modal opens/closes
//   useEffect(() => {
//     if (open) {
//       if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
//       setLogoFile(null);
//       setLogoPreview(institute?.institute_logo_url ?? '');
//       reset(toDefaults(institute ?? null));
//     }
//   }, [institute, open]);

//   // ── Fetch plans ──
//   const { data: plansData } = useQuery({
//     queryKey: ['subscription-plans'],
//     queryFn:  () => masterAdminService.getSubscriptionTemplates(),
//     enabled:   open,
//     staleTime: 5 * 60_000,
//   });
//   const planOptions = (plansData?.data?.rows ?? plansData?.data ?? []).map((p) => ({
//     value:      p.id,
//     label:      `${p.name} — ${p.currency ?? 'PKR'} ${Number(p.price ?? 0).toLocaleString()} / ${(p.cycle ?? '').toLowerCase()}`,
//     trial_days: p.trial_days,
//   }));

//   // ── Fetch platform roles ──
//   const { data: rolesData } = useQuery({
//     queryKey: ['platform-roles'],
//     queryFn:  () => masterAdminService.getPlatformRoles(),
//     enabled:   open,
//     staleTime: 5 * 60_000,
//   });
//   const roleOptions = (rolesData?.data ?? []).map((r) => ({
//     value: r.id,
//     label: `${r.name} (${r.code})`,
//   }));

//   // 🔥 FIXED PART 1: Auto-fill trial_days ONLY in CREATE mode, NOT in EDIT mode
//   const selectedPlanId = watch('subscription_plan_id');
//   useEffect(() => {
//     // Sirf create mode mein auto-fill karo, edit mode mein nahi
//     if (!isEdit && selectedPlanId) {
//       const plan = planOptions.find((p) => p.value === selectedPlanId);
//       if (!plan) return;
      
//       const days = plan.trial_days ?? 30;
//       // shouldDirty: false ta ke form dirty na ho
//       setValue('trial_days', days, { shouldDirty: false }); 
      
//       const d = new Date();
//       d.setDate(d.getDate() + days);
//       setValue('trial_end_date', d.toISOString().split('T')[0], { shouldDirty: false });
//     }
//   }, [selectedPlanId, planOptions.length, isEdit]); // Added isEdit dependency

//   // 🔥 FIXED PART 2: Auto-compute trial_end_date ONLY in CREATE mode
//   const trialDays = watch('trial_days');
//   useEffect(() => {
//     // Sirf create mode mein auto-compute karo
//     if (!isEdit) {
//       const d = parseInt(trialDays);
//       if (d && d > 0 && !selectedPlanId) { // Sirf agar plan select nahi hai to
//         const end = new Date();
//         end.setDate(end.getDate() + d);
//         setValue('trial_end_date', end.toISOString().split('T')[0], { shouldDirty: false });
//       }
//     }
//   }, [trialDays, isEdit, selectedPlanId]);

//   const handleLogoChange = (files) => {
//     if (!files?.length) return;
//     if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
//     const file = files[0];
//     setLogoFile(file);
//     setLogoPreview(URL.createObjectURL(file));
//   };

//   const handleInternalSubmit = (data) => {
//     if (logoFile) {
//       const fd = new FormData();
//       fd.append('institute_logo', logoFile);
//       Object.entries(data).forEach(([k, v]) => {
//         if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
//       });
//       onSubmit(fd);
//     } else {
//       onSubmit(data);
//     }
//   };

//   const handleClose = () => {
//     if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
//     setLogoFile(null);
//     setLogoPreview('');
//     reset(toDefaults(null));
//     onClose();
//   };

//   return (
//     <AppModal
//       open={open}
//       onClose={handleClose}
//       title={isEdit ? `✏️ Edit — ${institute?.institute_name}` : '➕ Register New Institute'}
//       description={isEdit ? 'Update institute information' : 'Fill all required fields to register a new institute on the platform'}
//       size="xl"
//       footer={
//         <div className="flex justify-end gap-2 w-full">
//           <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
//           <Button onClick={handleSubmit(handleInternalSubmit)} disabled={loading} className="min-w-[140px] gap-1.5">
//             {loading && <Loader2 size={14} className="animate-spin" />}
//             {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Institute'}
//           </Button>
//         </div>
//       }
//     >
//       <form onSubmit={handleSubmit(handleInternalSubmit)} className="space-y-0.5">

//         {/* ── Institute Identity ── */}
//         <SectionLabel>Institute Identity</SectionLabel>
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//           <InputField
//             label="Institute Name" name="institute_name" register={register} error={errors.institute_name}
//             rules={{ required: 'Name is required' }} placeholder="The Clouds Academy" required
//           />
//           <InputField
//             label="Institute Code" name="institute_code" register={register} error={errors.institute_code}
//             rules={{ required: 'Code is required' }} placeholder="TCA-LHR-001" required
//             hint="Unique short code — auto UPPERCASE"
//           />
//         </div>
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//           <SelectField
//             label="Institute Type" name="institute_type_id" control={control} error={errors.institute_type_id}
//             options={typeOptions} placeholder="Select type" required
//             rules={{ required: 'Type is required' }}
//           />
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium text-slate-700">Institute Logo</label>
//             {logoPreview && (
//               <img
//                 src={logoPreview}
//                 alt="Institute logo"
//                 className="h-14 w-14 rounded-lg object-cover border border-slate-200"
//               />
//             )}
//             <FileUpload
//               accept="image/*"
//               maxSize={2 * 1024 * 1024}
//               onChange={handleLogoChange}
//               onError={(msg) => toast.error(msg)}
//             />
//           </div>
//         </div>

//         {/* ── Contact & Address ── */}
//         <SectionLabel>Contact &amp; Address</SectionLabel>
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//           <InputField
//             label="Institute Email" name="institute_email" register={register} error={errors.institute_email}
//             rules={{ required: 'Email is required' }} placeholder="info@institute.edu.pk" required type="email"
//           />
//           <InputField
//             label="Institute Contact No" name="institute_contact" register={register} error={errors.institute_contact}
//             rules={{ required: 'Contact no is required' }} placeholder="+92-42-35761234" required
//           />
//         </div>
//         <InputField
//           label="Address" name="institute_address" register={register} error={errors.institute_address}
//           rules={{ required: 'Address is required' }} placeholder="12-B, Gulberg III, Lahore" required
//         />
//         <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//           <InputField
//             label="City" name="institute_city" register={register} error={errors.institute_city}
//             rules={{ required: 'City is required' }} placeholder="Lahore" required
//           />
//           <SelectField label="Country" name="institute_country" control={control} options={COUNTRY_OPTIONS} />
//           <InputField  label="Province / State" name="province" register={register} placeholder="Punjab" />
//           <InputField  label="Zip / Postal"     name="institute_zip_code" register={register} placeholder="54000" />
//         </div>

//         {/* ── Principal / Owner ── */}
//         <SectionLabel>Principal / Owner</SectionLabel>
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//           <InputField
//             label="Principal Name" name="principal_name" register={register} error={errors.principal_name}
//             rules={{ required: 'Principal name is required' }} placeholder="Dr. Ahmed Raza" required
//           />
//           <InputField
//             label="Principal Email" name="principal_email" register={register} error={errors.principal_email}
//             rules={{ required: 'Principal email is required' }} placeholder="principal@institute.edu.pk" required type="email"
//           />
//           <InputField
//             label="Principal Phone" name="principal_phone" register={register} error={errors.principal_phone}
//             rules={{ required: 'Principal phone is required' }} placeholder="+92-300-1234567" required
//           />
//         </div>
//         <div className="pt-3">
//           <DatePickerField
//             label="Joining Date" name="joining_date" control={control}
//             placeholder="Select joining date"
//             required
//             hint="Date when the institute officially joined the platform"
//           />
//         </div>

//         {/* ── Admin Login (create only) ── */}
//         {!isEdit && (
//           <>
//             <SectionLabel>
//               Admin Login Account
//               <span className="text-muted-foreground normal-case font-normal ml-1">(optional)</span>
//             </SectionLabel>
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//               <InputField
//                 label="Admin Email"    name="admin_email"    register={register}
//                 placeholder="admin@institute.edu.pk" type="email"
//                 hint="Creates a portal login for the institute admin"
//               />
//               <InputField
//                 label="Admin Password" name="admin_password" register={register}
//                 placeholder="Min. 8 characters" type="password"
//                 hint="Temporary password — admin should change after first login"
//               />
//             </div>
//           </>
//         )}

//         {/* ── Institute Role ── */}
//         <SectionLabel>Institute Role</SectionLabel>
//         <SelectField
//           label="Assign Role (defines permissions)" name="institute_role_id" control={control}
//           error={errors.institute_role_id}
//           options={roleOptions.length > 0 ? roleOptions : [{ value: 'loading', label: '⏳ Loading roles…' }]}
//           placeholder="Select platform role"
//           rules={{ required: 'Role is required' }}
//           required
//           hint="Controls what institute admins can access on the portal"
//         />

//         {/* ── Subscription Plan & Trial ── */}
//         <SectionLabel>Subscription Plan &amp; Trial</SectionLabel>
//         <SelectField
//           label="Subscription Plan" name="subscription_plan_id" control={control}
//           options={planOptions.length > 0 ? planOptions : [{ value: 'loading', label: '⏳ Loading plans…' }]}
//           placeholder="Select plan — trial days will auto-fill"
//           hint={isEdit 
//             ? "Change plan (trial dates won't auto-update - you must manually set them if needed)" 
//             : "Selecting a plan automatically fills trial days and end date"
//           }
//         />
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//           <InputField
//             label="Trial Days" name="trial_days" register={register} type="number"
//             placeholder="30" 
//             hint={isEdit 
//               ? "Manual entry - won't auto-update" 
//               : "Auto-filled when you select a plan"
//             }
//             readOnly={!isEdit && !!selectedPlanId} // Create mode mein readOnly agar plan select hai
//           />
//           <DatePickerField
//             label="Trial End Date" name="trial_end_date" control={control}
//             placeholder="Pick end date"
//             hint={isEdit 
//               ? "Manual entry - won't auto-update" 
//               : "Auto-computed from trial days"
//             }
//           />
//           <SelectField
//             label="Subscription Status" name="subscription_status" control={control}
//             options={SUB_STATUS_OPTIONS}
//           />
//         </div>

//         {/* ── Settings & Status ── */}
//         <SectionLabel>Settings &amp; Status</SectionLabel>
//         <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//           <SwitchField label="Is Active"    name="is_active"    control={control} hint="Inactive institutes cannot log in" />
//           <SwitchField label="Has Branches" name="has_branches" control={control} hint="Institute operates from multiple branches" />
//         </div>

//       </form>
//     </AppModal>
//   );
// }



// frontend/src/app/master-admin/institutes/page.jsx
// Complete InstituteFormModal component with all settings

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
    admin_email:          '',
    admin_password:       '',
    institute_role_id:    inst?.institute_role_id    ?? '',
    subscription_plan_id: inst?.subscription_plan_id ?? '',
    trial_days:           inst?.trial_days           ?? 30,
    trial_end_date:       inst?.trial_end_date
      ? new Date(inst.trial_end_date).toISOString().split('T')[0]
      : '',
    subscription_status:  inst?.subscription_status  ?? 'trial',
    is_active:            inst?.is_active             ?? true,
    
    // 🔥 FIXED: Settings fields with proper defaults
    has_branches:         inst?.settings?.has_branches ?? false,
    enable_parent_portal: inst?.settings?.enable_parent_portal ?? true,
    enable_teacher_portal: inst?.settings?.enable_teacher_portal ?? true,
    enable_student_portal: inst?.settings?.enable_student_portal ?? true,
    enable_sms_notifications: inst?.settings?.enable_sms_notifications ?? false,
  });

  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

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
    };

    // Remove individual settings fields from main data
    const { 
      has_branches, 
      enable_parent_portal, 
      enable_teacher_portal, 
      enable_student_portal, 
      enable_sms_notifications,
      ...mainData 
    } = data;

    // Add settings object to main data
    const submitData = {
      ...mainData,
      settings
    };

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

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? `✏️ Edit — ${institute?.institute_name}` : '➕ Register New Institute'}
      description={isEdit ? 'Update institute information' : 'Fill all required fields to register a new institute on the platform'}
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
      <form onSubmit={handleSubmit(handleInternalSubmit)} className="space-y-0.5">

        {/* ── Institute Identity ── */}
        <SectionLabel>Institute Identity</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            label="Institute Name" name="institute_name" register={register} error={errors.institute_name}
            rules={{ required: 'Name is required' }} placeholder="The Clouds Academy" required
          />
          <InputField
            label="Institute Code" name="institute_code" register={register} error={errors.institute_code}
            rules={{ required: 'Code is required' }} placeholder="TCA-LHR-001" required
            hint="Unique short code — auto UPPERCASE"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField
            label="Institute Type" name="institute_type_id" control={control} error={errors.institute_type_id}
            options={typeOptions} placeholder="Select type" required
            rules={{ required: 'Type is required' }}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Institute Logo</label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Institute logo"
                className="h-14 w-14 rounded-lg object-cover border border-slate-200"
              />
            )}
            <FileUpload
              accept="image/*"
              maxSize={2 * 1024 * 1024}
              onChange={handleLogoChange}
              onError={(msg) => toast.error(msg)}
            />
          </div>
        </div>

        {/* ── Contact & Address ── */}
        <SectionLabel>Contact &amp; Address</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            label="Institute Email" name="institute_email" register={register} error={errors.institute_email}
            rules={{ required: 'Email is required' }} placeholder="info@institute.edu.pk" required type="email"
          />
          <InputField
            label="Institute Contact No" name="institute_contact" register={register} error={errors.institute_contact}
            rules={{ required: 'Contact no is required' }} placeholder="+92-42-35761234" required
          />
        </div>
        <InputField
          label="Address" name="institute_address" register={register} error={errors.institute_address}
          rules={{ required: 'Address is required' }} placeholder="12-B, Gulberg III, Lahore" required
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InputField
            label="City" name="institute_city" register={register} error={errors.institute_city}
            rules={{ required: 'City is required' }} placeholder="Lahore" required
          />
          <SelectField label="Country" name="institute_country" control={control} options={COUNTRY_OPTIONS} />
          <InputField  label="Province / State" name="province" register={register} placeholder="Punjab" />
          <InputField  label="Zip / Postal"     name="institute_zip_code" register={register} placeholder="54000" />
        </div>

        {/* ── Principal / Owner ── */}
        <SectionLabel>Principal / Owner</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField
            label="Principal Name" name="principal_name" register={register} error={errors.principal_name}
            rules={{ required: 'Principal name is required' }} placeholder="Dr. Ahmed Raza" required
          />
          <InputField
            label="Principal Email" name="principal_email" register={register} error={errors.principal_email}
            rules={{ required: 'Principal email is required' }} placeholder="principal@institute.edu.pk" required type="email"
          />
          <InputField
            label="Principal Phone" name="principal_phone" register={register} error={errors.principal_phone}
            rules={{ required: 'Principal phone is required' }} placeholder="+92-300-1234567" required
          />
        </div>
        <div className="pt-3">
          <DatePickerField
            label="Joining Date" name="joining_date" control={control}
            placeholder="Select joining date"
            required
            hint="Date when the institute officially joined the platform"
          />
        </div>

        {/* ── Admin Login (create only) ── */}
        {!isEdit && (
          <>
            <SectionLabel>
              Admin Login Account
              <span className="text-muted-foreground normal-case font-normal ml-1">(optional)</span>
            </SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Admin Email"    name="admin_email"    register={register}
                placeholder="admin@institute.edu.pk" type="email"
                hint="Creates a portal login for the institute admin"
              />
              <InputField
                label="Admin Password" name="admin_password" register={register}
                placeholder="Min. 8 characters" type="password"
                hint="Temporary password — admin should change after first login"
              />
            </div>
          </>
        )}

        {/* ── Institute Role ── */}
        <SectionLabel>Institute Role</SectionLabel>
        <SelectField
          label="Assign Role (defines permissions)" name="institute_role_id" control={control}
          error={errors.institute_role_id}
          options={roleOptions.length > 0 ? roleOptions : [{ value: 'loading', label: '⏳ Loading roles…' }]}
          placeholder="Select platform role"
          rules={{ required: 'Role is required' }}
          required
          hint="Controls what institute admins can access on the portal"
        />

        {/* ── Subscription Plan & Trial ── */}
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

        {/* ── Settings & Status ── */}
        <SectionLabel>Portal Settings</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SwitchField 
            label="Has Branches" 
            name="has_branches" 
            control={control} 
            hint="Institute operates from multiple branches" 
          />
          <SwitchField 
            label="Enable Parent Portal" 
            name="enable_parent_portal" 
            control={control} 
            hint="Parents can login and view student data" 
            defaultChecked={true}
          />
          <SwitchField 
            label="Enable Teacher Portal" 
            name="enable_teacher_portal" 
            control={control} 
            hint="Teachers can login and manage classes" 
            defaultChecked={true}
          />
          <SwitchField 
            label="Enable Student Portal" 
            name="enable_student_portal" 
            control={control} 
            hint="Students can login and view their data" 
            defaultChecked={true}
          />
          <SwitchField 
            label="Enable SMS Notifications" 
            name="enable_sms_notifications" 
            control={control} 
            hint="Send SMS alerts for fees, attendance etc." 
            defaultChecked={false}
          />
        </div>

        {/* ── Status ── */}
        <SectionLabel>Account Status</SectionLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SwitchField 
            label="Is Active" 
            name="is_active" 
            control={control} 
            hint="Inactive institutes cannot log in" 
          />
        </div>

      </form>
    </AppModal>
  );
}