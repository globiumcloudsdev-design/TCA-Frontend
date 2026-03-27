
// src/components/pages/ClassesPage.jsx (FIXED VERSION WITH FORM HOOK FOR FILTERS)

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form'; // ✅ Import useForm for filters
import {
  Plus,
  BookOpen,
  Eye,
  Copy,
  Power,
  RefreshCw,
  Filter,
  Download,
  Calendar
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useInstituteStore from '@/store/instituteStore';
import useInstituteConfig from '@/hooks/useInstituteConfig';

// Reusable Components
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageLoader from '@/components/common/PageLoader';
import ClassForm from '@/components/forms/ClassForm';
import SectionHeader from '@/components/common/SectionHeader';
import SelectField from '@/components/common/SelectField'; // ✅ Original SelectField
import StatusBadge from '@/components/common/StatusBadge';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { classService } from '@/services/classService';
import { academicYearService } from '@/services/academicYearService';

export default function ClassesPage({ type }) {
  const queryClient = useQueryClient();
  const { canDo, user } = useAuthStore();
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();

  // State Management
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ FORM HOOK FOR FILTERS - using react-hook-form
  const { control: filterControl, watch: filterWatch, setValue: setFilterValue } = useForm({
    defaultValues: {
      academic_year: '',
      status: '',
    }
  });

  // Watch filter values
  const selectedAcademicYear = filterWatch('academic_year');
  const selectedStatus = filterWatch('status');

  // Get terms based on institute type
  const classTerm = terms?.primary_unit || 'Class';
  const classTermPlural = terms?.primary_units || 'Classes';
  const sectionTerm = terms?.secondary_unit || 'Section';
  const courseTerm = terms?.tertiary_unit || 'Course';

  // Debug logging
  useEffect(() => {
    console.log('📋 ClassesPage mounted');
    console.log('🏫 Current Institute:', currentInstitute);
    console.log('👤 User:', user);
  }, []);

  // Fetch academic years for dropdown
  const {
    data: academicYears,
    error: academicYearsError,
    isLoading: academicYearsLoading
  } = useQuery({
    queryKey: ['academic-years-options', currentInstitute?.id],
    queryFn: () => academicYearService.getOptions(currentInstitute?.id, true),
    enabled: !!currentInstitute?.id,
  });

  const normalizedAcademicYearOptions = useMemo(() => {
    return (academicYears?.data || []).map((year) => ({
      ...year,
      value: String(year.value),
      label: year.label,
      badgeStatus: year.is_current ? 'current' : undefined,
      badgeLabel: 'Current',
    }));
  }, [academicYears?.data]);

  const selectedAcademicYearMeta = useMemo(
    () => normalizedAcademicYearOptions.find((year) => String(year.value) === String(selectedAcademicYear)),
    [normalizedAcademicYearOptions, selectedAcademicYear]
  );

  const academicYearFilterValue = selectedAcademicYear && selectedAcademicYear !== 'all'
    ? selectedAcademicYear
    : undefined;
  const statusFilterValue = selectedStatus && selectedStatus !== 'all'
    ? selectedStatus
    : undefined;

  // Fetch classes
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['classes', currentInstitute?.id, page, pageSize, search, selectedStatus, selectedAcademicYear],
    queryFn: async () => {
      console.log('📥 Fetching classes with params:', {
        institute_id: currentInstitute?.id,
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilterValue,
        academic_year_id: academicYearFilterValue,
      });

      const response = await classService.getAll({
        institute_id: currentInstitute?.id,
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilterValue,
        academic_year_id: academicYearFilterValue,
      });

      console.log('📥 Classes response:', response);

      // Debug: Check if academic_year is coming in response
      if (response?.data?.length > 0) {
        console.log('📥 First class academic_year:', response.data[0].academic_year);
      }

      return response;
    },
    enabled: !!currentInstitute?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('➕ Creating class with data:', data);
      return classService.create(data);
    },
    onSuccess: (response) => {
      console.log('✅ Create success:', response);
      toast.success(`${classTerm} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setModalOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      console.error('❌ Create error:', error);
      toast.error(error.message || `Failed to create ${classTerm.toLowerCase()}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('📝 Updating class:', id, 'with data:', data);
      return classService.update(id, data);
    },
    onSuccess: (response) => {
      console.log('✅ Update success:', response);
      toast.success(`${classTerm} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setModalOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      console.error('❌ Update error:', error);
      toast.error(error.message || `Failed to update ${classTerm.toLowerCase()}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('🗑️ Deleting class:', id);
      return classService.delete(id);
    },
    onSuccess: () => {
      toast.success(`${classTerm} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setDeleteDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || `Failed to delete ${classTerm.toLowerCase()}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => {
      console.log('🔄 Toggling status for class:', id, 'to:', isActive);
      return classService.toggleStatus(id, isActive);
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setStatusDialog(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Handle form submit
  const handleSubmit = (formData) => {
    console.log('📤 Form submitted:', formData);
    console.log('📤 Editing class:', editingClass);

    if (editingClass && editingClass.id && !editingClass.isCopy) {
      // Edit mode
      console.log('📝 Updating class with ID:', editingClass.id);
      updateMutation.mutate({
        id: editingClass.id,
        data: formData
      });
    } else {
      // Create mode
      console.log('➕ Creating new class');
      createMutation.mutate(formData);
    }
  };

  // Open add modal
  const openAddModal = () => {
    console.log('➕ Opening add modal');
    setEditingClass(null);
    setModalOpen(true);
  };

  // Normalize API data to form field names
  const normalizeForForm = (classItem) => {
    if (!classItem) return {};

    console.log('🔄 Normalizing class item for form:', classItem);

    return {
      id: classItem.id,
      name: classItem.name || '',
      description: classItem.description || '',
      academic_year_id: classItem.academic_year_id || '',
      active: classItem.is_active ?? classItem.active ?? true,

      // Sections mapping
      sections: (classItem.sections || []).map(s => ({
        id: s.id,
        name: s.name || '',
        room_no: s.room_no || '',
        capacity: s.capacity || 30,
        active: s.is_active ?? s.active ?? true,
      })),

      // Courses mapping
      courses: (classItem.courses || []).map(c => ({
        id: c.id,
        name: c.name || '',
        code: c.code || c.course_code || '',
        description: c.description || '',
        active: c.is_active ?? c.active ?? true,
        materials: (c.materials || []).map(m => ({
          id: m.id,
          name: m.name || '',
          description: m.description || '',
          pdf_url: m.pdf_url || null,
          active: m.is_active ?? m.active ?? true,
        })),
      })),
    };
  };

  // Open edit modal
  const openEditModal = (classItem) => {
    console.log('📝 Opening edit modal for:', classItem);
    const normalized = normalizeForForm(classItem);
    console.log('📝 Normalized form values:', normalized);
    setEditingClass(normalized);
    setModalOpen(true);
  };

  // Open view modal
  const openViewModal = (classItem) => {
    console.log('👁️ Opening view modal for:', classItem);
    setViewingClass(classItem);
    setActiveTab('overview');
  };

  // Close modal
  const closeModal = () => {
    console.log('🚪 Closing modal');
    setModalOpen(false);
    setEditingClass(null);
  };

  // Close view modal
  const closeViewModal = () => {
    console.log('🚪 Closing view modal');
    setViewingClass(null);
    setActiveTab('overview');
  };


  // Handle toggle status
  const handleToggleStatus = (classItem) => {
    console.log('🔄 Toggling status for:', classItem);
    setStatusDialog(classItem);
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('🔄 Refreshing classes...');
    refetch();
    toast.info('Refreshing data...');
  };

  // Handle export
  const handleExport = () => {
    console.log('📥 Exporting classes...');
    // Implement export logic
    toast.info('Export feature coming soon');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterValue('academic_year', '');
    setFilterValue('status', '');
    setSearch('');
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: `${classTerm} Name`,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_current && (
            <Badge variant="default" className="bg-green-500">Current</Badge>
          )}
        </div>
      ),
    },
    // {
    //   accessorKey: 'academic_year',
    //   header: 'Academic Year',
    //   cell: ({ row }) => {
    //     const year = row.original.academic_year;
    //     // Check both possible formats
    //     if (year) {
    //       if (typeof year === 'object') {
    //         return (
    //           <div className="flex items-center gap-2">
    //             <Calendar className="h-4 w-4 text-muted-foreground" />
    //             <span>{year.name || `${year.start_year} - ${year.end_year}`}</span>
    //           </div>
    //         );
    //       } else if (typeof year === 'string') {
    //         return <span>{year}</span>;
    //       }
    //     }

    //     // If academic_year_id is present but no object, try to get from lookup
    //     const yearId = row.original.academic_year_id;
    //     if (yearId && academicYears?.data) {
    //       const foundYear = academicYears.data.find(y => y.value === yearId);
    //       if (foundYear) {
    //         return (
    //           <div className="flex items-center gap-2">
    //             <Calendar className="h-4 w-4 text-muted-foreground" />
    //             <span>{foundYear.label}</span>
    //           </div>
    //         );
    //       }
    //     }

    //     return <span className="text-muted-foreground">—</span>;
    //   },
    // },

    {
      accessorKey: 'academic_year',
      accessorFn: (row) => {                        // ← yeh add karo
        const ay = row.academic_year;
        if (!ay) return '';
        if (typeof ay === 'string') return ay;
        if (typeof ay === 'object') {
          return ay.name ||
            (ay.start_year && ay.end_year ? `${ay.start_year}-${ay.end_year}` : '') ||
            ay.label || '';
        }
        return '';
      },
      header: 'Academic Year',
      cell: ({ row }) => {
        const year = row.original.academic_year;
        // Check both possible formats
        if (year) {
          if (typeof year === 'object') {
            return (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{year.name || `${year.start_year} - ${year.end_year}`}</span>
              </div>
            );
          } else if (typeof year === 'string') {
            return <span>{year}</span>;
          }
        }

        // If academic_year_id is present but no object, try to get from lookup
        const yearId = row.original.academic_year_id;
        if (yearId && academicYears?.data) {
          const foundYear = academicYears.data.find(y => y.value === yearId);
          if (foundYear) {
            return (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{foundYear.label}</span>
              </div>
            );
          }
        }

        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: 'sections',
      header: sectionTerm,
      cell: ({ row }) => {
        const sections = row.original.sections;
        const count = Array.isArray(sections) ? sections.length : (sections || 0);
        return (
          <Badge variant="outline">
            {count} {count === 1 ? sectionTerm.toLowerCase() : `${sectionTerm.toLowerCase()}s`}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'courses',
      header: courseTerm,
      cell: ({ row }) => {
        const courses = row.original.courses;
        const count = Array.isArray(courses) ? courses.length : (courses || 0);
        return (
          <Badge variant="outline">
            {count} {count === 1 ? courseTerm.toLowerCase() : `${courseTerm.toLowerCase()}s`}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active ?? row.original.status === 'active';
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const classItem = row.original;
        const canUpdate = canDo('classes.update');
        const canDelete = canDo('classes.delete');

        const extraActions = [];

        if (canUpdate) {

          extraActions.push({
            label: classItem.is_active ? 'Deactivate' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => handleToggleStatus(classItem),
            variant: classItem.is_active ? 'destructive' : 'default'
          });
        }

        return (
          <TableRowActions
            onView={() => openViewModal(classItem)}
            onEdit={canUpdate ? () => openEditModal(classItem) : undefined}
            onDelete={canDelete ? () => setDeleteDialog(classItem) : undefined}
            extra={extraActions}
          />
        );
      },
    },
  ], [classTerm, sectionTerm, courseTerm, canDo, academicYears?.data]);

  // Stats data
  const stats = useMemo(() => {
    const rows = Array.isArray(data?.data) ? data.data : [];
    return {
      total: data?.pagination?.total || rows.length,
      active: rows.filter(c => c.is_active !== false).length,
      inactive: rows.filter(c => c.is_active === false).length,
      withSections: rows.filter(c => c.sections?.length > 0).length,
      withCourses: rows.filter(c => c.courses?.length > 0).length,
    };
  }, [data]);

  // Loading state
  if (isLoading && !data) {
    return <PageLoader message={`Loading ${classTermPlural.toLowerCase()}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <PageHeader
        title={classTermPlural}
        description={`Manage ${classTermPlural.toLowerCase()} for your institute`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {canDo('classes.create') && (
              <Button onClick={openAddModal} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add {classTerm}
              </Button>
            )}
          </div>
        }
      />

      {/* Error Alerts */}
      {(error || academicYearsError) && (
        <ErrorAlert
          message={error?.message || academicYearsError?.message}
          onRetry={refetch}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        <StatsCard
          label={`Total ${classTermPlural}`}
          value={stats.total}
          icon={<BookOpen className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          label="Active"
          value={stats.active}
          icon={<BookOpen className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <StatsCard
          label="Inactive"
          value={stats.inactive}
          icon={<BookOpen className="h-4 w-4 text-gray-500" />}
          loading={isLoading}
        />
        <StatsCard
          label={`With ${sectionTerm}s`}
          value={stats.withSections}
          icon={<BookOpen className="h-4 w-4 text-blue-500" />}
          loading={isLoading}
        />
        <StatsCard
          label={`With ${courseTerm}s`}
          value={stats.withCourses}
          icon={<BookOpen className="h-4 w-4 text-purple-500" />}
          loading={isLoading}
        />
      </div>

      {/* Filters - Using SelectField with control from filter form */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap items-end gap-3">
            {/* Academic Year Filter - WITH control from filter form */}
            <div className="w-64">
              <SelectField
                label="Academic Year"
                name="academic_year"
                control={filterControl}  // ✅ control prop from filter form
                options={[
                  { value: 'all', label: 'All Academic Years' },
                  ...normalizedAcademicYearOptions
                ]}
                placeholder="Select Academic Year"
              />
              {selectedAcademicYearMeta?.is_current ? (
                <div className="mt-2">
                  <StatusBadge status="current" label="Current Academic Year" />
                </div>
              ) : null}
            </div>

            {/* Status Filter - WITH control from filter form */}
            <div className="w-48">
              <SelectField
                label="Status"
                name="status"
                control={filterControl}  // ✅ control prop from filter form
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="Select Status"
              />
            </div>

            {/* Clear Filters Button */}
            {(selectedAcademicYear || selectedStatus) && (
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
        data={data?.data || []}
        loading={isLoading || isFetching}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={`Search ${classTermPlural.toLowerCase()}...`}
        enableColumnVisibility
        exportConfig={{
          fileName: classTermPlural.toLowerCase().replace(/\s+/g, '-'),
          dateField: 'created_at'
        }}
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: (newPage) => {
            console.log('📄 Changing to page:', newPage);
            setPage(newPage);
          },
          total: data?.pagination?.total || 0,
          pageSize,
          onPageSizeChange: (newSize) => {
            console.log('📄 Changing page size to:', newSize);
            setPageSize(newSize);
            setPage(1);
          },
        }}
        emptyMessage={`No ${classTermPlural.toLowerCase()} found`}
      />

      {/* Add/Edit Modal */}
      <AppModal
        open={modalOpen}
        onClose={closeModal}
        title={editingClass ? (editingClass.isCopy ? `Copy ${classTerm}` : `Edit ${classTerm}`) : `Add ${classTerm}`}
        size="xl"
        description={
          editingClass?.isCopy
            ? `Create a new ${classTerm.toLowerCase()} based on ${editingClass.name}`
            : undefined
        }
      >
        <ClassForm
          key={editingClass?.id || 'new'}
          defaultValues={editingClass || {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={createMutation.isPending || updateMutation.isPending}
          academicYearOptions={normalizedAcademicYearOptions}
          instituteType={type}
          isEdit={!!editingClass && !editingClass.isCopy}
        />
      </AppModal>

      {/* View Modal */}
      <AppModal
        open={!!viewingClass}
        onClose={closeViewModal}
        title={`${classTerm} Details: ${viewingClass?.name}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeViewModal}>
              Close
            </Button>
            {canDo('classes.update') && (
              <Button onClick={() => {
                openEditModal(viewingClass);
                closeViewModal();
              }}>
                Edit {classTerm}
              </Button>
            )}
          </div>
        }
      >
        {viewingClass && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sections">{sectionTerm}s</TabsTrigger>
              <TabsTrigger value="courses">{courseTerm}s</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingClass.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={viewingClass.is_active ? 'success' : 'secondary'}>
                    {viewingClass.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Academic Year Display */}
                <div>
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {viewingClass.academic_year?.name ||
                        viewingClass.academic_year ||
                        '—'}
                    </p>
                  </div>
                </div>

                {viewingClass.code && (
                  <div>
                    <p className="text-sm text-muted-foreground">Code</p>
                    <p className="font-mono text-sm">{viewingClass.code}</p>
                  </div>
                )}

                {viewingClass.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-md">{viewingClass.description}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sections</p>
                  <p className="text-2xl font-bold">{viewingClass.sections?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{viewingClass.courses?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Materials</p>
                  <p className="text-2xl font-bold">
                    {viewingClass.courses?.reduce((acc, c) => acc + (c.materials?.length || 0), 0) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {viewingClass.created_at ? new Date(viewingClass.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4 pt-4">
              {viewingClass.sections && viewingClass.sections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {viewingClass.sections.map((section, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{section.name}</span>
                          <Badge variant={section.is_active ? 'success' : 'secondary'} size="sm">
                            {section.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {(section.room_no || section.capacity) && (
                          <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            {section.room_no && (
                              <div className="flex items-center">
                                <span className="w-20">📍 Room:</span>
                                <span>{section.room_no}</span>
                              </div>
                            )}
                            {section.capacity && (
                              <div className="flex items-center">
                                <span className="w-20">👥 Capacity:</span>
                                <span>{section.capacity}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {section.teacher && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            👨‍🏫 Teacher: {section.teacher.name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No {sectionTerm.toLowerCase()}s found
                </p>
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 pt-4">
              {viewingClass.courses && viewingClass.courses.length > 0 ? (
                <div className="space-y-3">
                  {viewingClass.courses.map((course, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{course.name}</span>
                            {course.code && (
                              <Badge variant="outline" className="ml-2">
                                {course.code}
                              </Badge>
                            )}
                          </div>
                          <Badge variant={course.is_active ? 'success' : 'secondary'} size="sm">
                            {course.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {course.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {course.description}
                          </p>
                        )}

                        {course.teacher && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            👨‍🏫 Teacher: {course.teacher.name}
                          </div>
                        )}

                        {course.materials && course.materials.length > 0 && (
                          <div className="mt-3">
                            <SectionHeader title="Materials" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {course.materials.map((material, midx) => (
                                <div
                                  key={midx}
                                  className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{material.name}</span>
                                  </div>
                                  <Badge variant={material.is_active ? 'success' : 'secondary'} size="sm">
                                    {material.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No {courseTerm.toLowerCase()}s found
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        loading={deleteMutation.isPending}
        title={`Delete ${classTerm}`}
        description={
          <>
            Are you sure you want to delete <strong>{deleteDialog?.name}</strong>?
            This action cannot be undone. All associated sections, courses, and student records will be affected.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={() => toggleStatusMutation.mutate({
          id: statusDialog.id,
          isActive: !statusDialog.is_active
        })}
        loading={toggleStatusMutation.isPending}
        title={statusDialog?.is_active ? `Deactivate ${classTerm}` : `Activate ${classTerm}`}
        description={
          <>
            Are you sure you want to {statusDialog?.is_active ? 'deactivate' : 'activate'} {' '}
            <strong>{statusDialog?.name}</strong>?
          </>
        }
        confirmLabel={statusDialog?.is_active ? 'Deactivate' : 'Activate'}
        variant={statusDialog?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}