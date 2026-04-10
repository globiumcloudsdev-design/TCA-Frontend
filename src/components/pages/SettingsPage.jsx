// src/app/(dashboard)/settings/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Mail, Phone, MapPin, Globe, Calendar, Upload, Trash2, Save,
  Settings as SettingsIcon, Shield, CreditCard, Bell, Palette, Lock, Database,
  RefreshCw, CheckCircle, Loader2, Download, Facebook, Instagram, Twitter,
  Linkedin, Youtube, Clock, DollarSign, Smartphone, Eye, EyeOff, Moon, Sun
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import useAuthStore from '@/store/authStore';
import { settingService } from '@/services/settingService';
import PolicyManagement from '@/components/settings/PolicyManagement';

// Reusable Form Components
import InputField from '@/components/common/InputField';
import TextareaField from '@/components/common/TextareaField';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import TimePickerField from '@/components/common/TimePickerField';
import CheckboxField from '@/components/common/CheckboxField';
import SwitchField from '@/components/common/SwitchField';

import { cn } from '@/lib/utils';

// Tab configurations
const TABS = [
  { id: 'general', label: 'General Settings', icon: Building2 },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'timings', label: 'Timings', icon: Clock },
];

const COUNTRY_OPTIONS = [
  { value: 'Pakistan', label: '🇵🇰 Pakistan' },
  { value: 'USA', label: '🇺🇸 United States' },
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'UAE', label: '🇦🇪 UAE' },
];

export default function SettingsPage() {
  const {
    user,
    refreshUserData,
    setInstituteSettings,
    updateSettingSection,
    setInstituteLogo,
    setInstituteName,
    setModuleEnabled,
    instituteSettings,
    academicSettings,
    timingsSettings,
    financeSettings,
    communicationSettings,
    moduleSettings
  } = useAuthStore();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resettingSection, setResettingSection] = useState(null);

  // Get current values from store
  const currentSettings = instituteSettings();
  const currentLogo = user?.institute?.logo_url || '';
  const currentInstituteName = user?.institute?.name || '';
  const currentModules = moduleSettings();

  // =========================================================
  // Form Setup with react-hook-form
  // =========================================================

  const {
    control: generalControl,
    register: generalRegister,
    handleSubmit: generalHandleSubmit,
    reset: generalReset,
    formState: { errors: generalErrors }
  } = useForm({
    defaultValues: {
      display_name: currentInstituteName,
      tagline: currentSettings.tagline || '',
      description: currentSettings.description || '',
      email: user?.institute?.email || '',
      phone: user?.institute?.phone || '',
      address_line1: currentSettings.address_line1 || '',
      city: currentSettings.city || user?.institute?.city || '',
      country: currentSettings.country || 'Pakistan',
      facebook_url: currentSettings.facebook_url || '',
      instagram_url: currentSettings.instagram_url || '',
      twitter_url: currentSettings.twitter_url || '',
      linkedin_url: currentSettings.linkedin_url || '',
      youtube_url: currentSettings.youtube_url || ''
    }
  });

  // State-based forms for others
  const [timingsForm, setTimingsForm] = useState(timingsSettings());

  // Update forms when store changes
  useEffect(() => {
    generalReset({
      display_name: currentInstituteName,
      tagline: currentSettings.tagline || '',
      description: currentSettings.description || '',
      email: user?.institute?.email || '',
      phone: user?.institute?.phone || '',
      address_line1: currentSettings.address_line1 || '',
      city: currentSettings.city || user?.institute?.city || '',
      country: currentSettings.country || 'Pakistan',
      facebook_url: currentSettings.facebook_url || '',
      instagram_url: currentSettings.instagram_url || '',
      twitter_url: currentSettings.twitter_url || '',
      linkedin_url: currentSettings.linkedin_url || '',
      youtube_url: currentSettings.youtube_url || ''
    });
  }, [currentInstituteName, currentSettings, user?.institute, generalReset]);

  useEffect(() => {
    setTimingsForm(timingsSettings());
  }, [timingsSettings]);

  // =========================================================
  // Mutations
  // =========================================================

  const updateGeneralMutation = useMutation({
    mutationFn: (data) => settingService.updateGeneralSettings(data),
    onSuccess: async (response) => {
      await refreshUserData();
      setInstituteSettings({
        tagline: response.data.tagline,
        description: response.data.description,
        address_line1: response.data.address_line1,
        city: response.data.city,
        country: response.data.country,
        facebook_url: response.data.facebook_url,
        instagram_url: response.data.instagram_url,
        twitter_url: response.data.twitter_url,
        linkedin_url: response.data.linkedin_url,
        youtube_url: response.data.youtube_url
      });
      toast.success('General settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update general settings');
    }
  });

  const updateTimingsMutation = useMutation({
    mutationFn: (data) => settingService.updateTimingsSettings(data),
    onSuccess: (response) => {
      updateSettingSection('timings', response.data.timings);
      toast.success('Timings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update timings');
    }
  });

  const resetSectionMutation = useMutation({
    mutationFn: (section) => settingService.resetSettingsSection(section),
    onSuccess: async (response) => {
      await refreshUserData();
      if (response.data[activeTab]) {
        updateSettingSection(activeTab, response.data[activeTab]);
      }
      toast.success(`${activeTab} settings reset to default`);
      setResettingSection(null);
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reset section');
      setResettingSection(null);
    }
  });

  // =========================================================
  // Handlers
  // =========================================================

  const handleGeneralSubmit = generalHandleSubmit((data) => {
    updateGeneralMutation.mutate(data);
  });

  const handleTimingsSubmit = (e) => {
    e.preventDefault();
    updateTimingsMutation.mutate(timingsForm);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }
    setUploadingLogo(true);
    // TODO: Implement logo upload mutation
    setUploadingLogo(false);
  };

  const handleResetSection = (section) => {
    if (confirm(`Are you sure you want to reset ${section} settings to default?`)) {
      setResettingSection(section);
      resetSectionMutation.mutate(section);
    }
  };

  const toggleWorkingDay = (day) => {
    setTimingsForm(prev => ({
      ...prev,
      working_days: prev.working_days?.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...(prev.working_days || []), day]
    }));
  };

  const toggleWeeklyOff = (day) => {
    setTimingsForm(prev => ({
      ...prev,
      weekly_off_days: prev.weekly_off_days?.includes(day)
        ? prev.weekly_off_days.filter(d => d !== day)
        : [...(prev.weekly_off_days || []), day]
    }));
  };

  const updateBreak = (index, field, value) => {
    const newBreaks = [...(timingsForm.breaks || [])];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setTimingsForm(prev => ({ ...prev, breaks: newBreaks }));
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your institute settings and configurations
            </p>
          </div>
          {activeTab !== 'policies' && (
            <button
              onClick={() => handleResetSection(activeTab)}
              disabled={resettingSection === activeTab}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              {resettingSection === activeTab ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Reset to Default
            </button>
          )}
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

            {/* ==================== GENERAL SETTINGS ==================== */}
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
                      {currentLogo ? (
                        <Image
                          src={currentLogo}
                          alt="Institute Logo"
                          width={80}
                          height={80}
                          className="rounded-lg object-cover border"
                        />
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
                    {/* Institute Name - InputField */}
                    <InputField
                      label="Institute Name"
                      name="display_name"
                      register={generalRegister}
                      error={generalErrors.display_name}
                      placeholder="e.g. ABC School"
                      required
                    />

                    {/* Tagline - InputField */}
                    <InputField
                      label="Tagline / Motto"
                      name="tagline"
                      register={generalRegister}
                      error={generalErrors.tagline}
                      placeholder="Empowering minds, shaping futures"
                    />

                    {/* Description - TextareaField */}
                    <div className="md:col-span-2">
                      <TextareaField
                        label="Description"
                        name="description"
                        register={generalRegister}
                        error={generalErrors.description}
                        placeholder="About your institute..."
                        rows={3}
                      />
                    </div>

                    {/* Email - InputField */}
                    <InputField
                      label="Email"
                      name="email"
                      register={generalRegister}
                      error={generalErrors.email}
                      type="email"
                      placeholder="contact@institute.com"
                    />

                    {/* Phone - InputField */}
                    <InputField
                      label="Phone"
                      name="phone"
                      register={generalRegister}
                      error={generalErrors.phone}
                      type="tel"
                      placeholder="+92-300-1234567"
                    />

                    {/* Address - InputField */}
                    <InputField
                      label="Address"
                      name="address_line1"
                      register={generalRegister}
                      error={generalErrors.address_line1}
                      placeholder="Street address"
                    />

                    {/* City - InputField */}
                    <InputField
                      label="City"
                      name="city"
                      register={generalRegister}
                      error={generalErrors.city}
                      placeholder="e.g. Karachi"
                    />

                    {/* Country - SelectField */}
                    <SelectField
                      label="Country"
                      name="country"
                      control={generalControl}
                      options={COUNTRY_OPTIONS}
                      placeholder="Select country"
                    />
                  </div>

                  {/* Social Media */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Globe size={18} />
                      Social Media
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Facebook - InputField */}
                      <InputField
                        label="Facebook"
                        name="facebook_url"
                        register={generalRegister}
                        error={generalErrors.facebook_url}
                        type="url"
                        placeholder="https://facebook.com/..."
                      />

                      {/* Instagram - InputField */}
                      <InputField
                        label="Instagram"
                        name="instagram_url"
                        register={generalRegister}
                        error={generalErrors.instagram_url}
                        type="url"
                        placeholder="https://instagram.com/..."
                      />

                      {/* Twitter - InputField */}
                      <InputField
                        label="Twitter/X"
                        name="twitter_url"
                        register={generalRegister}
                        error={generalErrors.twitter_url}
                        type="url"
                        placeholder="https://twitter.com/..."
                      />

                      {/* LinkedIn - InputField */}
                      <InputField
                        label="LinkedIn"
                        name="linkedin_url"
                        register={generalRegister}
                        error={generalErrors.linkedin_url}
                        type="url"
                        placeholder="https://linkedin.com/..."
                      />

                      {/* YouTube - InputField */}
                      <InputField
                        label="YouTube"
                        name="youtube_url"
                        register={generalRegister}
                        error={generalErrors.youtube_url}
                        type="url"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateGeneralMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateGeneralMutation.isPending ? (
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

            {/* ==================== POLICIES TAB ==================== */}
            {activeTab === 'policies' && <PolicyManagement />}

            {/* ==================== TIMINGS & SCHEDULE ==================== */}
            {activeTab === 'timings' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Timings & Schedule
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure working hours, breaks, and holidays</p>
                </div>

                <form onSubmit={handleTimingsSubmit} className="p-6 space-y-6">
                  {/* Working Days */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Working Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={timingsForm.working_days?.includes(day) || false}
                            onChange={() => toggleWorkingDay(day)}
                            className="rounded"
                          />
                          <span className="capitalize font-medium text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Working Hours - Using TimePickerField */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Regular Start Time</label>
                      <TimePickerField
                        value={timingsForm.start_time || '08:00'}
                        onChange={(value) => setTimingsForm({ ...timingsForm, start_time: value })}
                        placeholder="Select start time"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Regular End Time</label>
                      <TimePickerField
                        value={timingsForm.end_time || '14:00'}
                        onChange={(value) => setTimingsForm({ ...timingsForm, end_time: value })}
                        placeholder="Select end time"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Friday Start Time</label>
                      <TimePickerField
                        value={timingsForm.friday_start_time || '08:00'}
                        onChange={(value) => setTimingsForm({ ...timingsForm, friday_start_time: value })}
                        placeholder="Select start time"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Friday End Time</label>
                      <TimePickerField
                        value={timingsForm.friday_end_time || '12:30'}
                        onChange={(value) => setTimingsForm({ ...timingsForm, friday_end_time: value })}
                        placeholder="Select end time"
                      />
                    </div>
                  </div>

                  {/* Breaks - Using TimePickerField */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Break Timings</label>
                    <div className="space-y-3">
                      {(timingsForm.breaks || []).map((breakItem, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <label className="flex items-center gap-2 min-w-[100px]">
                            <input
                              type="checkbox"
                              checked={breakItem.enabled || false}
                              onChange={(e) => updateBreak(index, 'enabled', e.target.checked)}
                              className="rounded"
                            />
                            <span className="font-medium text-sm">{breakItem.name}</span>
                          </label>
                          {breakItem.enabled && (
                            <>
                              <TimePickerField
                                value={breakItem.start || ''}
                                onChange={(value) => updateBreak(index, 'start', value)}
                                placeholder="Start"
                              />
                              <span className="text-gray-500">to</span>
                              <TimePickerField
                                value={breakItem.end || ''}
                                onChange={(value) => updateBreak(index, 'end', value)}
                                placeholder="End"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Window - Using TimePickerField */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Attendance Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Attendance Start Time</label>
                        <TimePickerField
                          value={timingsForm.attendance_start_time || '07:30'}
                          onChange={(value) => setTimingsForm({ ...timingsForm, attendance_start_time: value })}
                          placeholder="Select time"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Attendance End Time</label>
                        <TimePickerField
                          value={timingsForm.attendance_end_time || '09:00'}
                          onChange={(value) => setTimingsForm({ ...timingsForm, attendance_end_time: value })}
                          placeholder="Select time"
                        />
                      </div>
                      <div>
                        <InputField
                          label="Late Grace Period (Minutes)"
                          name="grace_minutes"
                          type="number"
                          register={() => ({
                            value: timingsForm.late_attendance_grace_minutes || 10,
                            onChange: (e) => setTimingsForm({ ...timingsForm, late_attendance_grace_minutes: parseInt(e.target.value) })
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekly Off Days */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Weekly Off Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={timingsForm.weekly_off_days?.includes(day) || false}
                            onChange={() => toggleWeeklyOff(day)}
                            className="rounded"
                          />
                          <span className="capitalize font-medium text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateTimingsMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateTimingsMutation.isPending ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}
