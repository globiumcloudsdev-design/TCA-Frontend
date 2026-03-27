
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus, Pencil, Trash2, Check, Star, Crown, Gem, Building2,
  Users, GraduationCap, GitBranch, HardDrive, RefreshCw,
  Bug, ChevronDown, ChevronUp, Eye, Power, Flame,
  X, Clock, Package, WifiOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  PageHeader, ConfirmDialog, AppModal,
  InputField, SwitchField, SelectField,
  EmptyState, StatsCard,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CYCLE_OPTIONS = [
  { value: 'MONTHLY',     label: 'Monthly' },
  { value: 'QUARTERLY',   label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half Yearly' },
  { value: 'YEARLY',      label: 'Yearly' },
];

const CURRENCY_OPTIONS = [
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

const CYCLE_BADGE_STYLE = {
  MONTHLY:     'bg-blue-100   text-blue-700   border-blue-200',
  QUARTERLY:   'bg-purple-100 text-purple-700 border-purple-200',
  HALF_YEARLY: 'bg-amber-100  text-amber-700  border-amber-200',
  YEARLY:      'bg-green-100  text-green-700  border-green-200',
};

const FEATURE_DEFS = [
  { key: 'student_management',   label: 'Student Management',   group: 'Core' },
  { key: 'teacher_management',   label: 'Teacher Management',   group: 'Core' },
  { key: 'parent_portal',        label: 'Parent Portal',        group: 'Core' },
  { key: 'attendance_system',    label: 'Attendance System',    group: 'Core' },
  { key: 'exam_management',      label: 'Exam & Results',       group: 'Core' },
  { key: 'fee_management',       label: 'Fee Management',       group: 'Core' },
  { key: 'payroll_management',   label: 'Payroll',              group: 'Advanced' },
  { key: 'library_management',   label: 'Library',              group: 'Advanced' },
  { key: 'transport_management', label: 'Transport',            group: 'Advanced' },
  { key: 'hostel_management',    label: 'Hostel',               group: 'Advanced' },
  { key: 'inventory_management', label: 'Inventory',            group: 'Advanced' },
  { key: 'sms_notifications',    label: 'SMS Notifications',    group: 'Communication' },
  { key: 'email_notifications',  label: 'Email Notifications',  group: 'Communication' },
  { key: 'push_notifications',   label: 'Push Notifications',   group: 'Communication' },
  { key: 'whatsapp_integration', label: 'WhatsApp',             group: 'Communication' },
  { key: 'basic_reports',        label: 'Basic Reports',        group: 'Reports' },
  { key: 'advanced_analytics',   label: 'Advanced Analytics',   group: 'Reports' },
  { key: 'custom_reports',       label: 'Custom Reports',       group: 'Reports' },
  { key: 'api_access',           label: 'API Access',           group: 'Integration' },
  { key: 'payment_gateway',      label: 'Payment Gateway',      group: 'Integration' },
  { key: 'priority_support',     label: 'Priority Support',     group: 'Support' },
  { key: 'dedicated_manager',    label: 'Dedicated Manager',    group: 'Support' },
  { key: 'training_sessions',    label: 'Training Sessions',    group: 'Support' },
];

const FEATURE_GROUPS = [...new Set(FEATURE_DEFS.map((f) => f.group))];

const PLAN_PALETTE = {
  basic:      { bg: 'bg-slate-50',   border: 'border-slate-200',   accent: 'text-slate-600',   iconBg: 'bg-slate-100',   hover: 'hover:border-slate-300' },
  standard:   { bg: 'bg-blue-50',    border: 'border-blue-200',    accent: 'text-blue-600',    iconBg: 'bg-blue-100',    hover: 'hover:border-blue-300' },
  premium:    { bg: 'bg-amber-50',   border: 'border-amber-200',   accent: 'text-amber-600',   iconBg: 'bg-amber-100',   hover: 'hover:border-amber-300' },
  enterprise: { bg: 'bg-purple-50',  border: 'border-purple-200',  accent: 'text-purple-600',  iconBg: 'bg-purple-100',  hover: 'hover:border-purple-300' },
};



function getPlanPalette(plan, idx) {
  const key = (plan.code ?? plan.name ?? '').toLowerCase();
  for (const k of ['enterprise', 'premium', 'standard', 'basic']) {
    if (key.includes(k)) return PLAN_PALETTE[k];
  }
  return Object.values(PLAN_PALETTE)[idx % 4];
}

function PlanIcon({ name, className }) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('enterprise')) return <Building2 className={className} />;
  if (n.includes('premium'))    return <Crown     className={className} />;
  if (n.includes('standard'))   return <Star      className={className} />;
  return <Gem className={className} />;
}

const fmtPrice = (p, c = 'PKR') =>
  p != null ? `${c} ${Number(p).toLocaleString()}` : '—';

function getEnabledFeatures(features) {
  if (!features || typeof features !== 'object') return [];
  return Object.entries(features)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURE_DEFS.find((f) => f.key === k)?.label ?? k);
}

// Flatten plan → form values
function planToForm(plan = {}) {
  const d = {
    name: '', code: '', description: '', cycle: 'MONTHLY',
    price: '', currency: 'PKR', trial_days: 30, display_order: 0,
    is_active: true, is_published: true, is_popular: false,
    max_branches: 1, max_students: 200, max_teachers: 12,
    max_staff: 10, max_admins: 2, storage_gb: 5,
    f_student_management: true,  f_teacher_management: true,
    f_parent_portal: true,       f_attendance_system: true,
    f_exam_management: true,     f_fee_management: true,
    f_email_notifications: true, f_basic_reports: true,
    f_payment_gateway: true,
  };
  FEATURE_DEFS.forEach(({ key }) => { if (!((`f_${key}`) in d)) d[`f_${key}`] = false; });
  if (!plan.id) return d;
  return {
    name:          plan.name          ?? d.name,
    code:          plan.code          ?? d.code,
    description:   plan.description   ?? d.description,
    cycle:         plan.cycle         ?? d.cycle,
    price:         plan.price         ?? d.price,
    currency:      plan.currency      ?? d.currency,
    trial_days:    plan.trial_days    ?? d.trial_days,
    display_order: plan.display_order ?? d.display_order,
    is_active:     plan.is_active     ?? d.is_active,
    is_published:  plan.is_published  ?? d.is_published,
    is_popular:    plan.is_popular    ?? d.is_popular,
    max_branches:  plan.limits?.max_branches ?? d.max_branches,
    max_students:  plan.limits?.max_students ?? d.max_students,
    max_teachers:  plan.limits?.max_teachers ?? d.max_teachers,
    max_staff:     plan.limits?.max_staff    ?? d.max_staff,
    max_admins:    plan.limits?.max_admins   ?? d.max_admins,
    storage_gb:    plan.limits?.storage_gb   ?? d.storage_gb,
    ...Object.fromEntries(
      FEATURE_DEFS.map(({ key }) => [`f_${key}`, plan.features?.[key] ?? d[`f_${key}`] ?? false])
    ),
  };
}

// Form values → API body
function formToBody(fv) {
  return {
    name:          fv.name,
    code:          (fv.code ?? '').toUpperCase(),
    description:   fv.description || null,
    cycle:         fv.cycle || 'MONTHLY',
    price:         parseFloat(fv.price) || 0,
    currency:      fv.currency || 'PKR',
    trial_days:    parseInt(fv.trial_days)    || 30,
    display_order: parseInt(fv.display_order) || 0,
    is_active:     !!fv.is_active,
    is_published:  !!fv.is_published,
    is_popular:    !!fv.is_popular,
    limits: {
      max_branches: parseInt(fv.max_branches) || 1,
      max_students: parseInt(fv.max_students) || 200,
      max_teachers: parseInt(fv.max_teachers) || 12,
      max_staff:    parseInt(fv.max_staff)    || 10,
      max_admins:   parseInt(fv.max_admins)   || 2,
      storage_gb:   parseInt(fv.storage_gb)   || 5,
    },
    features: Object.fromEntries(
      FEATURE_DEFS.map(({ key }) => [key, !!fv[`f_${key}`]])
    ),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionTemplatesPage() {
  const qc = useQueryClient();

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [debugOpen,    setDebugOpen]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [cycleFilter,  setCycleFilter]  = useState('');
  const [toggling,     setToggling]     = useState({});

  // ── Data fetch ────────────────────────────────────────────────────────────
  const {
    data: rawData, isLoading, isError, error,
    dataUpdatedAt, isFetching, refetch,
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn:  () => masterAdminService.getSubscriptionTemplates(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const planList = (() => {
    const d = rawData?.data ?? rawData?.plans ?? rawData ?? [];
    return Array.isArray(d) ? d : (d?.rows ?? []);
  })();

  const filtered = planList.filter((p) => {
    const ms = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase());
    const mc = !cycleFilter || p.cycle === cycleFilter;
    return ms && mc;
  });

  const stats = {
    total:     planList.length,
    active:    planList.filter((p) => p.is_active).length,
    published: planList.filter((p) => p.is_published).length,
    popular:   planList.filter((p) => p.is_popular).length,
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['subscription-plans'] });

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createSubscriptionTemplate(body),
    onSuccess: (res) => { invalidate(); toast.success(`Plan "${res?.data?.name ?? ''}" created`); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Create failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => masterAdminService.updateSubscriptionTemplate(id, body),
    onSuccess: (res) => { invalidate(); toast.success(`Plan "${res?.data?.name ?? ''}" updated`); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => masterAdminService.deleteSubscriptionTemplate(id),
    onSuccess: () => { invalidate(); toast.success('Plan deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, type }) => {
      if (type === 'publish') return masterAdminService.toggleSubscriptionPublish(id);
      if (type === 'popular') return masterAdminService.toggleSubscriptionPopular(id);
      return masterAdminService.toggleSubscriptionActive(id);
    },
    onMutate: ({ id, type }) => setToggling((p) => ({ ...p, [id]: type })),
    onSuccess: (res, { type }) => {
      invalidate();
      const plan  = res?.data;
      const label =
        type === 'publish' ? (plan?.is_published ? 'Published'      : 'Unpublished') :
        type === 'popular' ? (plan?.is_popular   ? 'Marked popular' : 'Removed popular') :
                              (plan?.is_active    ? 'Activated'      : 'Deactivated');
      toast.success(`${plan?.name ?? 'Plan'}: ${label}`);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Toggle failed'),
    onSettled: (_, __, { id }) => setToggling((p) => { const n = { ...p }; delete n[id]; return n; }),
  });

  const handleFormSubmit = (fv) => {
    const body = formToBody(fv);
    if (editTarget) updateMutation.mutate({ id: editTarget.id, body });
    else            createMutation.mutate(body);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <PageHeader
        title="📦 Subscription Plans"
        description="Define and manage plans available for institutes"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
              <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus size={14} /> New Plan
            </Button>
          </div>
        }
      />

      {/* ── Error banner ── */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <WifiOff size={15} />
          <span>{error?.response?.data?.message ?? error?.message ?? 'Cannot connect to backend'}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-red-600" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Plans"      value={isLoading ? '…' : stats.total}     icon={<Package size={16} />} />
        <StatsCard label="Active"           value={isLoading ? '…' : stats.active}    icon={<Power size={16} />} />
        <StatsCard label="Published"        value={isLoading ? '…' : stats.published} icon={<Eye size={16} />} />
        <StatsCard label="Popular / Pinned" value={isLoading ? '…' : stats.popular}   icon={<Flame size={16} />} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Cycles</option>
          {CYCLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(search || cycleFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCycleFilter(''); }}>
            <X size={13} className="mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* ── Plan Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[400px] rounded-2xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={planList.length === 0 ? 'No plans yet' : 'No matching plans'}
          description={planList.length === 0 ? 'Create your first subscription plan.' : 'Try adjusting your search or filter.'}
          action={planList.length === 0 && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus size={13} /> New Plan
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filtered.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              idx={idx}
              toggling={toggling[plan.id]}
              onEdit={() => setEditTarget(plan)}
              onDelete={() => setDeleteTarget(plan)}
              onToggle={(type) => toggleMutation.mutate({ id: plan.id, type })}
            />
          ))}
        </div>
      )}

      {/* ── Debug Panel ── */}
      <DebugPanel
        open={debugOpen}
        onToggle={() => setDebugOpen((v) => !v)}
        rawData={rawData}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isFetching={isFetching}
        dataUpdatedAt={dataUpdatedAt}
        planCount={planList.length}
      />

      {/* ── Create / Edit Modal ── */}
      <PlanFormModal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        plan={editTarget}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Subscription Plan"
        description={`Delete "${deleteTarget?.name}"? Institutes currently on this plan won't be affected immediately, but no new subscriptions will be allowed.`}
        confirmLabel="Delete Plan"
        variant="destructive"
      />
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, idx, toggling, onEdit, onDelete, onToggle }) {
  const palette    = getPlanPalette(plan, idx);
  const enabledFeat = getEnabledFeatures(plan.features);
  const cycleStyle  = CYCLE_BADGE_STYLE[plan.cycle] ?? 'bg-muted text-muted-foreground';

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border-2 p-5 shadow-sm transition-all',
      palette.bg, palette.border, palette.hover,
      !plan.is_active && 'opacity-60',
    )}>

      {/* Top-right badges - Stacked on mobile, side-by-side on larger screens */}
      <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[120px]">
        {plan.is_popular && (
          <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm whitespace-nowrap">
            🔥 Popular
          </span>
        )}
        {!plan.is_active && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 whitespace-nowrap">
            Inactive
          </span>
        )}
        {!plan.is_published && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 whitespace-nowrap">
            Draft
          </span>
        )}
      </div>

      {/* Header - Responsive layout */}
      <div className="flex items-start gap-3 mb-4 pr-24 sm:pr-28">
        <div className={cn('shrink-0 rounded-xl p-2.5 shadow-sm', palette.iconBg)}>
          <PlanIcon name={plan.code ?? plan.name} className={cn('size-5 sm:size-4', palette.accent)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 truncate text-base sm:text-lg leading-tight">
            {plan.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {plan.code && (
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase">
                {plan.code}
              </span>
            )}
            <span className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold',
              cycleStyle
            )}>
              {plan.cycle}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing - Responsive text */}
      <div className="mb-4">
        <p className={cn('text-2xl sm:text-3xl font-extrabold leading-tight', palette.accent)}>
          {fmtPrice(plan.price, plan.currency)}
          <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
            /{(plan.cycle ?? 'MONTHLY').toLowerCase()}
          </span>
        </p>
        {plan.trial_days > 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Clock size={12} className="shrink-0" />
            <span>{plan.trial_days}-day free trial</span>
          </p>
        )}
      </div>

      {/* Limits - Responsive grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: Users,         label: 'Students', val: plan.limits?.max_students ?? '∞' },
          { icon: GraduationCap, label: 'Teachers', val: plan.limits?.max_teachers ?? '∞' },
          { icon: GitBranch,     label: 'Branches', val: plan.limits?.max_branches ?? '∞' },
          { icon: HardDrive,     label: 'Storage',  val: plan.limits?.storage_gb   ? `${plan.limits.storage_gb} GB` : '∞' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
            <row.icon size={12} className="text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-none">{row.label}</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{row.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features - Responsive spacing */}
      <div className="flex-1 mb-4 space-y-1.5">
        {enabledFeat.slice(0, 5).map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
            <Check size={12} className="text-emerald-500 shrink-0" />
            <span className="truncate">{f}</span>
          </div>
        ))}
        {enabledFeat.length > 5 && (
          <p className="text-xs sm:text-sm text-muted-foreground pl-5">
            +{enabledFeat.length - 5} more features
          </p>
        )}
        {enabledFeat.length === 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground italic">No features enabled</p>
        )}
      </div>

      {/* Toggle row - Consistent switch styling */}
      <div className="mb-4 rounded-xl bg-white/70 border border-white/80 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Power size={14} className="shrink-0" />
            <span>Active</span>
          </div>
          <Switch
            checked={!!plan.is_active}
            onCheckedChange={() => onToggle('active')}
            disabled={toggling === 'active'}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Eye size={14} className="shrink-0" />
            <span>Published</span>
          </div>
          <Switch
            checked={!!plan.is_published}
            onCheckedChange={() => onToggle('publish')}
            disabled={toggling === 'publish'}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Flame size={14} className="shrink-0" />
            <span>Popular</span>
          </div>
          <Switch
            checked={!!plan.is_popular}
            onCheckedChange={() => onToggle('popular')}
            disabled={toggling === 'popular'}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      {/* Actions - Responsive buttons */}
      <div className="flex gap-2 mt-auto">
        <Button 
          size="default" 
          variant="outline" 
          className="flex-1 gap-2 text-sm h-9 sm:h-8" 
          onClick={onEdit}
        >
          <Pencil size={14} /> Edit
        </Button>
        <Button
          size="default"
          variant="outline"
          className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Debug Panel ─────────────────────────────────────────────────────────────

function DebugPanel({ open, onToggle, rawData, isLoading, isError, error, isFetching, dataUpdatedAt, planCount }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bug size={15} />
          <span>Debug Panel — Real-Time API</span>
          {isFetching && <span className="rounded-full bg-blue-100 px-2 py-px text-[10px] text-blue-600">Fetching…</span>}
          {isError    && <span className="rounded-full bg-red-100  px-2 py-px text-[10px] text-red-600">Error</span>}
          {!isError && !isLoading && <span className="rounded-full bg-green-100 px-2 py-px text-[10px] text-green-600">{planCount} plans</span>}
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="border-t border-dashed border-slate-300 p-4 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={cn('rounded-md px-2 py-1 font-mono', isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
              {isError ? '❌ ERROR' : isLoading ? '⏳ Loading' : '✅ OK'}
            </span>
            <span className="rounded-md bg-blue-100 px-2 py-1 font-mono text-blue-700">
              GET /api/v1/subscription-plans
            </span>
            {dataUpdatedAt > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-600">
                Updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-mono text-red-700 space-y-1">
              <p className="font-bold">Error Detail:</p>
              <p>{error?.response?.data?.message ?? error?.message ?? String(error)}</p>
              {error?.response?.status && <p>HTTP {error.response.status} — {error.response.statusText}</p>}
            </div>
          )}

          {rawData && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Raw Response:</p>
              <pre className="overflow-auto max-h-64 rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-300 leading-relaxed">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="mt-5 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5">
      {children}
    </p>
  );
}

// ─── Plan Form Modal ──────────────────────────────────────────────────────────

function PlanFormModal({ open, onClose, plan, onSubmit, loading }) {
  const isEdit = !!plan?.id;
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: planToForm(plan ?? {}),
  });

  useEffect(() => { reset(planToForm(plan ?? {})); }, [plan, reset]);

  const handleClose = () => { reset(planToForm({})); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? `✏️ Edit — ${plan.name}` : '➕ New Subscription Plan'}
      description={isEdit ? 'Update plan configuration' : 'Fill in details to create a new plan'}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="min-w-[110px] gap-1.5">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Plan')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0.5">

        <SectionLabel>Plan Identity</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="Plan Name" name="name" register={register} error={errors.name}
            rules={{ required: 'Name is required' }} placeholder="e.g. Standard" required />
          <InputField label="Code (unique, auto-uppercase)" name="code" register={register} error={errors.code}
            rules={{ required: 'Code is required' }} placeholder="e.g. STANDARD" required />
        </div>
        <InputField label="Description" name="description" register={register} placeholder="Brief description for institutes" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Billing Cycle" name="cycle" control={control} options={CYCLE_OPTIONS} required />
          <InputField  label="Display Order" name="display_order" register={register} type="number" placeholder="0" hint="Pricing page position (1 = first, 0 = last)" />
        </div>

        <SectionLabel>Pricing</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField label="Price" name="price" register={register} type="number" placeholder="5000"
            error={errors.price} rules={{ required: 'Price is required' }} required />
          <SelectField label="Currency" name="currency" control={control} options={CURRENCY_OPTIONS} />
          <InputField  label="Trial Days" name="trial_days" register={register} type="number" placeholder="30" />
        </div>

        <SectionLabel>Usage Limits</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InputField label="Max Branches"  name="max_branches"  register={register} type="number" placeholder="1" />
          <InputField label="Max Students"  name="max_students"  register={register} type="number" placeholder="200" />
          <InputField label="Max Teachers"  name="max_teachers"  register={register} type="number" placeholder="12" />
          <InputField label="Max Staff"     name="max_staff"     register={register} type="number" placeholder="10" />
          <InputField label="Max Admins"    name="max_admins"    register={register} type="number" placeholder="2" />
          <InputField label="Storage (GB)"  name="storage_gb"    register={register} type="number" placeholder="5" />
        </div>

        <SectionLabel>Features</SectionLabel>
        {FEATURE_GROUPS.map((group) => (
          <div key={group} className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">{group}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FEATURE_DEFS.filter((f) => f.group === group).map(({ key, label }) => (
                <SwitchField
                  key={key}
                  label={label}
                  name={`f_${key}`}
                  control={control}
                  className="border-slate-100 py-1.5 px-2.5 bg-muted/30"
                />
              ))}
            </div>
          </div>
        ))}

        <SectionLabel>Status Flags</SectionLabel>
        <div className="space-y-2">
          <SwitchField label="Active" name="is_active" control={control} hint="Inactive plans cannot be purchased" />
          <SwitchField label="Published" name="is_published" control={control} hint="Only published plans appear on public pricing page" />
          <SwitchField label="Mark as Popular" name="is_popular" control={control} hint="Highlights this plan as recommended" />
        </div>

      </form>
    </AppModal>
  );
}