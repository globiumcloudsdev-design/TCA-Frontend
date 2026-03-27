// src/components/pages/BranchesPage.jsx (FIXED)

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, MapPin, Power, Eye, Copy, Filter, RefreshCw } from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';

import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import TableRowActions from '@/components/common/TableRowActions';
import DataTable from '@/components/common/DataTable';
import SelectField from '@/components/common/SelectField';
import BranchForm from '@/components/forms/BranchForm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { branchService } from '@/services/branchService';

// Permission constants
const PERMISSIONS = {
  VIEW: 'branches.read',
  CREATE: 'branches.create',
  UPDATE: 'branches.update',
  DELETE: 'branches.delete'
};

export default function BranchesPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { instituteId, instituteType, hasBranches } = useInstituteStore();

  // Get label based on institute type
  const label = useMemo(() => {
    const types = {
      school: { singular: 'Branch', plural: 'Branches' },
      college: { singular: 'Campus', plural: 'Campuses' },
      university: { singular: 'Campus', plural: 'Campuses' },
      coaching: { singular: 'Center', plural: 'Centers' },
      academy: { singular: 'Center', plural: 'Centers' },
      tuition_center: { singular: 'Center', plural: 'Centers' }
    };
    return types[instituteType()] || { singular: 'Branch', plural: 'Branches' };
  }, [instituteType]);

  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [viewingBranch, setViewingBranch] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check permissions
  const canView = canDo(PERMISSIONS.VIEW);
  const canCreate = canDo(PERMISSIONS.CREATE);
  const canUpdate = canDo(PERMISSIONS.UPDATE);
  const canDelete = canDo(PERMISSIONS.DELETE);

  // Fetch branches
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['branches', instituteId(), page, pageSize, search, status, city],
    queryFn: async () => {
      console.log('📥 Fetching branches:', {
        institute_id: instituteId(),
        page,
        limit: pageSize,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        city: city !== 'all' ? city : undefined
      });

      const response = await branchService.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        city: city !== 'all' ? city : undefined
      });

      console.log('📥 Branches response:', response);
      return response;
    },
    enabled: !!instituteId() && canView,
  });

  // Fetch stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['branch-stats', instituteId()],
    queryFn: () => branchService.getStats(),
    enabled: !!instituteId() && canView,
  });

  // ✅ FIX: Properly extract data from response
  const branches = data?.data?.data || data?.data || [];
  const total = data?.data?.pagination?.total || data?.pagination?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || data?.pagination?.totalPages || 1;

  // ✅ FIX: Stats data extraction
  const stats = statsData?.data || statsData || {};

  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(branches.map(b => b.city).filter(Boolean))];
    return uniqueCities.map(c => ({ value: c, label: c }));
  }, [branches]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('📤 Creating branch:', data);
      return branchService.create(data);
    },
    onSuccess: () => {
      toast.success(`${label.singular} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      closeModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error);
      toast.error(error.message || `Failed to create ${label.singular.toLowerCase()}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('📤 Updating branch:', id, data);
      return branchService.update(id, data);
    },
    onSuccess: () => {
      toast.success(`${label.singular} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      closeModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error);
      toast.error(error.message || `Failed to update ${label.singular.toLowerCase()}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('📤 Deleting branch:', id);
      return branchService.delete(id);
    },
    onSuccess: () => {
      toast.success(`${label.singular} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      setDeletingBranch(null);
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      toast.error(error.message || `Failed to delete ${label.singular.toLowerCase()}`);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => {
      console.log('📤 Toggling status:', id, is_active);
      return branchService.toggleStatus(id, is_active);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? `${label.singular} activated` : `${label.singular} deactivated`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-stats'] });
      setTogglingStatus(null);
    },
    onError: (error) => {
      console.error('❌ Toggle error:', error);
      toast.error(error.message || `Failed to toggle status`);
    }
  });

  // Handlers
  const openAddModal = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const openEditModal = (branch) => {
    console.log('📝 Opening edit modal for branch:', branch);
    setEditingBranch(branch);
    setModalOpen(true);
  };

  const openViewModal = (branch) => {
    console.log('👁️ Opening view modal for branch:', branch);
    setViewingBranch(branch);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBranch(null);
  };

  const closeViewModal = () => {
    setViewingBranch(null);
    setActiveTab('overview');
  };

  const handleToggleStatus = (branch) => {
    setTogglingStatus(branch);
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing data...');
    refetch();
    refetchStats();
    toast.info('Refreshing data...');
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setCity('all');
    setPage(1);
  };

  const onSubmit = (formData) => {
    console.log('📤 Submitting branch:', formData);

    if (editingBranch?.id) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // ✅ FIX: Get head name from head object
  const getHeadName = (branch) => {
    if (branch.head) {
      return `${branch.head.first_name || ''} ${branch.head.last_name || ''}`.trim() || branch.head.email || '—';
    }
    return branch.head_name || '—';
  };

  // Columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: `${label.singular} Name`,
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{branch.name}</span>
            {branch.is_main && (
              <Badge variant="default" className="bg-blue-500">Main</Badge>
            )}
            {branch.code && (
              <Badge variant="outline">{branch.code}</Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city || '—'
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <span className="text-sm line-clamp-2 max-w-[200px]">
          {row.original.address || '—'}
        </span>
      )
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '—'
    },
    {
      id: 'head',
      accessorFn: (row) => {          // ← yeh add karo
        if (!row.head) return '';
        return `${row.head.first_name || ''} ${row.head.last_name || ''}`.trim() || row.head.email || '';
      },
      header: 'Head',
      cell: ({ row }) => getHeadName(row.original)
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const branch = row.original;

        const extraActions = [];

        if (canUpdate) {
          extraActions.push({
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => openViewModal(branch)
          });
          extraActions.push({
            label: branch.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleStatus(branch),
            variant: branch.is_active ? 'destructive' : 'default'
          });
        }

        return (
          <TableRowActions
            onEdit={canUpdate ? () => openEditModal(branch) : undefined}
            onDelete={canDelete ? () => setDeletingBranch(branch) : undefined}
            extra={extraActions}
          />
        );
      }
    }
  ], [canUpdate, canDelete, label]);

  // If user doesn't have view permission
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view {label.plural.toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return <PageLoader message={`Loading ${label.plural.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={label.plural}
        description={`Manage ${label.plural.toLowerCase()}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreate && (
              <Button onClick={openAddModal} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New {label.singular}
              </Button>
            )}
          </div>
        }
      />

      <ErrorAlert message={error?.message} onRetry={refetch} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard
          label={`Total ${label.plural}`}
          value={total}
          icon={<MapPin className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={stats.active || 0}
          icon={<MapPin className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={stats.inactive || 0}
          icon={<MapPin className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Total Students"
          value={stats.total_students || 0}
          icon={<MapPin className="h-4 w-4 text-blue-500" />}
          loading={isLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-3">
            {/* City Filter */}
            {cities.length > 0 && (
              <div className="w-48">
                <SelectField
                  label=""
                  name="city_filter"
                  value={city}
                  onChange={(val) => {
                    setCity(val);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Cities' },
                    ...cities
                  ]}
                  placeholder="Select City"
                />
              </div>
            )}

            {/* Status Filter */}
            <div className="w-48">
              <SelectField
                label=""
                name="status_filter"
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                placeholder="Select Status"
              />
            </div>

            {/* Clear Filters */}
            {(status !== 'all' || city !== 'all' || search) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={branches}
        loading={isLoading || isFetching}
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={`Search ${label.plural.toLowerCase()}...`}
        enableColumnVisibility
        exportConfig={{
          fileName: 'branches',
          dateField: 'created_at'
        }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          }
        }}
        emptyMessage={`No ${label.plural.toLowerCase()} found`}
      />

      {/* Create/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={editingBranch ? `Edit ${label.singular}` : `Create New ${label.singular}`}
        size="xl"
        className="max-h-[90vh] overflow-hidden"
      >
        <BranchForm
          defaultValues={editingBranch}
          onSubmit={onSubmit}
          onCancel={closeModal}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isEdit={!!editingBranch?.id}
        />
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={!!viewingBranch}
        onClose={closeViewModal}
        title={`${label.singular} Details`}
        size="xl"
        className="max-h-[90vh] overflow-hidden"
      >
        {viewingBranch && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{viewingBranch.name}</h3>
                {viewingBranch.code && (
                  <p className="text-sm text-muted-foreground">Code: {viewingBranch.code}</p>
                )}
              </div>
              <StatusBadge status={viewingBranch.is_active ? 'active' : 'inactive'} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" forceMount className={cn(activeTab === 'overview' ? 'block' : 'hidden')}>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{viewingBranch.city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{viewingBranch.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{viewingBranch.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Head</p>
                      <p className="font-medium">
                        {viewingBranch.head ? (
                          <>
                            {viewingBranch.head.first_name} {viewingBranch.head.last_name}
                            <span className="block text-xs text-muted-foreground">
                              {viewingBranch.head.email}
                            </span>
                          </>
                        ) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="font-medium">{viewingBranch.student_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teachers</p>
                      <p className="font-medium">{viewingBranch.teacher_count || 0}</p>
                    </div>
                  </div>

                  {viewingBranch.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-md">{viewingBranch.address}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location" forceMount className={cn(activeTab === 'location' ? 'block' : 'hidden')}>
                <div className="space-y-4 pt-4">
                  {viewingBranch.location?.latitude && viewingBranch.location?.longitude ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinates</p>
                      <p className="font-mono text-sm">
                        {viewingBranch.location.latitude.toFixed(6)}, {viewingBranch.location.longitude.toFixed(6)}
                      </p>
                      {viewingBranch.location.address && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2">Formatted Address</p>
                          <p className="text-sm">{viewingBranch.location.address}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No location data available</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" forceMount className={cn(activeTab === 'settings' ? 'block' : 'hidden')}>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {viewingBranch.settings && Object.entries(viewingBranch.settings)
                      .filter(([key]) => key.startsWith('has_'))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            value ? "bg-green-500" : "bg-gray-300"
                          )} />
                          <span className="text-sm capitalize">
                            {key.replace('has_', '').replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                  </div>

                  {viewingBranch.settings?.working_hours && (
                    <>
                      <Separator />
                      <h4 className="font-medium">Working Hours</h4>
                      <div className="space-y-1">
                        {Object.entries(viewingBranch.settings.working_hours).map(([day, hours]) => (
                          <div key={day} className="grid grid-cols-3 text-sm">
                            <span className="capitalize">{day}</span>
                            {hours?.open && hours?.close ? (
                              <span className="col-span-2">{hours.open} - {hours.close}</span>
                            ) : (
                              <span className="col-span-2 text-muted-foreground">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
              {canUpdate && (
                <Button onClick={() => {
                  closeViewModal();
                  openEditModal(viewingBranch);
                }}>
                  Edit {label.singular}
                </Button>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onConfirm={() => deleteMutation.mutate(deletingBranch.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${label.singular}`}
        description={
          <>
            Are you sure you want to delete <strong>{deletingBranch?.name}</strong>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={!!togglingStatus}
        onClose={() => setTogglingStatus(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: togglingStatus.id,
          is_active: !togglingStatus.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={togglingStatus?.is_active ? `Deactivate ${label.singular}` : `Activate ${label.singular}`}
        description={
          <>
            Are you sure you want to {togglingStatus?.is_active ? 'deactivate' : 'activate'} {' '}
            <strong>{togglingStatus?.name}</strong>?
          </>
        }
        confirmLabel={togglingStatus?.is_active ? 'Deactivate' : 'Activate'}
        variant={togglingStatus?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}