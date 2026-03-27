'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Link2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { feeTemplateService, classService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, FEE_COMPONENT_TYPES } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import {
  PageHeader, StatusBadge, ConfirmDialog, AppModal,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];

/* Compute total from components array */
const computeTotal = (components = []) =>
  components.reduce((sum, c) => sum + (c.type === 'discount' ? 0 : (c.amount ?? 0)), 0);

const COMPONENT_COLOUR = {
  tuition:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  exam:         'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  transport:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  lab:          'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  library:      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  activity:     'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  discount:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  fine:         'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  other:        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function FeeTemplatesPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.FEE_TEMPLATE_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.FEE_TEMPLATE_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['fee-templates'],
    queryFn:  () => feeTemplateService.getAll(),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const templates = extractRows(data);
  const classes   = extractRows(classesData);

  const createMutation = useMutation({
    mutationFn: feeTemplateService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-templates'] }); toast.success('Template created'); setCreateOpen(false); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => feeTemplateService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-templates'] }); toast.success('Template updated'); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => feeTemplateService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-templates'] }); toast.success('Template deleted'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, body }) => feeTemplateService.assign(id, body),
    onSuccess: () => { toast.success('Template assigned to selected classes'); setAssignTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fee Templates"
        description="Define fee structures and assign them to classes"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Template
            </Button>
          )
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>}

      {!isLoading && templates.length === 0 && (
        <p className="text-sm text-muted-foreground py-12 text-center">No fee templates yet.</p>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map((t) => {
          const total = computeTotal(t.components);
          return (
            <div key={t.id} className="rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{t.name}</h3>
                  {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                </div>
                <StatusBadge status={t.is_active !== false ? 'active' : 'inactive'} />
              </div>

              {/* Components */}
              <div className="flex flex-wrap gap-1.5">
                {(t.components ?? []).map((c, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${COMPONENT_COLOUR[c.type] ?? ''}`}
                  >
                    {c.label ?? c.type}: {c.type === 'discount' ? `-${c.percent ?? c.amount ?? 0}${c.percent ? '%' : ''}` : formatCurrency(c.amount ?? 0)}
                  </span>
                ))}
              </div>

              {/* Classes assigned */}
              {t.assigned_classes && t.assigned_classes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.assigned_classes.map((cls) => (
                    <Badge key={cls} variant="secondary" className="text-[10px]">{cls}</Badge>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t pt-3 mt-auto">
                <span className="text-xs text-muted-foreground">Monthly Total</span>
                <span className="font-bold text-base">{formatCurrency(total)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline" size="sm" className="flex-1 text-xs"
                  onClick={() => setAssignTarget(t)}
                >
                  <Link2 className="w-3.5 h-3.5 mr-1" /> Assign
                </Button>
                <Button
                  variant="outline" size="sm" className="px-2"
                  onClick={() => setEditTarget(t)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    variant="outline" size="sm" className="px-2 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(t)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Fee Template">
        <FeeTemplateForm
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
      </AppModal>

      {/* Edit modal */}
      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Fee Template">
        <FeeTemplateForm
          defaultValues={editTarget}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          isLoading={updateMutation.isPending}
        />
      </AppModal>

      {/* Assign modal */}
      <AppModal open={!!assignTarget} onClose={() => setAssignTarget(null)} title={`Assign "${assignTarget?.name}" to Classes`}>
        <AssignForm
          classes={classes}
          defaultSelected={assignTarget?.assigned_classes ?? []}
          onSubmit={(class_ids) => assignMutation.mutate({ id: assignTarget.id, body: { class_ids } })}
          onCancel={() => setAssignTarget(null)}
          isLoading={assignMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Template"
        description={`Delete fee template "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Fee template form ───────────────────────────────────────── */
/* Fee Template Form (react-hook-form) */
function FeeTemplateForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const componentTypeOptions = (FEE_COMPONENT_TYPES ?? [
    'tuition','exam','transport','lab','library','activity','discount','fine','other'
  ]).map((t) => ({ value: t?.value ?? t, label: t?.label ?? t }));

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:        defaultValues?.name        ?? '',
      description: defaultValues?.description ?? '',
      components:  defaultValues?.components ?? [{ type: 'tuition', label: 'Tuition Fee', amount: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'components' });

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      components: data.components.map((c) => ({ ...c, amount: c.amount ? Number(c.amount) : 0 })),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-1">
      <div className="space-y-1.5">
        <Label>Template Name <span className="text-destructive">*</span></Label>
        <Input {...register('name', { required: 'Required' })} placeholder="e.g. Class 1-2 Regular" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input {...register('description')} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Fee Components <span className="text-destructive">*</span></Label>
          <Button
            type="button" variant="ghost" size="sm" className="h-7 text-xs"
            onClick={() => append({ type: 'other', label: '', amount: '' })}
          >
            + Add
          </Button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-10 gap-2 items-start">
            <div className="col-span-3">
              <SelectField
                name={`components.${i}.type`}
                control={control}
                options={componentTypeOptions}
                placeholder="Type"
              />
            </div>
            <Input
              className="col-span-3"
              placeholder="Label"
              {...register(`components.${i}.label`)}
            />
            <Input
              type="number" min="0"
              className="col-span-3"
              placeholder="Amount (Rs)"
              {...register(`components.${i}.amount`)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex items-center justify-center text-muted-foreground hover:text-destructive mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save Template'}</Button>
      </div>
    </form>
  );
}

/* ─── Assign form ─────────────────────────────────────────────── */
function AssignForm({ classes, defaultSelected, onSubmit, onCancel, isLoading }) {
  const [selected, setSelected] = useState(new Set(defaultSelected));

  const toggle = (id) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="space-y-4 py-1">
      <p className="text-xs text-muted-foreground">Select classes to assign this fee template to.</p>
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {classes.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/40 px-2 py-1.5 rounded-md">
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="rounded border-gray-300"
            />
            {c.name}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button size="sm" disabled={isLoading} onClick={() => onSubmit([...selected])}>
          {isLoading ? 'Assigning…' : 'Assign'}
        </Button>
      </div>
    </div>
  );
}
