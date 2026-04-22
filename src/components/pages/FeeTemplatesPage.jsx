// src/components/pages/FeeTemplatesPage.jsx (COMPLETE FIXED)

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, LayoutTemplate, Copy, Power,
  Filter, RefreshCw, Download, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';

// ✅ Reusable Components
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import TableRowActions from '@/components/common/TableRowActions';
import DataTable from '@/components/common/DataTable';
import SelectField from '@/components/common/SelectField'; // ✅ Added
import FeeTemplateForm from '@/components/forms/FeeTemplateForm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { feeTemplateService } from '@/services/feeTemplateService';
import { classService } from '@/services/classService';
import { branchService } from '@/services/branchService';
import { academicYearService } from '@/services/academicYearService';
import { studentService } from '@/services/studentService';

// Constants
const FEE_BASIS_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one_time', label: 'One Time' }
];

export default function FeeTemplatesPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo } = useAuthStore();
  const { currentInstitute, hasBranches, instituteId, instituteType } = useInstituteStore();
  const { terms } = useInstituteConfig();

  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Debug logs
  useEffect(() => {
    console.log('🔍 FeeTemplatesPage Debug:', {
      instituteId: instituteId(),
      instituteType: instituteType(),
      hasBranches: hasBranches(),
      currentInstitute: currentInstitute,
      branchFilter,
      academicYearFilter,
      status,
      page,
      pageSize
    });
  }, [instituteId, instituteType, hasBranches, currentInstitute, branchFilter, academicYearFilter, status, page, pageSize]);

  // Fetch branches - ONLY if hasBranches is true
  const {
    data: branchesData,
    isLoading: branchesLoading,
    refetch: refetchBranches
  } = useQuery({
    queryKey: ['branches', instituteId()],
    queryFn: async () => {
      console.log('📥 Fetching branches for institute:', instituteId());
      const response = await branchService.getOptions({ institute_id: instituteId() });
      console.log('📥 Branches response:', response);
      return response;
    },
    enabled: !!instituteId() && hasBranches(),
  });

  useEffect(() => {
    if (branchesData?.data) {
      console.log('📥 Setting branches:', branchesData.data);
      setBranches(branchesData.data);
    }
  }, [branchesData]);

  // Fetch academic years
  const {
    data: academicYearsData,
    isLoading: academicYearsLoading,
    refetch: refetchAcademicYears
  } = useQuery({
    queryKey: ['academic-years-options', instituteId()],
    queryFn: async () => {
      console.log('📥 Fetching academic years for institute:', instituteId());
      const response = await academicYearService.getOptions(instituteId());
      console.log('📥 Academic years response:', response);
      return response;
    },
    enabled: !!instituteId(),
  });

  useEffect(() => {
    if (academicYearsData?.data) {
      console.log('📥 Setting academic years:', academicYearsData.data);
      setAcademicYears(academicYearsData.data);
    }
  }, [academicYearsData]);

  // Fetch classes
  const {
    data: classesData,
    isLoading: classesLoading,
    refetch: refetchClasses
  } = useQuery({
    queryKey: ['classes-options', instituteId(), academicYearFilter],
    queryFn: async () => {
      console.log('📥 Fetching classes for institute:', instituteId(), 'academicYear:', academicYearFilter);
      const response = await classService.getOptions(
        instituteId(),
        academicYearFilter !== 'all' ? academicYearFilter : undefined
      );
      console.log('📥 Classes response:', response);
      return response;
    },
    enabled: !!instituteId(),
  });

  useEffect(() => {
    if (classesData?.data) {
      console.log('📥 Setting classes:', classesData.data);
      setClasses(classesData.data);
    }
  }, [classesData]);

  // Fetch students for applicability selection
  const {
    data: studentsData,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students-options-fee-template', instituteId()],
    queryFn: async () => {
      const response = await studentService.getAll({
        institute_id: instituteId(),
        is_active: true,
        limit: 1000,
      }, instituteType() || 'school');

      const rows = response?.data?.rows || response?.data || [];
      return rows.map((s) => ({
        value: s.id,
        label: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.registration_no || 'Student',
      }));
    },
    enabled: !!instituteId(),
  });

  useEffect(() => {
    if (studentsData) {
      setStudents(studentsData);
    }
  }, [studentsData]);

  // Fetch fee templates
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['fee-templates', instituteId(), page, pageSize, search, status, branchFilter, academicYearFilter],
    queryFn: async () => {
      console.log('📥 Fetching fee templates with filters:', {
        institute_id: instituteId(),
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        academic_year_id: academicYearFilter !== 'all' ? academicYearFilter : undefined,
        page,
        limit: pageSize,
        search: search || undefined,
        status: status !== 'all' ? status : undefined
      });

      const response = await feeTemplateService.getAll({
        institute_id: instituteId(),
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        academic_year_id: academicYearFilter !== 'all' ? academicYearFilter : undefined,
        page,
        limit: pageSize,
        search: search || undefined,
        status: status !== 'all' ? status : undefined
      });

      console.log('📥 Fee templates response:', response);
      return response;
    },
    enabled: !!instituteId(),
  });

  const templates = data?.data || [];
  const total = data?.pagination?.total || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('📤 Creating fee template:', data);
      return feeTemplateService.create(data);
    },
    onSuccess: () => {
      toast.success('Fee template created successfully');
      queryClient.invalidateQueries({ queryKey: ['fee-templates'] });
      closeModal();
    },
    onError: (error) => {
      console.error('❌ Create error:', error);
      toast.error(error.message || 'Failed to create template');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('📤 Updating fee template:', id, data);
      return feeTemplateService.update(id, data);
    },
    onSuccess: () => {
      toast.success('Fee template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['fee-templates'] });
      closeModal();
    },
    onError: (error) => {
      console.error('❌ Update error:', error);
      toast.error(error.message || 'Failed to update template');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('📤 Deleting fee template:', id);
      return feeTemplateService.delete(id);
    },
    onSuccess: () => {
      toast.success('Fee template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['fee-templates'] });
      setDeletingTemplate(null);
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => {
      console.log('📤 Toggling status:', id, is_active);
      return feeTemplateService.toggleStatus(id, is_active);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? 'Template activated' : 'Template deactivated');
      queryClient.invalidateQueries({ queryKey: ['fee-templates'] });
      setTogglingStatus(null);
    },
    onError: (error) => {
      console.error('❌ Toggle error:', error);
      toast.error(error.message || 'Failed to toggle status');
    }
  });

  // Handlers
  const openAddModal = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const openEditModal = (template) => {
    console.log('📝 Opening edit modal for template:', template);
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const openViewModal = (template) => {
    console.log('👁️ Opening view modal for template:', template);
    setViewingTemplate(template);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
  };

  const closeViewModal = () => {
    setViewingTemplate(null);
    setActiveTab('overview');
  };

  const handleToggleStatus = (template) => {
    setTogglingStatus(template);
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing all data...');
    refetch();
    if (hasBranches()) refetchBranches();
    refetchAcademicYears();
    refetchClasses();
    refetchStudents();
    toast.info('Refreshing data...');
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters');
    setSearch('');
    setStatus('all');
    setBranchFilter('all');
    setAcademicYearFilter('all');
    setPage(1);
  };

  // Sanitize UUIDs (remove 'all' and empty strings)
  const sanitizeUuid = (value) => {
    if (value === undefined || value === null) return undefined;
    const normalized = String(value).trim();
    if (!normalized || normalized.toLowerCase() === 'all') return undefined;
    return normalized;
  };

  const sanitizeUuidArray = (values = []) => {
    if (!Array.isArray(values)) return [];
    return values
      .map((value) => sanitizeUuid(value))
      .filter(Boolean);
  };

  const sanitizeTemplatePayload = (formData) => {
    const payload = {
      ...formData,
      branch_id: sanitizeUuid(formData.branch_id),
      academic_year_id: sanitizeUuid(formData.academic_year_id)
    };

    if (payload.applicable_to) {
      payload.applicable_to = {
        ...payload.applicable_to,
        class_ids: sanitizeUuidArray(payload.applicable_to.class_ids),
        section_ids: sanitizeUuidArray(payload.applicable_to.section_ids),
        student_ids: sanitizeUuidArray(payload.applicable_to.student_ids),
        branch_ids: sanitizeUuidArray(payload.applicable_to.branch_ids)
      };
    }

    return payload;
  };

  const onSubmit = (formData) => {
    const sanitizedPayload = sanitizeTemplatePayload(formData);
    console.log('📤 Submitting sanitized payload:', sanitizedPayload);

    if (editingTemplate?.id) {
      updateMutation.mutate({ id: editingTemplate.id, data: sanitizedPayload });
    } else {
      createMutation.mutate(sanitizedPayload);
    }
  };

  // Stats
  const activeCount = Array.isArray(templates) ? templates.filter(t => t.is_active).length : 0;
  const inactiveCount = Array.isArray(templates) ? templates.filter(t => !t.is_active).length : 0;
  const defaultCount = Array.isArray(templates) ? templates.filter(t => t.is_default).length : 0;

  const columns = useMemo(() => {
    // Start with name column
    const cols = [
      {
        accessorKey: 'name',
        header: 'Template Name',
        cell: ({ row }) => {
          const template = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{template.name}</span>
              {template.is_default && (
                <Badge variant="default" className="bg-blue-500">Default</Badge>
              )}
              {template.code && (
                <Badge variant="outline">{template.code}</Badge>
              )}
            </div>
          );
        }
      }
    ];

    // // ✅ Branch column - ONLY if hasBranches
    // if (hasBranches()) {
    //   cols.push({
    //     accessorKey: 'branch',
    //     header: 'Branch',
    //     cell: ({ row }) => {
    //       const template = row.original;
    //       if (template.branch_id) {
    //         const branch = branches.find(b => b.value === template.branch_id);
    //         return <Badge variant="outline">{branch?.label || 'Branch'}</Badge>;
    //       }
    //       return <Badge variant="secondary">All Branches</Badge>;
    //     }
    //   });
    // }

    // Add remaining columns
    cols.push(
      {
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: ({ row }) => {
          const template = row.original;
          return (
            <div>
              <p className="font-medium">PKR {template.total_amount?.toLocaleString() || 0}</p>
              {template.discount_summary?.final_discount > 0 && (
                <p className="text-xs text-green-600">
                  Discount: PKR {template.discount_summary.final_discount.toLocaleString()}
                </p>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'fee_basis',
        header: 'Basis',
        cell: ({ row }) => {
          const basis = row.original.fee_basis;
          const label = FEE_BASIS_OPTIONS.find(o => o.value === basis)?.label || basis;
          return <Badge variant="outline">{label}</Badge>;
        }
      },
      {
        accessorKey: 'due_day',
        header: 'Due Day',
        cell: ({ row }) => `Day ${row.original.due_day}`
      },
      {
        accessorKey: 'components',
        accessorFn: (row) => {
          const arr = Array.isArray(row.components) ? row.components : [];
          return arr.map(c => c.name).join(', ');
        },
        header: 'Components',
        cell: ({ row }) => {
          const components = row.original.components || [];
          return (
            <div className="flex flex-wrap gap-1">
              {components.slice(0, 3).map((c, i) => (
                <Badge key={i} variant={c.type === 'fee' ? 'default' : 'destructive'} size="sm">
                  {c.name}
                </Badge>
              ))}
              {components.length > 3 && (
                <Badge variant="outline" size="sm">+{components.length - 3}</Badge>
              )}
            </div>
          );
        }
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
          const template = row.original;
          const canUpdate = canDo('fee_templates.update');
          const canDelete = canDo('fee_templates.delete');

          const extraActions = [];

          if (canUpdate) {
            extraActions.push({
              label: 'View Details',
              icon: <Eye className="h-4 w-4" />,
              onClick: () => openViewModal(template)
            });
            extraActions.push({
              label: template.is_active ? 'Deactivate' : 'Activate',
              icon: <Power className="h-4 w-4" />,
              onClick: () => handleToggleStatus(template),
              variant: template.is_active ? 'destructive' : 'default'
            });
          }

          return (
            <TableRowActions
              onEdit={canUpdate ? () => openEditModal(template) : undefined}
              onDelete={canDelete ? () => setDeletingTemplate(template) : undefined}
              extra={extraActions}
            />
          );
        }
      }
    );

    return cols;
  }, [branches, canDo, hasBranches]); // ✅ hasBranches in dependencies

  // Loading state
  if (isLoading && !data) {
    return <PageLoader message="Loading fee templates..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Templates"
        description="Manage fee structures and components"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canDo('fee_templates.create') && (
              <Button onClick={openAddModal} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            )}
          </div>
        }
      />

      <ErrorAlert message={error?.message} onRetry={refetch} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard
          label="Total Templates"
          value={total}
          icon={<LayoutTemplate className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={activeCount}
          icon={<LayoutTemplate className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={inactiveCount}
          icon={<LayoutTemplate className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Default"
          value={defaultCount}
          icon={<LayoutTemplate className="h-4 w-4 text-blue-500" />}
          loading={isLoading}
        />
      </div>

      {/* Filters - ✅ Using SelectField reusable component */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-3">
            {/* Branch Filter - Only show if hasBranches - ✅ Using SelectField */}
            {hasBranches() && (
              <div className="w-64">
                <SelectField
                  label=""
                  name="branch_filter"
                  value={branchFilter}
                  onChange={(val) => {
                    setBranchFilter(val);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Branches' },
                    ...branches.map(b => ({ value: b.value, label: b.label }))
                  ]}
                  placeholder="Select Branch"
                />
              </div>
            )}

            {/* Academic Year Filter - ✅ Using SelectField */}
            <div className="w-64">
              <SelectField
                label=""
                name="academic_year_filter"
                value={academicYearFilter}
                onChange={(val) => {
                  setAcademicYearFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Academic Years' },
                  ...academicYears.map(ay => ({ value: ay.value, label: ay.label }))
                ]}
                placeholder="Select Academic Year"
              />
            </div>

            {/* Status Filter - ✅ Using SelectField */}
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
            {(status !== 'all' || branchFilter !== 'all' || academicYearFilter !== 'all' || search) && (
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
        data={templates}
        loading={isLoading || isFetching}
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search templates..."
        enableColumnVisibility
        exportConfig={{
          fileName: 'fee-templates',
          dateField: 'created_at'
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
        emptyMessage="No fee templates found"
      />

      {/* Create/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={editingTemplate ? 'Edit Fee Template' : 'Create New Fee Template'}
        size="xl"
        className="max-h-[90vh] overflow-hidden"
      >
        <FeeTemplateForm
          defaultValues={editingTemplate}
          onSubmit={onSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          branches={branches}
          classes={classes}
          students={students}
          academicYears={academicYears}
          isEdit={!!editingTemplate}
        />
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={!!viewingTemplate}
        onClose={closeViewModal}
        title="Fee Template Details"
        size="xl"
        className="max-h-[90vh] overflow-hidden"
      >
        {viewingTemplate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{viewingTemplate.name}</h3>
                {viewingTemplate.code && (
                  <p className="text-sm text-muted-foreground">Code: {viewingTemplate.code}</p>
                )}
              </div>
              <StatusBadge status={viewingTemplate.is_active ? 'active' : 'inactive'} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="applicable">Applicable To</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">
                      {viewingTemplate.branch_id
                        ? branches.find(b => b.value === viewingTemplate.branch_id)?.label || 'Unknown'
                        : 'All Branches'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Year</p>
                    <p className="font-medium">
                      {academicYears.find(ay => ay.value === viewingTemplate.academic_year_id)?.label || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee Basis</p>
                    <p className="font-medium capitalize">{viewingTemplate.fee_basis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Day</p>
                    <p className="font-medium">Day {viewingTemplate.due_day}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-lg">PKR {viewingTemplate.total_amount?.toLocaleString()}</p>
                  </div>
                </div>

                {viewingTemplate.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-md">{viewingTemplate.description}</p>
                  </div>
                )}

                {viewingTemplate.late_fine_config?.enabled && (
                  <div>
                    <p className="text-sm font-medium">Late Fine</p>
                    <p className="text-sm">
                      {viewingTemplate.late_fine_config.type === 'fixed'
                        ? `PKR ${viewingTemplate.late_fine_config.amount}`
                        : `${viewingTemplate.late_fine_config.amount}%`}
                      {' after '}{viewingTemplate.late_fine_config.grace_days} days grace
                      {viewingTemplate.late_fine_config.max_fine && (
                        <> (Max: PKR {viewingTemplate.late_fine_config.max_fine})</>
                      )}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="components" className="space-y-4 pt-4 max-h-[400px] overflow-y-auto">
                {viewingTemplate.components?.length > 0 ? (
                  viewingTemplate.components.map((comp, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{comp.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {comp.amount_type === 'fixed'
                                ? `PKR ${comp.amount_value}`
                                : `${comp.amount_value}%`}
                              {comp.is_optional && ' (Optional)'}
                            </p>
                          </div>
                          <Badge variant={comp.type === 'fee' ? 'default' : 'destructive'}>
                            {comp.type === 'fee' ? 'Fee' : 'Discount'}
                          </Badge>
                        </div>
                        {comp.discount_type && comp.discount_value > 0 && (
                          <div className="mt-2 text-sm text-green-600">
                            Discount: {comp.discount_type === 'fixed'
                              ? `PKR ${comp.discount_value}`
                              : `${comp.discount_value}%`}
                          </div>
                        )}
                        {comp.description && (
                          <p className="mt-2 text-xs text-muted-foreground">{comp.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No components added</p>
                )}
              </TabsContent>

              <TabsContent value="applicable" className="space-y-4 pt-4">
                <div>
                  <p className="text-sm font-medium mb-2">Classes</p>
                  {viewingTemplate.applicable_to?.all_classes ? (
                    <Badge>All Classes</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {viewingTemplate.applicable_to?.class_ids?.length > 0 ? (
                        viewingTemplate.applicable_to.class_ids.map(id => {
                          const cls = classes.find(c => c.value === id);
                          return cls ? <Badge key={id} variant="outline">{cls.label}</Badge> : null;
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific classes selected</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Branches</p>
                  {viewingTemplate.applicable_to?.all_branches ? (
                    <Badge>All Branches</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {viewingTemplate.applicable_to?.branch_ids?.length > 0 ? (
                        viewingTemplate.applicable_to.branch_ids.map(id => {
                          const branch = branches.find(b => b.value === id);
                          return branch ? <Badge key={id} variant="outline">{branch.label}</Badge> : null;
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific branches selected</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {new Date(viewingTemplate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm">
                      {new Date(viewingTemplate.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Default Template</p>
                    <p className="text-sm">{viewingTemplate.is_default ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
              {canDo('fee_templates.update') && (
                <Button onClick={() => {
                  closeViewModal();
                  openEditModal(viewingTemplate);
                }}>
                  Edit Template
                </Button>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={() => deleteMutation.mutate(deletingTemplate.id)}
        loading={deleteMutation.isPending}
        title="Delete Fee Template"
        description={
          <>
            Are you sure you want to delete <strong>{deletingTemplate?.name}</strong>?
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
        title={togglingStatus?.is_active ? 'Deactivate Template' : 'Activate Template'}
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