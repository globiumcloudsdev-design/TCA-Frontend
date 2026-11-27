'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Bell, Loader2, CheckCircle2, Users } from 'lucide-react';
import { branchService } from '@/services/branchService';
import { classService, sectionService } from '@/services';
import { notificationService } from '@/services/notificationService';
import { getErrorMessage } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { buildNotificationPayload, describeAudience, ALL_ROLES, ROLE_LABELS, TITLE_MAX, BODY_MAX, rolesForScope } from '@/lib/notificationAudience';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';

const extract = (d) => {
  if (Array.isArray(d)) return d;
  const x = d?.data;
  if (Array.isArray(x)) return x;
  return x?.rows ?? x?.branches ?? x?.classes ?? x?.sections ?? d?.rows ?? [];
};

const FIELD = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-tca-primary focus:outline-none focus:ring-2 focus:ring-tca-primary/20 disabled:bg-slate-100';
const SCOPES = [
  ['all', 'Whole school'],
  ['branch', 'One campus'],
  ['class', 'One class'],
  ['section', 'One section'],
];

function Label({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-tca-dark">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}
const Err = ({ msg }) => (msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null);

export default function SendNotificationPage() {
  const authUser = useAuthStore((s) => s.user);
  const instName = authUser?.institute?.name || authUser?.school?.name || 'School';
  const [form, setForm] = useState({ title: '', message: '', scope: 'all', branch_id: '', class_id: '', section_id: '', roles: [...ALL_ROLES] });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const branchesQ = useQuery({ queryKey: ['notif-branches'], queryFn: () => branchService.getAll({ limit: 100 }), staleTime: 60_000 });
  const classesQ = useQuery({ queryKey: ['notif-classes'], queryFn: () => classService.getAll({ limit: 500, fetchAll: true }), staleTime: 60_000, enabled: form.scope === 'class' || form.scope === 'section' });
  const sectionsQ = useQuery({
    queryKey: ['notif-sections', form.class_id],
    queryFn: () => sectionService.getAll({ class_id: form.class_id, limit: 200 }),
    enabled: form.scope === 'section' && !!form.class_id,
    staleTime: 60_000,
  });

  const branches = extract(branchesQ.data);
  const classes = extract(classesQ.data);
  const sections = extract(sectionsQ.data);

  const names = {
    branch: branches.find((b) => b.id === form.branch_id)?.name,
    class: classes.find((c) => c.id === form.class_id)?.name,
    section: sections.find((s) => s.id === form.section_id)?.name,
  };
  const audienceText = describeAudience(form, names);

  const built = useMemo(() => buildNotificationPayload(form), [form]);

  // Live recipient count for the preview (only when the audience itself is complete)
  const audience = built.ok ? built.payload.audience : null;
  const previewQ = useQuery({
    queryKey: ['notif-preview', JSON.stringify(audience)],
    queryFn: () => notificationService.previewAudience(audience),
    enabled: !!audience,
    staleTime: 30_000,
    retry: false,
  });
  const previewCount = previewQ.data?.data?.count;

  const sendMut = useMutation({
    mutationFn: (payload) => notificationService.sendToAudience(payload),
    onSuccess: (res) => {
      setConfirmOpen(false);
      setResult(res?.data ?? res ?? {});
      toast.success('Notification sent');
    },
    onError: (e) => {
      setConfirmOpen(false);
      toast.error(getErrorMessage(e));
    },
  });

  const toggleRole = (r) => set({ roles: form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r] });

  const review = (e) => {
    e.preventDefault();
    if (!built.ok) {
      setErrors(built.errors);
      toast.error('Please fix the highlighted fields');
      return;
    }
    setErrors({});
    setResult(null);
    setConfirmOpen(true);
  };

  const reset = () => {
    setForm({ title: '', message: '', scope: 'all', branch_id: '', class_id: '', section_id: '', roles: [...ALL_ROLES] });
    setResult(null);
    setErrors({});
  };

  // Success summary (backend field names are read defensively)
  const recipients = result?.recipients ?? null;
  const pushInfo = result?.push; // { enabled, queued }

  return (
    <div className="space-y-6">
      <PageHeader title="Send Notification" description="Send a message to parents, students, teachers or staff. It appears in their inbox and as a phone notification." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={review} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div>
            <Label required>Title</Label>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} maxLength={TITLE_MAX + 20} placeholder="e.g. School closed tomorrow" className={FIELD} />
            <div className="flex justify-between">
              <Err msg={errors.title} />
              <span className="ml-auto text-[11px] text-slate-400">{form.title.length}/{TITLE_MAX}</span>
            </div>
          </div>

          <div>
            <Label required>Message</Label>
            <textarea value={form.message} onChange={(e) => set({ message: e.target.value })} rows={5} placeholder="Write the message people will read…" className={`${FIELD} h-auto py-2`} />
            <div className="flex justify-between">
              <Err msg={errors.message} />
              <span className="ml-auto text-[11px] text-slate-400">{form.message.length}/{BODY_MAX}</span>
            </div>
          </div>

          <div>
            <Label required>Who should get it?</Label>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set({ scope: value, branch_id: '', class_id: '', section_id: '', roles: [...rolesForScope(value)] })}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${form.scope === value ? 'border-tca-primary bg-tca-primary text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Err msg={errors.scope} />
          </div>

          {form.scope === 'branch' && (
            <div>
              <Label required>Campus</Label>
              <select value={form.branch_id} onChange={(e) => set({ branch_id: e.target.value })} className={FIELD} disabled={branchesQ.isLoading}>
                <option value="">{branchesQ.isLoading ? 'Loading campuses…' : 'Select campus'}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <Err msg={errors.branch_id || (branchesQ.error && getErrorMessage(branchesQ.error))} />
            </div>
          )}

          {(form.scope === 'class' || form.scope === 'section') && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Class</Label>
                <select value={form.class_id} onChange={(e) => set({ class_id: e.target.value, section_id: '' })} className={FIELD} disabled={classesQ.isLoading}>
                  <option value="">{classesQ.isLoading ? 'Loading classes…' : 'Select class'}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Err msg={errors.class_id || (classesQ.error && getErrorMessage(classesQ.error))} />
              </div>
              {form.scope === 'section' && (
                <div>
                  <Label required>Section</Label>
                  <select value={form.section_id} onChange={(e) => set({ section_id: e.target.value })} className={FIELD} disabled={!form.class_id || sectionsQ.isLoading}>
                    <option value="">{!form.class_id ? 'Select class first' : sectionsQ.isLoading ? 'Loading sections…' : sections.length ? 'Select section' : 'No sections'}</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <Err msg={errors.section_id || (sectionsQ.error && getErrorMessage(sectionsQ.error))} />
                </div>
              )}
            </div>
          )}

          <div>
            <Label required>Send to</Label>
            <div className="flex flex-wrap gap-3">
              {rolesForScope(form.scope).map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleRole(r)} className="h-4 w-4 accent-tca-primary" />
                  {ROLE_LABELS[r]}
                </label>
              ))}
            </div>
            {(form.scope === 'class' || form.scope === 'section') && form.roles.includes('PARENT') && (
              <p className="mt-1 text-xs text-slate-500">Parents of the students in the selected {form.scope} will be included.</p>
            )}
            <Err msg={errors.roles} />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={reset} disabled={sendMut.isPending}>Clear</Button>
            <Button type="submit" className="bg-tca-primary text-white hover:bg-tca-primary/90" disabled={sendMut.isPending}>
              <Send className="mr-2 h-4 w-4" /> Review &amp; send
            </Button>
          </div>
        </form>

        {/* Preview + result */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Preview</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-tca-primary p-2 text-white"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-slate-900">{form.title.trim() || 'Notification title'}</p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-600">{form.message.trim() || 'Your message will appear here.'}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{instName} · now</p>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-tca-primary" />
              <span>
                Will be sent to <b>{audienceText}</b>
                {previewQ.isLoading && audience ? ' (counting…)' : ''}
                {typeof previewCount === 'number' && (
                  <>
                    {' '}— about <b>{previewCount}</b> {previewCount === 1 ? 'person' : 'people'}
                    {previewQ.data?.data?.by_role && Object.keys(previewQ.data.data.by_role).length > 0 && (
                      <span className="text-slate-500"> ({Object.entries(previewQ.data.data.by_role).map(([r, n]) => `${n} ${(ROLE_LABELS[r] || r).toLowerCase()}`).join(', ')})</span>
                    )}
                  </>
                )}
                .
              </span>
            </p>
          </div>

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" /> Notification sent</p>
              <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                <li>Sent to <b>{audienceText}</b>.</li>
                {recipients !== null && <li><b>{String(recipients)}</b> {Number(recipients) === 1 ? 'person' : 'people'} received it in their inbox.</li>}
                {pushInfo?.enabled === true && <li>Phone notifications are being sent now.</li>}
                {pushInfo?.enabled === false && <li>Phone alerts are not switched on yet, so people will see it in their inbox only.</li>}
                {recipients === null && !pushInfo && <li>It is now in their inbox.</li>}
              </ul>
              <Button variant="outline" size="sm" className="mt-3" onClick={reset}>Send another</Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !sendMut.isPending && setConfirmOpen(false)}
        onConfirm={() => built.ok && sendMut.mutate(built.payload)}
        loading={sendMut.isPending}
        title="Send this notification?"
        description={`“${form.title.trim()}” will be sent to ${audienceText}${typeof previewCount === 'number' ? ` (about ${previewCount} ${previewCount === 1 ? 'person' : 'people'})` : ''}. This can’t be undone.`}
        confirmLabel="Send now"
        variant="default"
      />
    </div>
  );
}
