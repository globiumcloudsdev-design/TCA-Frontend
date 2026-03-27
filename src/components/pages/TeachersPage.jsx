
// src/components/pages/TeachersPage.jsx (COMPLETE FIXED VERSION)

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  GraduationCap,
  Eye,
  Pencil,
  Trash2,
  QrCode,
  Download,
  RefreshCw,
  Filter,
  Mail,
  Phone,
  Power // ✅ For active/deactivate
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';

// Components
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import TeacherForm from '@/components/forms/TeacherForm';
import SelectField from '@/components/common/SelectField';
import StatusBadge from '@/components/common/StatusBadge';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { teacherService } from '@/services/teacherService';

// ✅ Zod schema for filters
const filterSchema = z.object({
  status: z.string().optional(),
});

export default function TeachersPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo, user } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();

  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit' | 'view'
    data: null
  });
  const [deleting, setDeleting] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null); // ✅ For active/deactivate
  const [regeneratingQR, setRegeneratingQR] = useState(null);

  // ✅ FILTER FORM with react-hook-form
  const {
    control: filterControl,
    watch: filterWatch,
    reset: resetFilters
  } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: '',
    }
  });

  // Watch filter values
  const selectedStatus = filterWatch('status');

  // Terms
  const teacherLabel = terms?.teacher || 'Teacher';
  const teachersLabel = terms?.teachers || 'Teachers';

  // Fetch teachers with filters
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['teachers', currentInstitute?.id, page, pageSize, search, selectedStatus],
    queryFn: async () => {
      console.log('📥 Fetching teachers with filters:', {
        institute_id: currentInstitute?.id,
        page,
        limit: pageSize,
        search: search || undefined,
        status: selectedStatus || undefined
      });

      const response = await teacherService.getAll({
        institute_id: currentInstitute?.id,
        page,
        limit: pageSize,
        search: search || undefined,
        status: selectedStatus || undefined
      });

      return response;
    },
    enabled: !!currentInstitute?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => teacherService.create(data),
    onSuccess: (response) => {
      toast.success(`${teacherLabel} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || `Failed to create ${teacherLabel.toLowerCase()}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => teacherService.update(id, data),
    onSuccess: () => {
      toast.success(`${teacherLabel} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${teacherLabel.toLowerCase()}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => teacherService.delete(id),
    onSuccess: () => {
      toast.success('Teacher deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete teacher');
    },
  });

  // ✅ Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => teacherService.toggleStatus(id, is_active),
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? 'Teacher activated' : 'Teacher deactivated');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setTogglingStatus(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle status');
      setTogglingStatus(null);
    },
  });

  // Regenerate QR mutation
  const regenerateQRMutation = useMutation({
    mutationFn: (id) => teacherService.regenerateQR(id),
    onSuccess: (response) => {
      toast.success('QR Code regenerated successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setRegeneratingQR(null);

      // Update viewing teacher if in view mode
      if (modalState.mode === 'view' && modalState.data) {
        setModalState({
          ...modalState,
          data: {
            ...modalState.data,
            qr_code_url: response.data?.qr_code
          }
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to regenerate QR code');
    },
  });

  // Handle form submit
  const handleSubmit = (formData) => {
    console.log('📤 Form submitted:', formData);

    if (modalState.mode === 'edit' && modalState.data) {
      updateMutation.mutate({ id: modalState.data.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setModalState({ isOpen: true, mode: 'add', data: null });
  };

  const openEditModal = (teacher) => {
    console.log('📝 Editing teacher:', teacher);
    setModalState({ isOpen: true, mode: 'edit', data: teacher });
  };

  const openViewModal = (teacher) => {
    console.log('👁️ Viewing teacher:', teacher);
    setModalState({ isOpen: true, mode: 'view', data: teacher });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'add', data: null });
  };

  // Handle regenerate QR
  const handleRegenerateQR = (teacherId) => {
    setRegeneratingQR(teacherId);
    regenerateQRMutation.mutate(teacherId);
  };

  // ✅ Handle toggle status
  const handleToggleStatus = (teacher) => {
    setTogglingStatus(teacher);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    resetFilters();
    setSearch('');
    setPage(1);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      accessorFn: (row) =>                          // ← add karo
        `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      header: 'Name',
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {teacher.first_name?.[0]}{teacher.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-tight">
                {teacher.first_name} {teacher.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {teacher.registration_no || 'No ID'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      accessorFn: (row) =>                          // ← add karo
        [row.email, row.phone].filter(Boolean).join(' | '),
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1">
              <Mail size={11} className="text-muted-foreground" />
              {teacher.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone size={11} className="text-muted-foreground" />
              {teacher.phone}
            </div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: 'department',
    //   header: 'Department',
    //   cell: ({ row }) => row.original.details?.teacherDetails?.department || '—',
    // },
    {
      accessorKey: 'designation',
      accessorFn: (row) =>                          // ← add karo
        row.details?.teacherDetails?.designation || '',
      header: 'Designation',
      cell: ({ row }) => row.original.details?.teacherDetails?.designation || '—',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <StatusBadge status={isActive ? 'active' : 'inactive'} />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const teacher = row.original;
        const canUpdate = canDo('teachers.update');
        const canDelete = canDo('teachers.delete');

        const extraActions = [];

        if (canUpdate) {
          extraActions.push({
            label: 'Regenerate QR Code',
            icon: <QrCode className="h-4 w-4" />,
            onClick: () => handleRegenerateQR(teacher.id)
          });

          // ✅ Add toggle status action
          extraActions.push({
            label: teacher.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleStatus(teacher),
            variant: teacher.is_active ? 'destructive' : 'default'
          });
        }

        return (
          <TableRowActions
            onView={() => openViewModal(teacher)}
            onEdit={canUpdate ? () => openEditModal(teacher) : undefined}
            onDelete={canDelete ? () => setDeleting(teacher) : undefined}
            extra={extraActions}
          />
        );
      },
    },
  ], [canDo]);

  // Stats
  const teachers = data?.data || [];
  const total = data?.pagination?.total || 0;
  const active = teachers.filter(t => t.is_active).length;
  const inactive = teachers.filter(t => !t.is_active).length;

  // Loading
  if (isLoading && !data) {
    return <PageLoader message={`Loading ${teachersLabel.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={teachersLabel}
        description={`Manage ${teachersLabel.toLowerCase()} • ${total} total`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canDo('teachers.create') && (
              <Button onClick={openAddModal} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add {teacherLabel}
              </Button>
            )}
          </div>
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error?.message} onRetry={refetch} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard
          label={`Total ${teachersLabel}`}
          value={total}
          icon={<GraduationCap size={18} />}
        />
        <StatsCard
          label="Active"
          value={active}
          icon={<GraduationCap size={18} className="text-green-500" />}
        />
        <StatsCard
          label="Inactive"
          value={inactive}
          icon={<GraduationCap size={18} className="text-gray-500" />}
        />
        <StatsCard
          label="With QR"
          value={teachers.filter(t => t.qr_code_url).length}
          icon={<QrCode size={18} className="text-blue-500" />}
        />
      </div>

      {/* Filters - WITH CONTROL from filter form */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap items-end gap-3">
            {/* Status Filter - WITH control */}
            <div className="w-48">
              <SelectField
                label="Status"
                name="status"
                control={filterControl}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="Select Status"
              />
            </div>

            {/* Clear Filters Button */}
            {selectedStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="mb-1"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={isLoading || isFetching}
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={`Search ${teachersLabel.toLowerCase()}...`}
        enableColumnVisibility
        exportConfig={{
          fileName: `${type}_teachers_${new Date().toISOString().split('T')[0]}`,
          sheetName: teachersLabel
        }}
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          }
        }}
        emptyMessage={`No ${teachersLabel.toLowerCase()} found`}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={modalState.isOpen && modalState.mode !== 'view'}
        onClose={closeModal}
        title={modalState.mode === 'edit' ? `Edit ${teacherLabel}` : `Add ${teacherLabel}`}
        size="xl"
      >
        <TeacherForm
          key={modalState.data?.id || 'new'}
          defaultValues={modalState.mode === 'edit' ? modalState.data : {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          isEdit={modalState.mode === 'edit'}
        />
      </AppModal>

      {/* View Modal - REMOVED SUBJECTS */}
      <AppModal
        open={modalState.isOpen && modalState.mode === 'view'}
        onClose={closeModal}
        title={`${teacherLabel} Details`}
        size="xl"
      >
        {modalState.data && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                    {modalState.data.first_name?.[0]}{modalState.data.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {modalState.data.first_name} {modalState.data.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {modalState.data.details?.teacherDetails?.designation || 'Teacher'} • {modalState.data.details?.teacherDetails?.department || 'No Department'}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <StatusBadge status={modalState.data.is_active ? 'active' : 'inactive'} />
                    <Badge variant="outline">
                      ID: {modalState.data.registration_no || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {modalState.data.qr_code_url && (
                <div className="text-center">
                  <img
                    src={modalState.data.qr_code_url}
                    alt="QR Code"
                    className="w-24 h-24 border rounded-lg p-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1"
                    onClick={() => window.open(modalState.data.qr_code_url, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardContent className="p-4">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Full Name</dt>
                        <dd className="font-medium">
                          {modalState.data.first_name} {modalState.data.last_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Gender</dt>
                        <dd className="font-medium capitalize">
                          {modalState.data.details?.teacherDetails?.gender || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Email</dt>
                        <dd className="font-medium">{modalState.data.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Phone</dt>
                        <dd className="font-medium">{modalState.data.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">CNIC</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.cnic || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.date_of_birth
                            ? new Date(modalState.data.details.teacherDetails.date_of_birth).toLocaleDateString()
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Blood Group</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.blood_group || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Religion</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.religion || '—'}
                        </dd>
                      </div>
                    </dl>

                    <Separator className="my-4" />

                    <h4 className="text-sm font-semibold mb-2">Address</h4>
                    <p className="text-sm">
                      {modalState.data.details?.teacherDetails?.present_address || 'No address provided'}
                    </p>

                    {modalState.data.details?.teacherDetails?.emergency_contact_name && (
                      <>
                        <Separator className="my-4" />
                        <h4 className="text-sm font-semibold mb-2">Emergency Contact</h4>
                        <dl className="grid grid-cols-2 gap-2">
                          <div>
                            <dt className="text-xs text-muted-foreground">Name</dt>
                            <dd className="text-sm">
                              {modalState.data.details.teacherDetails.emergency_contact_name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Relation</dt>
                            <dd className="text-sm">
                              {modalState.data.details.teacherDetails.emergency_contact_relation}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Phone</dt>
                            <dd className="text-sm">
                              {modalState.data.details.teacherDetails.emergency_contact_phone}
                            </dd>
                          </div>
                        </dl>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional">
                <Card>
                  <CardContent className="p-4">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Qualification</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.qualification || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Specialization</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.specialization || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Experience</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.experience_years
                            ? `${modalState.data.details.teacherDetails.experience_years} years`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Previous Institution</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.previous_institution || '—'}
                        </dd>
                      </div>
                    </dl>

                    {/* ✅ REMOVED SUBJECTS SECTION */}

                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employment">
                <Card>
                  <CardContent className="p-4">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Designation</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.designation || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Department</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.department || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Employment Type</dt>
                        <dd className="font-medium capitalize">
                          {modalState.data.details?.teacherDetails?.employment_type || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Joining Date</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.joining_date
                            ? new Date(modalState.data.details.teacherDetails.joining_date).toLocaleDateString()
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Salary</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.salary
                            ? `PKR ${Number(modalState.data.details.teacherDetails.salary).toLocaleString()}`
                            : '—'}
                        </dd>
                      </div>
                    </dl>

                    <Separator className="my-4" />

                    <h4 className="text-sm font-semibold mb-2">Bank Details</h4>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Bank Name</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.bank_name || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Account No</dt>
                        <dd className="font-medium">
                          {modalState.data.details?.teacherDetails?.bank_account_no || '—'}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-4">
                    {modalState.data.documents?.length > 0 ? (
                      <div className="space-y-3">
                        {modalState.data.documents.map((doc, idx) => (
                          <div key={doc.id || idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {doc.type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.verified && (
                                <StatusBadge status="verified" label="Verified" />
                              )}
                              {doc.file_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No documents uploaded
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              {canDo('teachers.update') && (
                <Button onClick={() => {
                  closeModal();
                  openEditModal(modalState.data);
                }}>
                  Edit {teacherLabel}
                </Button>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${teacherLabel}`}
        description={
          <>
            Are you sure you want to delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ✅ Status Toggle Confirmation */}
      <ConfirmDialog
        open={!!togglingStatus}
        onClose={() => setTogglingStatus(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: togglingStatus.id,
          is_active: !togglingStatus.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={togglingStatus?.is_active ? `Deactivate ${teacherLabel}` : `Activate ${teacherLabel}`}
        description={
          <>
            Are you sure you want to {togglingStatus?.is_active ? 'deactivate' : 'activate'} {' '}
            <strong>{togglingStatus?.first_name} {togglingStatus?.last_name}</strong>?
          </>
        }
        confirmLabel={togglingStatus?.is_active ? 'Deactivate' : 'Activate'}
        variant={togglingStatus?.is_active ? 'destructive' : 'default'}
      />

      {/* QR Regeneration Confirmation */}
      <ConfirmDialog
        open={!!regeneratingQR}
        onClose={() => setRegeneratingQR(null)}
        onConfirm={() => regenerateQRMutation.mutate(regeneratingQR)}
        loading={regenerateQRMutation.isPending}
        title="Regenerate QR Code"
        description="Are you sure you want to regenerate the QR code? The old QR code will stop working."
        confirmLabel="Regenerate"
      />
    </div>
  );
}