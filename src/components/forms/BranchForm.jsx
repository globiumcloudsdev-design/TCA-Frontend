
// src/components/forms/BranchForm.jsx

'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  CheckboxField,
  SelectField,
  TextareaField,
  SwitchField,
} from '@/components/common';
import TimePickerField from '@/components/common/TimePickerField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Shield, UserCog, MapPin } from 'lucide-react';
import useAuthStore from '@/store/authStore';

// Permission Checkbox Component
function PermissionCheckbox({ label, code, checked, onChange, disabled }) {
  return (
    <label className={cn(
      "flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(code, e.target.checked)}
        disabled={disabled}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
      <span className="text-sm">{label}</span>
      <span className="text-xs text-muted-foreground ml-auto font-mono">{code}</span>
    </label>
  );
}

// Validation Schema
const branchSchema = z.object({
  // Branch Info
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),

  // Location
  location: z.object({
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    address: z.string().optional(),
    place_id: z.string().optional()
  }).optional().default({}),

  // Settings
  settings: z.object({
    has_hostel: z.boolean().default(false),
    has_transport: z.boolean().default(false),
    has_library: z.boolean().default(true),
    has_lab: z.boolean().default(true),
    has_playground: z.boolean().default(false),
    has_cafeteria: z.boolean().default(false),
    has_mosque: z.boolean().default(false),
    has_parking: z.boolean().default(false),
    working_hours: z.object({
      monday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      tuesday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      wednesday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      thursday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      friday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      saturday: z.object({ open: z.string().nullable(), close: z.string().nullable() }),
      sunday: z.object({ open: z.string().nullable(), close: z.string().nullable() })
    }).default({
      monday: { open: '08:00', close: '16:00' },
      tuesday: { open: '08:00', close: '16:00' },
      wednesday: { open: '08:00', close: '16:00' },
      thursday: { open: '08:00', close: '16:00' },
      friday: { open: '08:00', close: '12:30' },
      saturday: { open: null, close: null },
      sunday: { open: null, close: null }
    })
  }).default({}),

  // Branch Status
  is_active: z.boolean().default(true),
  is_main: z.boolean().default(false),

  // 👇 HEAD USER FIELDS - will be created in users table
  head: z.object({
    first_name: z.string().min(2, 'First name required'),
    last_name: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    permissions: z.array(z.string()).default([])
  }).optional().default({})
});

export default function BranchForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false
}) {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('basic');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const availableRoles = user?.permissions ?? [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      location: {
        latitude: null,
        longitude: null,
        address: '',
        place_id: ''
      },
      settings: {
        has_hostel: false,
        has_transport: false,
        has_library: true,
        has_lab: true,
        has_playground: false,
        has_cafeteria: false,
        has_mosque: false,
        has_parking: false,
        working_hours: {
          monday: { open: '08:00', close: '16:00' },
          tuesday: { open: '08:00', close: '16:00' },
          wednesday: { open: '08:00', close: '16:00' },
          thursday: { open: '08:00', close: '16:00' },
          friday: { open: '08:00', close: '12:30' },
          saturday: { open: null, close: null },
          sunday: { open: null, close: null }
        }
      },
      is_active: true,
      is_main: false,
      head: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        permissions: []
      },
      ...defaultValues,
    }
  });

  // Reset when editing different branch
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        ...defaultValues,
        location: defaultValues.location || {
          latitude: null,
          longitude: null,
          address: defaultValues.address || '',
          place_id: ''
        },
        head: defaultValues.head || {
          first_name: defaultValues.head_name?.split(' ')[0] || '',
          last_name: defaultValues.head_name?.split(' ')[1] || '',
          email: defaultValues.head_email || '',
          phone: defaultValues.head_phone || '',
          permissions: defaultValues.head_permissions || []
        }
      });
      setSelectedPermissions(defaultValues.head?.permissions || []);
    }
  }, [defaultValues?.id]);

  const is_main = watch('is_main');

  // Handle permission toggle
  const handlePermissionToggle = (code, checked) => {
    let newPermissions;
    if (checked) {
      newPermissions = [...selectedPermissions, code];
    } else {
      newPermissions = selectedPermissions.filter(p => p !== code);
    }
    setSelectedPermissions(newPermissions);
    setValue('head.permissions', newPermissions);
  };

  // Select all permissions
  const handleSelectAll = () => {
    setSelectedPermissions(availableRoles);
    setValue('head.permissions', availableRoles);
  };

  // Clear all permissions
  const handleClearAll = () => {
    setSelectedPermissions([]);
    setValue('head.permissions', []);
  };

  const onFormSubmit = (data) => {
    // Format data for API
    const formattedData = {
      // Branch data
      name: data.name,
      code: data.code,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      location: data.location,
      settings: data.settings,
      is_active: data.is_active,
      is_main: data.is_main,

      // 👇 Head user data to be created in users table
      head: {
        first_name: data.head.first_name,
        last_name: data.head.last_name,
        email: data.head.email,
        phone: data.head.phone,
        password: data.head.password,
        permissions: selectedPermissions
      }
    };

    // Remove empty password (auto-generate on backend)
    if (!formattedData.head.password) {
      delete formattedData.head.password;
    }

    // For editing, don't send head data if not provided
    if (isEdit && !data.head.first_name) {
      delete formattedData.head;
    }

    onSubmit(formattedData);
  };

  if (!isMounted) return null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="basic" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger value="head" className="gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Branch Head</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* 🔥 FIX: Add forceMount to keep all tabs mounted */}
        {/* Tab 1: Basic Info */}
        <TabsContent value="basic" forceMount className={cn(activeTab === 'basic' ? 'block' : 'hidden')}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ✅ Using Controller for InputField */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Branch Name"
                      {...field}
                      error={error}
                      required
                      placeholder="e.g. Main Campus"
                    />
                  )}
                />

                <Controller
                  name="code"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Branch Code"
                      {...field}
                      error={error}
                      placeholder="e.g. MAIN-01"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Phone"
                      {...field}
                      error={error}
                      placeholder="+92-42-XXXXXXXX"
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Email"
                      {...field}
                      type="email"
                      error={error}
                      placeholder="branch@school.edu.pk"
                    />
                  )}
                />
              </div>

              <Controller
                name="city"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputField
                    label="City"
                    {...field}
                    error={error}
                    placeholder="e.g. Lahore"
                  />
                )}
              />

              {/* ✅ SwitchField already uses Controller internally */}
              {/* <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="is_main">Main Branch</Label>
                  <p className="text-xs text-muted-foreground">Set as primary branch</p>
                </div>
                <SwitchField
                  label=""
                  name="is_main"
                  control={control}
                />
              </div> */}

              {is_main && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    This will be the main branch. Any existing main branch will be updated.
                  </p>
                </div>
              )}

              {/* ✅ SwitchField already uses Controller internally */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-xs text-muted-foreground">Branch is currently operational</p>
                </div>
                <SwitchField
                  label=""
                  name="is_active"
                  control={control}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Location */}
        <TabsContent value="location" forceMount className={cn(activeTab === 'location' ? 'block' : 'hidden')}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Branch Location</h3>
              <p className="text-sm text-muted-foreground">
                Enter location details manually
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="location.latitude"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Latitude"
                      {...field}
                      error={error}
                      type="number"
                      step="any"
                      placeholder="e.g. 31.5204"
                    />
                  )}
                />

                <Controller
                  name="location.longitude"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Longitude"
                      {...field}
                      error={error}
                      type="number"
                      step="any"
                      placeholder="e.g. 74.3587"
                    />
                  )}
                />
              </div>

              {/* ✅ Using Controller for TextareaField */}
              <Controller
                name="address"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextareaField
                    label="Full Address"
                    {...field}
                    error={error}
                    rows={3}
                    placeholder="Complete address"
                  />
                )}
              />

              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-xs text-yellow-700">
                  💡 Tip: You can get latitude and longitude from Google Maps by right-clicking on any location.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Branch Head (Create User) */}
        <TabsContent value="head" forceMount className={cn(activeTab === 'head' ? 'block' : 'hidden')}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Branch Head Details
              </h3>
              <p className="text-sm text-muted-foreground">
                A user account will be created for the branch head
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="head.first_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="First Name"
                      {...field}
                      error={error}
                      required
                      placeholder="e.g. Muhammad"
                    />
                  )}
                />

                <Controller
                  name="head.last_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Last Name"
                      {...field}
                      error={error}
                      required
                      placeholder="e.g. Ali"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="head.email"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Email"
                      {...field}
                      error={error}
                      type="email"
                      required
                      placeholder="head@branch.com"
                    />
                  )}
                />

                <Controller
                  name="head.phone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Phone"
                      {...field}
                      error={error}
                      placeholder="+92-300-1234567"
                    />
                  )}
                />
              </div>

              {!isEdit && (
                <Controller
                  name="head.password"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Password"
                      {...field}
                      error={error}
                      type="password"
                      placeholder={isEdit ? "Leave empty to keep current" : "Enter password"}
                      hint={!isEdit ? "Leave empty to auto-generate password" : undefined}
                    />
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Head Permissions
                </h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedPermissions.length} of {availableRoles.length} selected
                </Badge>
              </div>

              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {availableRoles.map((perm) => (
                  <PermissionCheckbox
                    key={perm}
                    label={perm.split('.').join(' ').replace(/_/g, ' ')}
                    code={perm}
                    checked={selectedPermissions.includes(perm)}
                    onChange={handlePermissionToggle}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Settings */}
        <TabsContent value="settings" forceMount className={cn(activeTab === 'settings' ? 'block' : 'hidden')}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Facilities & Amenities</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'has_hostel', label: 'Hostel' },
                  { key: 'has_transport', label: 'Transport' },
                  { key: 'has_library', label: 'Library' },
                  { key: 'has_lab', label: 'Laboratory' },
                  { key: 'has_playground', label: 'Playground' },
                  { key: 'has_cafeteria', label: 'Cafeteria' },
                  { key: 'has_mosque', label: 'Mosque' },
                  { key: 'has_parking', label: 'Parking' },
                ].map(({ key, label }) => (
                  <CheckboxField
                    key={key}
                    label={label}
                    name={`settings.${key}`}
                    control={control}
                  />
                ))}
              </div>

              <Separator />

              <h3 className="font-semibold pt-2">Working Hours</h3>

              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="grid grid-cols-3 gap-3 items-center">
                    <Label className="capitalize">{day}</Label>
                    
                    {/* ✅ Using TimePickerField */}
                    <TimePickerField
                      value={watch(`settings.working_hours.${day}.open`) || ''}
                      onChange={(val) => setValue(`settings.working_hours.${day}.open`, val || null)}
                      mode="simple"
                      placeholder="Open"
                    />

                    <TimePickerField
                      value={watch(`settings.working_hours.${day}.close`) || ''}
                      onChange={(val) => setValue(`settings.working_hours.${day}.close`, val || null)}
                      mode="simple"
                      placeholder="Close"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}
