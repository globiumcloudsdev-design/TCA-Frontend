// 'use client';
// /**
//  * SettingsPage — Institute configuration & preferences
//  */
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { useMutation } from '@tanstack/react-query';
// import { Settings, Building2, GraduationCap, DollarSign, Bell, Save } from 'lucide-react';
// import useInstituteConfig from '@/hooks/useInstituteConfig';
// import useAuthStore from '@/store/authStore';

// const TABS = [
//   { key: 'general',  label: 'General',      icon: Building2 },
//   { key: 'academic', label: 'Academic',      icon: GraduationCap },
//   { key: 'finance',  label: 'Finance',       icon: DollarSign },
//   { key: 'notifications', label: 'Notifications', icon: Bell },
// ];

// function GeneralTab({ register, errors }) {
//   return (
//     <div className="space-y-4">
//       <h3 className="font-semibold">Institute Information</h3>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">Institute Name</label><input {...register('name')} className="input-base" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">Short Name / Code</label><input {...register('short_name')} className="input-base" /></div>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">Principal / Head</label><input {...register('principal')} className="input-base" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><input {...register('phone')} className="input-base" /></div>
//       </div>
//       <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><input type="email" {...register('email')} className="input-base" /></div>
//       <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><textarea {...register('address')} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
//       <div className="space-y-1.5"><label className="text-sm font-medium">Website</label><input {...register('website')} className="input-base" placeholder="https://example.com" /></div>
//     </div>
//   );
// }

// function AcademicTab({ register }) {
//   return (
//     <div className="space-y-4">
//       <h3 className="font-semibold">Academic Configuration</h3>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">Current Academic Year</label><input {...register('current_year')} className="input-base" placeholder="2025-26" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">Working Days per Week</label><input type="number" {...register('working_days')} className="input-base" defaultValue={5} /></div>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">School Start Time</label><input type="time" {...register('start_time')} className="input-base" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">School End Time</label><input type="time" {...register('end_time')} className="input-base" /></div>
//       </div>
//       <div className="space-y-1.5"><label className="text-sm font-medium">Attendance Threshold (%)</label><input type="number" {...register('attendance_threshold')} className="input-base" placeholder="75" /></div>
//       <label className="flex items-center gap-2 cursor-pointer select-none">
//         <input type="checkbox" {...register('auto_promote')} className="rounded" />
//         <span className="text-sm">Auto-promote students at year end</span>
//       </label>
//     </div>
//   );
// }

// function FinanceTab({ register }) {
//   return (
//     <div className="space-y-4">
//       <h3 className="font-semibold">Finance Configuration</h3>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">Currency</label><input {...register('currency')} className="input-base" defaultValue="PKR" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">Fee Due Date (day of month)</label><input type="number" {...register('fee_due_day')} className="input-base" placeholder="10" /></div>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-1.5"><label className="text-sm font-medium">Late Fee (%)</label><input type="number" {...register('late_fee_pct')} className="input-base" placeholder="5" /></div>
//         <div className="space-y-1.5"><label className="text-sm font-medium">Discount Policy</label><input {...register('discount_policy')} className="input-base" /></div>
//       </div>
//       <label className="flex items-center gap-2 cursor-pointer select-none">
//         <input type="checkbox" {...register('auto_invoice')} className="rounded" />
//         <span className="text-sm">Auto-generate monthly invoices</span>
//       </label>
//       <label className="flex items-center gap-2 cursor-pointer select-none">
//         <input type="checkbox" {...register('sms_fee_reminder')} className="rounded" />
//         <span className="text-sm">Send SMS fee reminders</span>
//       </label>
//     </div>
//   );
// }

// function NotificationsTab({ register }) {
//   return (
//     <div className="space-y-4">
//       <h3 className="font-semibold">Notification Preferences</h3>
//       <div className="space-y-3">
//         {[
//           { name: 'notify_attendance', label: 'Attendance alerts to parents' },
//           { name: 'notify_fee_due',    label: 'Fee due date reminders' },
//           { name: 'notify_results',    label: 'Exam result notifications' },
//           { name: 'notify_notices',    label: 'New notice announcements' },
//           { name: 'notify_events',     label: 'Event and holiday reminders' },
//           { name: 'sms_enabled',       label: 'Enable SMS notifications' },
//           { name: 'email_enabled',     label: 'Enable email notifications' },
//           { name: 'push_enabled',      label: 'Enable push notifications (mobile)' },
//         ].map(({ name, label }) => (
//           <label key={name} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 cursor-pointer">
//             <span className="text-sm font-medium">{label}</span>
//             <input type="checkbox" {...register(name)} className="rounded" />
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function SettingsPage({ type }) {
//   const canDo = useAuthStore((s) => s.canDo);
//   const { terms } = useInstituteConfig();
//   const [activeTab, setActiveTab] = useState('general');

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     defaultValues: {
//       name: '', short_name: '', principal: '', phone: '', email: '', address: '', website: '',
//       current_year: '2025-26', working_days: 5, start_time: '08:00', end_time: '14:00', attendance_threshold: 75,
//       currency: 'PKR', fee_due_day: 10, late_fee_pct: 5,
//       notify_attendance: true, notify_fee_due: true, notify_results: true, sms_enabled: false, email_enabled: true,
//     },
//   });

//   const save = useMutation({
//     mutationFn: async (vals) => {
//       try { const { schoolService } = await import('@/services'); return await schoolService.updateSettings(vals); }
//       catch { return { data: vals }; }
//     },
//     onSuccess: () => toast.success('Settings saved!'),
//     onError: () => toast.error('Failed to save settings'),
//   });

//   if (!canDo('settings.view')) return <div className="py-20 text-center text-muted-foreground">Access denied</div>;

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div><h1 className="text-xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">Configure your institute preferences</p></div>
//       </div>

//       <div className="flex flex-col gap-5 lg:flex-row">
//         {/* Sidebar tabs */}
//         <nav className="flex flex-row flex-wrap gap-1 lg:flex-col lg:w-48 lg:flex-none">
//           {TABS.map(({ key, label, icon: Icon }) => (
//             <button key={key} onClick={() => setActiveTab(key)}
//               className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
//               <Icon size={15} /> {label}
//             </button>
//           ))}
//         </nav>

//         {/* Tab content */}
//         <div className="flex-1">
//           <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
//             <div className="rounded-xl border bg-card p-5">
//               {activeTab === 'general'       && <GeneralTab       register={register} errors={errors} />}
//               {activeTab === 'academic'      && <AcademicTab      register={register} />}
//               {activeTab === 'finance'       && <FinanceTab       register={register} />}
//               {activeTab === 'notifications' && <NotificationsTab register={register} />}
//             </div>
//             {canDo('settings.update') && (
//               <div className="flex justify-end">
//                 <button type="submit" disabled={save.isPending} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
//                   {save.isPending ? 'Saving…' : <><Save size={14} /> Save Changes</>}
//                 </button>
//               </div>
//             )}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }








// src/app/(dashboard)/settings/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Upload, 
  Trash2, 
  Save,
  Settings as SettingsIcon,
  Shield,
  FileText,
  Users,
  CreditCard,
  Bell,
  Palette,
  Lock,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Camera,
  Loader2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import useAuthStore from '@/store/authStore';
import { instituteService } from '@/services/instituteService';
import PolicyManagement from '@/components/settings/PolicyManagement';
import { cn } from '@/lib/utils';

// Tab configurations
const TABS = [
  { id: 'general', label: 'General Settings', icon: Building2 },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'academic', label: 'Academic Settings', icon: Calendar },
  { id: 'finance', label: 'Finance Settings', icon: CreditCard },
  { id: 'communication', label: 'Communication', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'backup', label: 'Backup & Data', icon: Database },
];

export default function SettingsPage() {
  const { user, institute, setInstitute } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    registration_no: '',
    established_year: '',
    description: ''
  });

  const [academicForm, setAcademicForm] = useState({
    session_start_month: 'April',
    session_end_month: 'March',
    grading_system: 'percentage',
    default_language: 'en',
    timezone: 'Asia/Karachi'
  });

  const [financeForm, setFinanceForm] = useState({
    currency: 'PKR',
    tax_rate: 0,
    late_fee_percentage: 5,
    discount_auto_apply: true,
    receipt_prefix: 'INV',
    payment_terms_days: 30
  });

  const [communicationForm, setCommunicationForm] = useState({
    welcome_email: true,
    attendance_alerts: true,
    fee_reminders: true,
    exam_notifications: true,
    parent_portal_access: true,
    sms_enabled: false,
    email_signature: ''
  });

  const [appearanceForm, setAppearanceForm] = useState({
    primary_color: '#10b981',
    secondary_color: '#3b82f6',
    logo_url: '',
    favicon_url: '',
    portal_title: '',
    login_bg_url: ''
  });

  const [securityForm, setSecurityForm] = useState({
    two_factor_auth: false,
    password_expiry_days: 90,
    session_timeout_minutes: 30,
    ip_whitelist: '',
    max_login_attempts: 5
  });

  // Fetch institute data
  const { data: instituteData, isLoading, refetch } = useQuery({
    queryKey: ['institute', institute?.id],
    queryFn: () => instituteService.getById(institute?.id),
    enabled: !!institute?.id,
    onSuccess: (data) => {
      // Populate forms with fetched data
      if (data?.data) {
        const inst = data.data;
        setGeneralForm({
          name: inst.name || '',
          email: inst.email || '',
          phone: inst.phone || '',
          address: inst.address || '',
          website: inst.website || '',
          registration_no: inst.registration_no || '',
          established_year: inst.established_year || '',
          description: inst.description || ''
        });
        setAppearanceForm(prev => ({
          ...prev,
          logo_url: inst.logo_url || '',
          favicon_url: inst.favicon_url || ''
        }));
        
        // Load settings if available
        if (inst.settings) {
          setAcademicForm(prev => ({ ...prev, ...inst.settings.academic }));
          setFinanceForm(prev => ({ ...prev, ...inst.settings.finance }));
          setCommunicationForm(prev => ({ ...prev, ...inst.settings.communication }));
          setAppearanceForm(prev => ({ ...prev, ...inst.settings.appearance }));
          setSecurityForm(prev => ({ ...prev, ...inst.settings.security }));
        }
      }
    }
  });

  // Mutations
  const updateInstituteMutation = useMutation({
    mutationFn: ({ id, data }) => instituteService.update(id, data),
    onSuccess: (response) => {
      setInstitute(response.data);
      queryClient.invalidateQueries(['institute', institute?.id]);
      toast.success('Institute settings updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    }
  });

  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }) => instituteService.uploadLogo(id, file),
    onSuccess: (response) => {
      setAppearanceForm(prev => ({ ...prev, logo_url: response.data.logo_url }));
      setInstitute({ ...institute, logo_url: response.data.logo_url });
      queryClient.invalidateQueries(['institute', institute?.id]);
      toast.success('Logo uploaded successfully');
      setUploadingLogo(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to upload logo');
      setUploadingLogo(false);
    }
  });

  const removeLogoMutation = useMutation({
    mutationFn: (id) => instituteService.removeLogo(id),
    onSuccess: () => {
      setAppearanceForm(prev => ({ ...prev, logo_url: '' }));
      setInstitute({ ...institute, logo_url: '' });
      queryClient.invalidateQueries(['institute', institute?.id]);
      toast.success('Logo removed successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove logo');
    }
  });

  // Handlers
  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: generalForm
    });
  };

  const handleAcademicSubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: { settings: { academic: academicForm } }
    });
  };

  const handleFinanceSubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: { settings: { finance: financeForm } }
    });
  };

  const handleCommunicationSubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: { settings: { communication: communicationForm } }
    });
  };

  const handleAppearanceSubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: { settings: { appearance: appearanceForm } }
    });
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    updateInstituteMutation.mutate({
      id: institute?.id,
      data: { settings: { security: securityForm } }
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    uploadLogoMutation.mutate({ id: institute?.id, file });
  };

  const handleRemoveLogo = () => {
    if (confirm('Are you sure you want to remove the logo?')) {
      removeLogoMutation.mutate(institute?.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your institute settings and configurations
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 size={20} className="text-primary" />
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Basic information about your institute</p>
                </div>

                <form onSubmit={handleGeneralSubmit} className="p-6 space-y-6">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="relative">
                      {appearanceForm.logo_url ? (
                        <div className="relative group">
                          <Image
                            src={appearanceForm.logo_url}
                            alt="Institute Logo"
                            width={80}
                            height={80}
                            className="rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Building2 size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition">
                        <Upload size={16} />
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px, max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Institute Name *</label>
                      <input
                        type="text"
                        value={generalForm.name}
                        onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Registration Number</label>
                      <input
                        type="text"
                        value={generalForm.registration_no}
                        onChange={(e) => setGeneralForm({ ...generalForm, registration_no: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={generalForm.email}
                        onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={generalForm.phone}
                        onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <input
                        type="url"
                        value={generalForm.website}
                        onChange={(e) => setGeneralForm({ ...generalForm, website: e.target.value })}
                        className="input-base w-full"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Established Year</label>
                      <input
                        type="number"
                        value={generalForm.established_year}
                        onChange={(e) => setGeneralForm({ ...generalForm, established_year: e.target.value })}
                        className="input-base w-full"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <textarea
                        value={generalForm.address}
                        onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                        className="input-base w-full"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={generalForm.description}
                        onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                        className="input-base w-full"
                        rows={3}
                        placeholder="About your institute..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === 'policies' && (
              <PolicyManagement />
            )}

            {/* Academic Settings Tab */}
            {activeTab === 'academic' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    Academic Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure academic year and grading preferences</p>
                </div>

                <form onSubmit={handleAcademicSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Session Start Month</label>
                      <select
                        value={academicForm.session_start_month}
                        onChange={(e) => setAcademicForm({ ...academicForm, session_start_month: e.target.value })}
                        className="input-base w-full"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session End Month</label>
                      <select
                        value={academicForm.session_end_month}
                        onChange={(e) => setAcademicForm({ ...academicForm, session_end_month: e.target.value })}
                        className="input-base w-full"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Grading System</label>
                      <select
                        value={academicForm.grading_system}
                        onChange={(e) => setAcademicForm({ ...academicForm, grading_system: e.target.value })}
                        className="input-base w-full"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="gpa">GPA (4.0 Scale)</option>
                        <option value="letter">Letter Grade (A-F)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Language</label>
                      <select
                        value={academicForm.default_language}
                        onChange={(e) => setAcademicForm({ ...academicForm, default_language: e.target.value })}
                        className="input-base w-full"
                      >
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Zone</label>
                      <select
                        value={academicForm.timezone}
                        onChange={(e) => setAcademicForm({ ...academicForm, timezone: e.target.value })}
                        className="input-base w-full"
                      >
                        <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Finance Settings Tab */}
            {activeTab === 'finance' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Finance Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure fee collection and financial preferences</p>
                </div>

                <form onSubmit={handleFinanceSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <select
                        value={financeForm.currency}
                        onChange={(e) => setFinanceForm({ ...financeForm, currency: e.target.value })}
                        className="input-base w-full"
                      >
                        <option value="PKR">PKR - Pakistani Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="AED">AED - Dirham</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={financeForm.tax_rate}
                        onChange={(e) => setFinanceForm({ ...financeForm, tax_rate: parseFloat(e.target.value) })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Late Fee Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={financeForm.late_fee_percentage}
                        onChange={(e) => setFinanceForm({ ...financeForm, late_fee_percentage: parseFloat(e.target.value) })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Terms (Days)</label>
                      <input
                        type="number"
                        value={financeForm.payment_terms_days}
                        onChange={(e) => setFinanceForm({ ...financeForm, payment_terms_days: parseInt(e.target.value) })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Receipt Prefix</label>
                      <input
                        type="text"
                        value={financeForm.receipt_prefix}
                        onChange={(e) => setFinanceForm({ ...financeForm, receipt_prefix: e.target.value })}
                        className="input-base w-full"
                        placeholder="INV"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={financeForm.discount_auto_apply}
                        onChange={(e) => setFinanceForm({ ...financeForm, discount_auto_apply: e.target.checked })}
                        className="rounded"
                      />
                      Auto-apply discounts based on policy
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Communication Settings Tab */}
            {activeTab === 'communication' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell size={20} className="text-primary" />
                    Communication Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure notifications and alerts</p>
                </div>

                <form onSubmit={handleCommunicationSubmit} className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.welcome_email}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, welcome_email: e.target.checked })}
                        className="rounded"
                      />
                      <span>Send welcome email to new students</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.attendance_alerts}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, attendance_alerts: e.target.checked })}
                        className="rounded"
                      />
                      <span>Send attendance alerts to parents</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.fee_reminders}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, fee_reminders: e.target.checked })}
                        className="rounded"
                      />
                      <span>Send fee due reminders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.exam_notifications}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, exam_notifications: e.target.checked })}
                        className="rounded"
                      />
                      <span>Send exam schedule notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.parent_portal_access}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, parent_portal_access: e.target.checked })}
                        className="rounded"
                      />
                      <span>Enable parent portal access</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={communicationForm.sms_enabled}
                        onChange={(e) => setCommunicationForm({ ...communicationForm, sms_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span>Enable SMS notifications (additional charges apply)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email Signature</label>
                    <textarea
                      value={communicationForm.email_signature}
                      onChange={(e) => setCommunicationForm({ ...communicationForm, email_signature: e.target.value })}
                      className="input-base w-full"
                      rows={3}
                      placeholder="Best regards,&#10;Your Institute Name"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Settings Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Palette size={20} className="text-primary" />
                    Appearance Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your portal</p>
                </div>

                <form onSubmit={handleAppearanceSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={appearanceForm.primary_color}
                          onChange={(e) => setAppearanceForm({ ...appearanceForm, primary_color: e.target.value })}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={appearanceForm.primary_color}
                          onChange={(e) => setAppearanceForm({ ...appearanceForm, primary_color: e.target.value })}
                          className="input-base flex-1"
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Secondary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={appearanceForm.secondary_color}
                          onChange={(e) => setAppearanceForm({ ...appearanceForm, secondary_color: e.target.value })}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={appearanceForm.secondary_color}
                          onChange={(e) => setAppearanceForm({ ...appearanceForm, secondary_color: e.target.value })}
                          className="input-base flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Portal Title</label>
                      <input
                        type="text"
                        value={appearanceForm.portal_title}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, portal_title: e.target.value })}
                        className="input-base w-full"
                        placeholder="The Clouds Academy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Favicon URL</label>
                      <input
                        type="url"
                        value={appearanceForm.favicon_url}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, favicon_url: e.target.value })}
                        className="input-base w-full"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Login Page Background URL</label>
                      <input
                        type="url"
                        value={appearanceForm.login_bg_url}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, login_bg_url: e.target.value })}
                        className="input-base w-full"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium mb-3">Preview</p>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: appearanceForm.primary_color }}
                      >
                        Primary
                      </div>
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: appearanceForm.secondary_color }}
                      >
                        Secondary
                      </div>
                      <button
                        className="px-4 py-2 rounded-md text-white text-sm"
                        style={{ backgroundColor: appearanceForm.primary_color }}
                      >
                        Button Preview
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Lock size={20} className="text-primary" />
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure security and access controls</p>
                </div>

                <form onSubmit={handleSecuritySubmit} className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={securityForm.two_factor_auth}
                        onChange={(e) => setSecurityForm({ ...securityForm, two_factor_auth: e.target.checked })}
                        className="rounded"
                      />
                      <span>Enable Two-Factor Authentication (2FA)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Password Expiry (Days)</label>
                      <input
                        type="number"
                        value={securityForm.password_expiry_days}
                        onChange={(e) => setSecurityForm({ ...securityForm, password_expiry_days: parseInt(e.target.value) })}
                        className="input-base w-full"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Set to 0 for no expiry</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session Timeout (Minutes)</label>
                      <input
                        type="number"
                        value={securityForm.session_timeout_minutes}
                        onChange={(e) => setSecurityForm({ ...securityForm, session_timeout_minutes: parseInt(e.target.value) })}
                        className="input-base w-full"
                        min="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Login Attempts</label>
                      <input
                        type="number"
                        value={securityForm.max_login_attempts}
                        onChange={(e) => setSecurityForm({ ...securityForm, max_login_attempts: parseInt(e.target.value) })}
                        className="input-base w-full"
                        min="3"
                        max="10"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">IP Whitelist (Comma-separated)</label>
                      <textarea
                        value={securityForm.ip_whitelist}
                        onChange={(e) => setSecurityForm({ ...securityForm, ip_whitelist: e.target.value })}
                        className="input-base w-full"
                        rows={3}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to allow all IPs</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateInstituteMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateInstituteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Backup & Data Tab */}
            {activeTab === 'backup' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Database size={20} className="text-primary" />
                    Backup & Data Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your data backups and exports</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      <strong>Note:</strong> Backups are automatically created daily. You can also manually create a backup below.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                      <RefreshCw size={16} />
                      Create Backup Now
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Download size={16} />
                      Export All Data
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Recent Backups</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={16} className="text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Backup_2026-04-07_02-00-01.sql</p>
                            <p className="text-xs text-gray-500">Size: 45.2 MB • Type: Full Backup</p>
                          </div>
                        </div>
                        <button className="text-primary hover:underline text-sm">Download</button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={16} className="text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Backup_2026-04-06_02-00-01.sql</p>
                            <p className="text-xs text-gray-500">Size: 44.8 MB • Type: Full Backup</p>
                          </div>
                        </div>
                        <button className="text-primary hover:underline text-sm">Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}