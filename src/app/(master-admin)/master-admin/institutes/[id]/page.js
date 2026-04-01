
// src/app/master-admin/institutes/[id]/page.jsx
// Update the page to use real data

'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, CreditCard, Shield, Users,
  GraduationCap, BookOpen, UserCheck, LayoutGrid, MapPin,
  HardDrive, Database, Cloud, AlertCircle
} from 'lucide-react';

import { masterAdminService } from '@/services';
import {
  PageHeader, AppBreadcrumb, PageLoader, ErrorAlert,
  InputField, SelectField, CheckboxField, DatePickerField, FormSubmitButton,
  StatusBadge, StatsCard, DataTable, AppModal,
} from '@/components/common';
import { Button }   from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator }  from '@/components/ui/separator';
import { Badge }    from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const unwrapPayload = (payload) => payload?.data ?? payload ?? null;

const normalizeInstitute = (payload) => {
  const src = unwrapPayload(payload) || {};
  const dv = src.dataValues || {};
  const settings = src.settings || {};
  const planObj = src.plan || src.subscription_plan || null;
  const subscriptionObj = src.subscription || src.subscription_details || null;
  const rawCode =
    src.code ||
    src.institute_code ||
    src.instituteCode ||
    dv.code ||
    dv.institute_code ||
    src.institute?.code ||
    src.institute?.institute_code ||
    null;
  const normalizedCode = String(rawCode || '').trim();
  const rawType = src.type || src.institute_type || src.instituteType || src.institute_type_id || null;
  const isTypeObject = rawType !== null && typeof rawType === 'object';
  const typeValue = isTypeObject
    ? (rawType.slug || rawType.code || rawType.name || null)
    : rawType;
  const typeLabel = isTypeObject
    ? (rawType.name || rawType.slug || rawType.code || '—')
    : (rawType || '—');

  return {
    id: src.id,
    name: src.name || src.institute_name || 'Institute',
    code: normalizedCode || '—',
    code_display: normalizedCode || '—',
    city: src.city || src.institute_city || null,
    contact: src.contact || src.institute_email || src.institute_contact || null,
    has_branches: src.has_branches ?? settings.has_branches ?? false,
    branches: src.branches ?? src.branch_count ?? null,
    type: typeLabel,
    type_value: String(typeValue || '').toLowerCase() || null,
    type_label: typeLabel,
    plan: typeof src.plan === 'string' ? src.plan : (planObj?.name || planObj?.code || null),
    plan_id: src.subscription_plan_id || planObj?.id || null,
    plan_price: planObj?.price ?? null,
    subscription: subscriptionObj
      ? {
          ...subscriptionObj,
          plan: subscriptionObj.plan || planObj || null
        }
      : (planObj ? { plan: planObj } : null),
    expires: src.expires || src.trial_end_date || null,
    joined: src.joined || src.joining_date || src.created_at || src.createdAt || null,
    is_active: src.is_active ?? (src.status === 'active'),
    status: src.status || (src.is_active ? 'active' : 'inactive')
  };
};

const normalizePaginatedPayload = (payload) => ({
  rows: payload?.data || payload?.rows || [],
  pagination: payload?.pagination || {
    total: payload?.total || 0,
    page: payload?.page || 1,
    limit: payload?.limit || 10,
    totalPages: payload?.totalPages || 1
  }
});

// ─── Storage Card Component ─────────────────────────────────────────────────
function StorageCard({ storage }) {
  const totalGB = (storage?.total_bytes || 0) / (1024 * 1024 * 1024);
  const usagePercent = Math.min(100, (totalGB / 5) * 100); // Assuming 5GB limit
  const displayPercent = usagePercent < 0.1 && usagePercent > 0 ? '<0.1' : usagePercent.toFixed(2);
  const visualPercent = usagePercent > 0 && usagePercent < 2 ? 2 : usagePercent;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HardDrive size={16} /> Cloud Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Used</span>
          <span className="text-sm font-semibold">{storage?.formatted_size || '0 B'}</span>
        </div>
        
        <div className="space-y-1">
          <Progress value={visualPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {displayPercent}% of 5 GB limit
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <p className="text-xs font-semibold">Files by Category:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(storage?.usage_by_type || {}).map(([type, info]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="capitalize text-muted-foreground">{type}:</span>
                <span className="font-mono">
                  {info?.total_files || 0} files / {(info?.total_bytes || 0) / 1024 > 0 
                    ? `${((info?.total_bytes || 0) / 1024).toFixed(0)} KB` 
                    : '0 B'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2 text-xs text-muted-foreground border-t">
          <div className="flex items-center justify-between">
            <span>Total Records:</span>
            <span>{storage?.records_count?.total || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Students/Teachers/Parents/Staff:</span>
            <span>{storage?.records_count?.students || 0} / {storage?.records_count?.teachers || 0} / {storage?.records_count?.parents || 0} / {storage?.records_count?.staff || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── People Table Components (using real data) ─────────────────────────────────
function StudentTable({ instituteId, onView }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ['institute-students', instituteId, page, pageSize, search, status],
    queryFn: () => masterAdminService.getInstituteStudents(instituteId, {
      page, limit: pageSize, search, status
    }),
    enabled: !!instituteId
  });
  const normalized = normalizePaginatedPayload(data);
  
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">Father: {row.original.father}</p>
        </div>
      ),
    },
    { accessorKey: 'class', header: 'Class' },
    { accessorKey: 'roll', header: 'Roll #' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'fee_status',
      header: 'Fee',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />
    },
  ], []);
  
  return (
    <DataTable
      columns={columns}
      data={normalized.rows}
      loading={isLoading}
      onRowClick={onView}
      total={normalized.pagination.total || 0}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by name..."
      filters={[
        {
          name: 'status',
          label: 'Status',
          value: status,
          onChange: setStatus,
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]
        }
      ]}
    />
  );
}

function TeacherTable({ instituteId, onView }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ['institute-teachers', instituteId, page, pageSize, search, status],
    queryFn: () => masterAdminService.getInstituteTeachers(instituteId, {
      page, limit: pageSize, search, status
    }),
    enabled: !!instituteId
  });
  const normalized = normalizePaginatedPayload(data);
  
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'qualification', header: 'Qualification' },
    { accessorKey: 'experience', header: 'Experience' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />
    },
  ], []);
  
  return (
    <DataTable
      columns={columns}
      data={normalized.rows}
      loading={isLoading}
      onRowClick={onView}
      total={normalized.pagination.total || 0}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by name or subject..."
    />
  );
}

function ParentTable({ instituteId, onView }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ['institute-parents', instituteId, page, pageSize, search, status],
    queryFn: () => masterAdminService.getInstituteParents(instituteId, {
      page, limit: pageSize, search, status
    }),
    enabled: !!instituteId
  });
  const normalized = normalizePaginatedPayload(data);
  
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Parent',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'children', header: 'Children' },
    {
      accessorKey: 'children_names',
      header: 'Children Names',
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />
    },
  ], []);
  
  return (
    <DataTable
      columns={columns}
      data={normalized.rows}
      loading={isLoading}
      onRowClick={onView}
      total={normalized.pagination.total || 0}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by name or phone..."
    />
  );
}

function StaffTable({ instituteId, onView }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ['institute-staff', instituteId, page, pageSize, search, status],
    queryFn: () => masterAdminService.getInstituteStaff(instituteId, {
      page, limit: pageSize, search, status
    }),
    enabled: !!instituteId
  });
  const normalized = normalizePaginatedPayload(data);
  
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Staff',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'department', header: 'Department' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />
    },
  ], []);
  
  return (
    <DataTable
      columns={columns}
      data={normalized.rows}
      loading={isLoading}
      onRowClick={onView}
      total={normalized.pagination.total || 0}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search by name or role..."
    />
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function InstituteDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams || {};
  const router = useRouter();
  const qc = useQueryClient();
  
  const [subEditOpen, setSubEditOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personType, setPersonType] = useState(null);
  
  // Fetch institute data
  const { data: schoolRes, isLoading, error } = useQuery({
    queryKey: ['master-school', id],
    queryFn: () => masterAdminService.getSchoolById(id),
    enabled: !!id,
  });
  
  // Fetch dashboard stats (including storage)
  const { data: dashboardStatsRes } = useQuery({
    queryKey: ['institute-stats', id],
    queryFn: () => masterAdminService.getInstituteDashboardStats(id),
    enabled: !!id,
  });
  
  // Fetch storage separately
  const { data: storageRes } = useQuery({
    queryKey: ['institute-storage', id],
    queryFn: () => masterAdminService.getInstituteStorage(id),
    enabled: !!id,
  });

  const school = normalizeInstitute(schoolRes);
  const dashboardStats = unwrapPayload(dashboardStatsRes) || {};
  const storage = unwrapPayload(storageRes) || {};

  const openPerson = (type) => (row) => {
    setPersonType(type);
    setSelectedPerson(row);
  };

  const closePerson = () => {
    setPersonType(null);
    setSelectedPerson(null);
  };
  
  const updateMutation = useMutation({
    mutationFn: (body) => masterAdminService.updateSchool(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-school', id] });
      qc.invalidateQueries({ queryKey: ['master-schools'] });
      toast.success('Institute updated successfully');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });
  
  const toggleMutation = useMutation({
    mutationFn: (is_active) => masterAdminService.toggleSchoolStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-school', id] });
      qc.invalidateQueries({ queryKey: ['master-schools'] });
      toast.success('Status updated');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });
  
  const { register, control, handleSubmit } = useForm({
    values: school ? {
      name: school.name ?? '',
      city: school.city ?? '',
      contact: school.contact ?? '',
      has_branches: school.has_branches ?? false,
      institute_type: school.type_value || 'school',
    } : undefined,
  });
  
  if (isLoading) return <PageLoader message="Loading institute..." />;
  if (error) return <ErrorAlert message="Failed to load institute data." />;
  if (!school?.id) return null;
  
  const isActive = school.is_active ?? school.status === 'active';
  const stats = dashboardStats?.counts || { students: 0, teachers: 0, parents: 0, staff: 0 };
  const sub = school.subscription;
  const subStartDate = sub?.start_date || sub?.start || sub?.trial?.start_date || school.joined;
  const subAmount = sub?.amount ?? sub?.plan?.price ?? school.plan_price;
  const expires = school.expires ?? sub?.end_date ?? sub?.expires_at ?? sub?.end ?? sub?.trial?.end_date;
  const daysLeft = expires ? Math.ceil((new Date(expires) - Date.now()) / 86400000) : null;
  
  return (
    <div className="space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Institutes', href: '/master-admin/institutes' },
          { label: school.name },
        ]}
      />
      
      <PageHeader
        title={school.name}
        description={`Code: ${school.code_display || school.code || '—'}${school.city ? ` · ${school.city}` : ''}`}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={14} className="mr-2" /> Back
          </Button>
        }
      />
      
      {/* Meta badges row */}
      <div className="flex flex-wrap items-center gap-2 -mt-3">
        <span className="font-mono text-xs bg-slate-100 border rounded px-2 py-0.5 text-slate-600">
          {school.code_display || school.code || '—'}
        </span>
        <Badge variant="outline" className="capitalize text-xs bg-blue-50 text-blue-700 border-blue-200">
          {school.type_label || school.type || '—'}
        </Badge>
        {school.city && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={10} /> {school.city}
          </span>
        )}
        <StatusBadge status={isActive ? 'active' : 'inactive'} />
      </div>
      
      {/* Stats Cards - REAL DATA */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard label="Students" value={stats.students} icon={<GraduationCap size={18} />} />
        <StatsCard label="Teachers" value={stats.teachers} icon={<BookOpen size={18} />} />
        <StatsCard label="Parents" value={stats.parents} icon={<Users size={18} />} />
        <StatsCard label="Staff" value={stats.staff} icon={<UserCheck size={18} />} />
        <StatsCard label="Branches" value={school.branches ?? (school.has_branches ? '2+' : '1')} icon={<LayoutGrid size={18} />} />
        <StatsCard label="Plan" value={<span className="capitalize">{school.plan ?? sub?.plan ?? '—'}</span>} icon={<CreditCard size={18} />} />
      </div>
      
      {/* Main 3-col Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2/3: Edit + People */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* People Tabs - REAL DATA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={16} /> People
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="students" className="w-full">
                <div className="border-b px-4">
                  <TabsList className="h-auto bg-transparent rounded-none gap-1 pb-0 w-full overflow-x-auto flex-nowrap justify-start">
                    <TabsTrigger value="students" className="text-xs rounded-b-none pb-2.5 whitespace-nowrap">
                      🎓 Students ({stats.students})
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="text-xs rounded-b-none pb-2.5 whitespace-nowrap">
                      👨‍🏫 Teachers ({stats.teachers})
                    </TabsTrigger>
                    <TabsTrigger value="parents" className="text-xs rounded-b-none pb-2.5 whitespace-nowrap">
                      👨‍👩‍👧 Parents ({stats.parents})
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="text-xs rounded-b-none pb-2.5 whitespace-nowrap">
                      💼 Staff ({stats.staff})
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="p-4">
                  <TabsContent value="students">
                    <StudentTable instituteId={id} onView={openPerson('student')} />
                  </TabsContent>
                  <TabsContent value="teachers">
                    <TeacherTable instituteId={id} onView={openPerson('teacher')} />
                  </TabsContent>
                  <TabsContent value="parents">
                    <ParentTable instituteId={id} onView={openPerson('parent')} />
                  </TabsContent>
                  <TabsContent value="staff">
                    <StaffTable instituteId={id} onView={openPerson('staff')} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Storage Card - moved below people table */}
          <StorageCard storage={storage?.total_files !== undefined ? storage : (dashboardStats?.storage || {})} />
        </div>
        
        {/* Right 1/3: Status + Subscription + Storage */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield size={16} /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusBadge status={isActive ? 'active' : 'inactive'} />
              </div>
              <Separator />
              <Button
                variant={isActive ? 'destructive' : 'default'}
                size="sm"
                className="w-full"
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate(!isActive)}
              >
                {toggleMutation.isPending ? 'Updating…' : isActive ? 'Deactivate Institute' : 'Activate Institute'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard size={16} /> Subscription
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSubEditOpen(true)}>
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(school.plan || sub) ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <Badge variant="outline" className="capitalize bg-violet-50 text-violet-700 border-violet-200">
                      {school.plan ?? sub?.plan}
                    </Badge>
                  </div>
                  <Separator />
                  <InfoRow label="Start" value={fmtDate(subStartDate)} />
                  <InfoRow label="Expires" value={fmtDate(expires)} />
                  <InfoRow label="Amount" value={subAmount ? `PKR ${Number(subAmount).toLocaleString()}` : '—'} />
                  <InfoRow label="Status" value={<StatusBadge status={sub?.status ?? (isActive ? 'active' : 'inactive')} />} />
                  
                  {daysLeft != null && (
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
                        <span className={cn(
                          'font-medium',
                          daysLeft <= 0 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-emerald-600'
                        )}>
                          {daysLeft <= 0 ? '⚠ Expired' : daysLeft <= 30 ? '⚠ Expiring soon' : '✓ Valid'}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn(
                          'h-1.5 rounded-full transition-all',
                          daysLeft <= 0 ? 'bg-red-500' : daysLeft <= 30 ? 'bg-amber-400' : 'bg-emerald-500'
                        )} style={{ width: `${Math.max(2, Math.min(100, (daysLeft / 365) * 100))}%` }} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription assigned.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Meta details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Code" value={<span className="font-mono bg-slate-50 rounded px-1 text-xs">{school.code_display || school.code || '—'}</span>} />
              <InfoRow label="Type" value={<span className="capitalize">{school.type_label || school.type || '—'}</span>} />
              <InfoRow label="City" value={school.city ?? '—'} />
              <InfoRow label="Branches" value={school.branches ?? (school.has_branches ? 'Multiple' : 'Single')} />
              <InfoRow label="Contact" value={<span className="text-xs">{school.contact}</span>} />
              <InfoRow label="Joined" value={fmtDate(school.createdAt ?? school.joined)} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Subscription Modal */}
      <SubEditModal
        open={subEditOpen}
        onClose={() => setSubEditOpen(false)}
        school={school}
        onSuccess={() => {
          qc.invalidateQueries(['master-school', id]);
          qc.invalidateQueries(['institute-stats', id]);
        }}
      />

      <PersonDetailModal person={selectedPerson} type={personType} onClose={closePerson} />
    </div>
  );
}

function PersonDetailModal({ person, type, onClose }) {
  if (!person) return null;

  const rows =
    type === 'student'
      ? [
          ['Name', person.name],
          ['Father', person.father],
          ['Class', person.class],
          ['Roll', person.roll],
          ['Phone', person.phone],
          ['Status', person.status]
        ]
      : type === 'teacher'
        ? [
            ['Name', person.name],
            ['Email', person.email],
            ['Phone', person.phone],
            ['Subject', person.subject],
            ['Qualification', person.qualification],
            ['Experience', person.experience],
            ['Status', person.status]
          ]
        : type === 'parent'
          ? [
              ['Name', person.name],
              ['Email', person.email],
              ['Phone', person.phone],
              ['CNIC', person.cnic],
              ['Children', person.children],
              ['Children Names', person.children_names],
              ['Status', person.status]
            ]
          : [
              ['Name', person.name],
              ['Email', person.email],
              ['Phone', person.phone],
              ['Role', person.role],
              ['Department', person.department],
              ['Status', person.status]
            ];

  return (
    <AppModal
      open={!!person}
      onClose={onClose}
      title="Detail"
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {rows.map(([label, value]) => (
          <div key={label} className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm text-slate-800 break-words">{value ?? '—'}</p>
          </div>
        ))}
      </div>
    </AppModal>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value ?? '—'}</span>
    </div>
  );
}

function SubEditModal({ open, onClose, school, onSuccess }) {
  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['master-admin', 'subscription-plans'],
    queryFn: () => masterAdminService.getSubscriptionPlans({ include_unpublished: true }),
    enabled: open
  });

  const planOptions = useMemo(() => {
    const payload = plansRes?.data || plansRes || [];
    const list = Array.isArray(payload) ? payload : [];

    if (!list.length) return [];

    return list.map((plan) => ({
      value: plan.id,
      label: `${plan.name || plan.code || 'Plan'} — PKR ${Number(plan.price || 0).toLocaleString()}/${plan.cycle || 'month'}`
    }));
  }, [plansRes]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { plan: school?.plan_id ?? '', start_date: null, end_date: null },
  });
  
  const mutation = useMutation({
    mutationFn: (data) => masterAdminService.updateInstitutePlan(school.id, data.plan, data.start_date),
    onSuccess: () => {
      toast.success('Subscription updated successfully');
      onSuccess?.();
      onClose();
      reset();
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });
  
  const handleSave = (data) => mutation.mutate(data);
  
  return (
    <AppModal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="📋 Edit Subscription"
      description="Update subscription plan and validity dates"
      size="sm"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancel</Button>
          <Button onClick={handleSubmit(handleSave)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form className="space-y-4">
        <SelectField
          label="Subscription Plan"
          name="plan"
          control={control}
          options={planOptions}
          placeholder="Select plan…"
          disabled={plansLoading}
          required
        />
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          placeholder="Pick start date"
          required
        />
        <DatePickerField
          label="End / Expiry Date"
          name="end_date"
          control={control}
          placeholder="Pick expiry date"
          required
        />
      </form>
    </AppModal>
  );
}