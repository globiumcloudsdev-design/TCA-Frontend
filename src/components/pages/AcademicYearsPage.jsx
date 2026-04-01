// ── AcademicYearsPage Component ─────────────────────────────────────────────────
// src/components/pages/AcademicYearsPage.jsx

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  CalendarDays, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Copy,
  Power,
  Star
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { academicYearService } from '@/services/academicYearService';

// Reusable Components
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import AcademicYearForm from '@/components/forms/AcademicYearForm';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AcademicYearsPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();
  
  // Local state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null);
  const [currentDialog, setCurrentDialog] = useState(null);

  // Fetch academic years
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['academic-years', currentInstitute?.id, page, pageSize, search],
    queryFn: () => academicYearService.getAll({
      institute_id: currentInstitute?.id,
      page,
      limit: pageSize,
      search: search || undefined,
      sortBy: 'start_date',
      sortOrder: 'DESC'
    }),
    enabled: !!currentInstitute?.id,
  });

  // Derive current year from main data
  const currentYear = useMemo(() => {
    const found = data?.data?.find(y => y.is_current);
    return found ? { data: found } : null;
  }, [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => academicYearService.create({
      ...data,
      institute_id: currentInstitute?.id
    }),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setModalOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to create ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => academicYearService.update(id, data),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setModalOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => academicYearService.delete(id, currentInstitute?.id),
    onSuccess: () => {
      toast.success(`${terms?.academic_year || 'Academic year'} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setDeleteDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to delete ${terms?.academic_year?.toLowerCase() || 'academic year'}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => academicYearService.toggleActive(id, isActive),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setStatusDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Set current mutation
  const setCurrentMutation = useMutation({
    mutationFn: (id) => academicYearService.setCurrent(id, currentInstitute?.id),
    onSuccess: () => {
      toast.success(`Current ${terms?.academic_year?.toLowerCase() || 'academic year'} updated`);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['current-academic-year'] });
      setCurrentDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to set current ${terms?.academic_year?.toLowerCase() || 'year'}`);
    },
  });

  // Handle form submit
  const handleSubmit = (formData) => {
    if (editingYear && !editingYear.isCopy) {
      updateMutation.mutate({ id: editingYear.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Handle set as current
  const handleSetCurrent = (year) => {
    if (year.is_current) {
      toast.info(`This is already the current ${terms?.academic_year?.toLowerCase() || 'year'}`);
      return;
    }
    setCurrentDialog(year);
  };

  // Handle toggle active
  const handleToggleActive = (year) => {
    setStatusDialog(year);
  };

  // Handle copy year
  const handleCopyYear = (year) => {
    // Create a new year based on existing one
    const startDate = new Date(year.start_date);
    const endDate = new Date(year.end_date);
    
    const newYear = {
      name: `${parseInt(year.name.split('-')[0]) + 1}-${parseInt(year.name.split('-')[1]) + 1}`,
      start_date: new Date(startDate.setFullYear(startDate.getFullYear() + 1)).toISOString().split('T')[0],
      end_date: new Date(endDate.setFullYear(endDate.getFullYear() + 1)).toISOString().split('T')[0],
      description: `Copy of ${year.name}`,
      is_current: false
    };
    
    setEditingYear({ ...newYear, isCopy: true });
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (year) => {
    setEditingYear(year);
    setModalOpen(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingYear(null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingYear(null);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: terms?.academic_year || 'Year',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_current && (
            <Badge variant="default" className="bg-green-500">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Current
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : '—';
      },
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? new Date(date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : '—';
      },
    },
    // {
    //   accessorKey: 'description',
    //   header: 'Description',
    //   cell: ({ getValue }) => getValue() || '—',
    // },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const year = row.original;
        const canUpdate = canDo('academic_years.update');
        const canDelete = canDo('academic_years.delete');
        
        const extraActions = [];
        
        if (canUpdate) {
          if (!year.is_current) {
            extraActions.push({
              label: 'Set as Current',
              icon: <Star className="h-4 w-4" />,
              onClick: () => handleSetCurrent(year)
            });
          }
          
          extraActions.push({
            label: 'Copy Year',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => handleCopyYear(year)
          });
          
          extraActions.push({
            label: year.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleActive(year),
            variant: year.is_active ? 'destructive' : 'default'
          });
        }
        
        return (
          <TableRowActions
            onView={() => openEditModal(year)}
            onEdit={canUpdate ? () => openEditModal(year) : undefined}
            onDelete={canDelete && !year.is_current ? () => setDeleteDialog(year) : undefined}
            extra={extraActions}
          />
        );
      },
    },
  ], [canDo, terms]);

  // Stats data
  const stats = useMemo(() => {
    const rows = data?.data || [];
    return {
      total: data?.pagination?.total || 0,
      current: rows.find(y => y.is_current)?.name || 'Not set',
      active: rows.filter(y => y.is_active).length,
      inactive: rows.filter(y => !y.is_active).length,
    };
  }, [data]);

  // Page title based on type and config
  const pageTitle = terms?.academic_years || 'Academic Years';

  // Check if user has permission
  const canCreate = canDo('academic_years.create');

  // Loading state
  if (isLoading && !data) {
    return <PageLoader message={`Loading ${pageTitle.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title={pageTitle}
        description={`Manage ${pageTitle.toLowerCase()} for your institute`}
        action={
          canCreate && (
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add {terms?.academic_year || 'Year'}
            </Button>
          )
        }
      />

      {/* Error Alert */}
      <ErrorAlert message={error?.message} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={`Total ${pageTitle}`}
          value={stats.total}
          icon={<CalendarDays className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label={`Current ${terms?.academic_year || 'Year'}`}
          value={stats.current}
          icon={<Star className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={stats.inactive}
          icon={<XCircle className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${pageTitle.toLowerCase()}...`}
        enableColumnVisibility
        exportConfig={{
          fileName: pageTitle.toLowerCase().replace(/\s+/g, '-'),
          dateField: 'created_at'
        }}
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          total: data?.pagination?.total || 0,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage={`No ${pageTitle.toLowerCase()} found`}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingYear 
            ? (editingYear.isCopy 
                ? `Copy ${terms?.academic_year || 'Year'}` 
                : `Edit ${terms?.academic_year || 'Year'}`) 
            : `Add ${terms?.academic_year || 'Year'}`
        }
        size="lg"
        description={
          editingYear?.isCopy 
            ? `Create a new ${terms?.academic_year?.toLowerCase() || 'year'} based on ${editingYear.name}`
            : undefined
        }
      >
        <AcademicYearForm
          defaultValues={editingYear || {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          instituteId={currentInstitute?.id}
          isEdit={!!editingYear && !editingYear.isCopy}
        />
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${terms?.academic_year || 'Year'}`}
        description={
          <>
            Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? 
            This action cannot be undone. All associated classes and records will be affected.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: statusDialog.id,
          isActive: !statusDialog.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={statusDialog?.is_active ? 'Deactivate Year' : 'Activate Year'}
        description={
          <div>
            <p>
              Are you sure you want to {statusDialog?.is_active ? 'deactivate' : 'activate'} {' '}
              <strong>{statusDialog?.name}</strong>?
            </p>
            {statusDialog?.is_current && statusDialog?.is_active && (
              <p className="mt-2 text-yellow-600">
                Note: This is the current {terms?.academic_year?.toLowerCase() || 'year'}. 
                Deactivating it may affect ongoing processes.
              </p>
            )}
          </div>
        }
        confirmLabel={statusDialog?.is_active ? 'Deactivate' : 'Activate'}
        variant={statusDialog?.is_active ? 'destructive' : 'default'}
      />

      {/* Set Current Confirmation */}
      <ConfirmDialog
        open={!!currentDialog}
        onClose={() => setCurrentDialog(null)}
        onConfirm={() => setCurrentMutation.mutate(currentDialog.id)}
        loading={setCurrentMutation.isPending}
        title={`Set as Current ${terms?.academic_year || 'Year'}`}
        description={
          <div>
            <p>
              Set <strong>{currentDialog?.name}</strong> as the current {terms?.academic_year?.toLowerCase() || 'year'}?
            </p>
            {currentYear?.data && (
              <p className="mt-2 text-yellow-600">
                This will replace <strong>{currentYear.data.name}</strong> as the current year.
              </p>
            )}
          </div>
        }
        confirmLabel="Set as Current"
        variant="default"
      />
    </div>
  );
}