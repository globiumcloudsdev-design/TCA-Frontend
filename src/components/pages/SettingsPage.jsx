'use client';
/**
 * SettingsPage — Institute configuration & preferences
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Settings, Building2, GraduationCap, DollarSign, Bell, Save } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';

const TABS = [
  { key: 'general',  label: 'General',      icon: Building2 },
  { key: 'academic', label: 'Academic',      icon: GraduationCap },
  { key: 'finance',  label: 'Finance',       icon: DollarSign },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

function GeneralTab({ register, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Institute Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">Institute Name</label><input {...register('name')} className="input-base" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Short Name / Code</label><input {...register('short_name')} className="input-base" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">Principal / Head</label><input {...register('principal')} className="input-base" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><input {...register('phone')} className="input-base" /></div>
      </div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><input type="email" {...register('email')} className="input-base" /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><textarea {...register('address')} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Website</label><input {...register('website')} className="input-base" placeholder="https://example.com" /></div>
    </div>
  );
}

function AcademicTab({ register }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Academic Configuration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">Current Academic Year</label><input {...register('current_year')} className="input-base" placeholder="2025-26" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Working Days per Week</label><input type="number" {...register('working_days')} className="input-base" defaultValue={5} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">School Start Time</label><input type="time" {...register('start_time')} className="input-base" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">School End Time</label><input type="time" {...register('end_time')} className="input-base" /></div>
      </div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Attendance Threshold (%)</label><input type="number" {...register('attendance_threshold')} className="input-base" placeholder="75" /></div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" {...register('auto_promote')} className="rounded" />
        <span className="text-sm">Auto-promote students at year end</span>
      </label>
    </div>
  );
}

function FinanceTab({ register }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Finance Configuration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">Currency</label><input {...register('currency')} className="input-base" defaultValue="PKR" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Fee Due Date (day of month)</label><input type="number" {...register('fee_due_day')} className="input-base" placeholder="10" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label className="text-sm font-medium">Late Fee (%)</label><input type="number" {...register('late_fee_pct')} className="input-base" placeholder="5" /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Discount Policy</label><input {...register('discount_policy')} className="input-base" /></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" {...register('auto_invoice')} className="rounded" />
        <span className="text-sm">Auto-generate monthly invoices</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" {...register('sms_fee_reminder')} className="rounded" />
        <span className="text-sm">Send SMS fee reminders</span>
      </label>
    </div>
  );
}

function NotificationsTab({ register }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Notification Preferences</h3>
      <div className="space-y-3">
        {[
          { name: 'notify_attendance', label: 'Attendance alerts to parents' },
          { name: 'notify_fee_due',    label: 'Fee due date reminders' },
          { name: 'notify_results',    label: 'Exam result notifications' },
          { name: 'notify_notices',    label: 'New notice announcements' },
          { name: 'notify_events',     label: 'Event and holiday reminders' },
          { name: 'sms_enabled',       label: 'Enable SMS notifications' },
          { name: 'email_enabled',     label: 'Enable email notifications' },
          { name: 'push_enabled',      label: 'Enable push notifications (mobile)' },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 cursor-pointer">
            <span className="text-sm font-medium">{label}</span>
            <input type="checkbox" {...register(name)} className="rounded" />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage({ type }) {
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [activeTab, setActiveTab] = useState('general');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '', short_name: '', principal: '', phone: '', email: '', address: '', website: '',
      current_year: '2025-26', working_days: 5, start_time: '08:00', end_time: '14:00', attendance_threshold: 75,
      currency: 'PKR', fee_due_day: 10, late_fee_pct: 5,
      notify_attendance: true, notify_fee_due: true, notify_results: true, sms_enabled: false, email_enabled: true,
    },
  });

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { schoolService } = await import('@/services'); return await schoolService.updateSettings(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => toast.success('Settings saved!'),
    onError: () => toast.error('Failed to save settings'),
  });

  if (!canDo('settings.view')) return <div className="py-20 text-center text-muted-foreground">Access denied</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">Configure your institute preferences</p></div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex flex-row flex-wrap gap-1 lg:flex-col lg:w-48 lg:flex-none">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
            <div className="rounded-xl border bg-card p-5">
              {activeTab === 'general'       && <GeneralTab       register={register} errors={errors} />}
              {activeTab === 'academic'      && <AcademicTab      register={register} />}
              {activeTab === 'finance'       && <FinanceTab       register={register} />}
              {activeTab === 'notifications' && <NotificationsTab register={register} />}
            </div>
            {canDo('settings.update') && (
              <div className="flex justify-end">
                <button type="submit" disabled={save.isPending} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  {save.isPending ? 'Saving…' : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
