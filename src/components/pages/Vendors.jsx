'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Trash2, RefreshCw, Users, Search, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import CreatableSelectField from '@/components/common/CreatableSelectField';
import { cn } from '@/lib/utils';
import { studentService } from '@/services/studentService';
import { vendorService } from '@/services/vendorService';
import useAuthStore from '@/store/authStore';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const VENDOR_TYPE_OPTIONS = [
  { value: 'books', label: 'Books & Stationery' },
  { value: 'uniform', label: 'Uniforms' },
  { value: 'transport', label: 'Transport' },
  { value: 'canteen', label: 'Canteen' },
  { value: 'it', label: 'IT Services' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  name: '',
  type: '',
  phone: '',
  email: '',
  address: '',
  password: '',
  status: 'active',
};

function normalizeTypeLabel(value) {
  if (!value) return '';
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function studentDisplayName(student) {
  if (!student) return 'Unknown';
  if (student?.name) return student.name;
  const full = `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
  return full || student?.student_name || student?.id || 'Unknown Student';
}

function generateRandomPassword() {
  const digits = '123456';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += digits[Math.floor(Math.random() * digits.length)];
  }
  return password;
}

export default function Vendors() {
  const canDo = useAuthStore((s) => s.canDo);
  const user = useAuthStore((s) => s.user);
  const type = user.institute.institute_type;

  const queryClient = useQueryClient();

  // Filter & pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Selected items
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [assigningVendor, setAssigningVendor] = useState(null);

  // Form states
  const [form, setForm] = useState(EMPTY_FORM);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Fetch Vendors ──────────────────────────────────────────────────────
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    isFetching: vendorsFetching,
    refetch: refetchVendors
  } = useQuery({
    queryKey: ['vendors', page, pageSize, search, statusFilter, vendorTypeFilter],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        type: vendorTypeFilter || undefined,
      };
      try {
        const res = await vendorService.getAll(params);
        console.log('Vendors fetched:', res);
        return {
          rows: res?.data || [],
          pagination: res?.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 0 }
        };
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
        return { rows: [], pagination: { total: 0, page: 1, limit: pageSize, totalPages: 0 } };
      }
    },
    placeholderData: { rows: [], pagination: { total: 0, page: 1, limit: pageSize, totalPages: 0 } },
  });

  const vendors = vendorsData?.rows || [];
  const total = vendorsData?.pagination?.total || 0;
  const totalPages = vendorsData?.pagination?.totalPages || 0;

  // ─── Fetch Students for Assignment Modal ────────────────────────────────
  const {
    data: studentsData = [],
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ['students-for-vendors', type],
    queryFn: async () => {
      try {
        const res = await studentService.getAll({ page: 1, limit: 1000, is_active: true }, type);
        console.log('Students fetched:', res);
        if (Array.isArray(res?.data?.rows)) return res.data.rows;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.rows)) return res.rows;
        if (Array.isArray(res)) return res;
        return [];
      } catch (error) {
        console.error('Failed to fetch students:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create vendor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
      closeFormModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update vendor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
      setDeleteModalOpen(false);
      setDeletingVendor(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete vendor');
    },
  });

  const assignStudentsMutation = useMutation({
    mutationFn: ({ id, studentIds }) => vendorService.assignStudents(id, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Students assigned successfully');
      setAssignModalOpen(false);
      setAssigningVendor(null);
      setSelectedStudentIds([]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to assign students');
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────
  const resetForm = () => setForm(EMPTY_FORM);

  const openAdd = () => {
    setEditingVendor(null);
    resetForm();
    setFormModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.name,
      type: vendor.type,
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      password: '',
      status: vendor.status,
    });
    setShowPassword(false);
    setFormModalOpen(true);
  };

  const openView = (vendor) => {
    setViewingVendor(vendor);
    setViewModalOpen(true);
  };

  const openAssignModal = (vendor) => {
    setAssigningVendor(vendor);
    setSelectedStudentIds(vendor.assigned_student_ids || []);
    setAssignmentSearch('');
    setAssignModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingVendor(null);
    setShowPassword(false);
    resetForm();
  };

  const onSave = (e) => {
    e.preventDefault();

    if (!form.name || !form.type || !form.phone || !form.status) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!editingVendor && !form.password) {
      toast.error('Password is required for new vendors');
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      phone: form.phone.trim(),
      email: form.email?.trim() || '',
      address: form.address?.trim() || '',
      status: form.status,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const onDelete = () => {
    if (deletingVendor) {
      deleteMutation.mutate(deletingVendor.id);
    }
  };

  const saveAssignment = () => {
    if (!assigningVendor) return;
    assignStudentsMutation.mutate({
      id: assigningVendor.id,
      studentIds: selectedStudentIds
    });
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => (
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    ));
  };

  // ─── Memos ──────────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const q = assignmentSearch.trim().toLowerCase();
    return studentsData.filter((student) => {
      if (!q) return true;
      const name = studentDisplayName(student).toLowerCase();
      const regNo = String(student.registration_no || student.roll_no || '').toLowerCase();
      const classSec = `${student.class_name || ''} ${student.section_name || ''}`.toLowerCase();
      return name.includes(q) || regNo.includes(q) || classSec.includes(q);
    });
  }, [studentsData, assignmentSearch]);

  const assignedStudentsList = useMemo(() => {
    if (!viewingVendor?.assigned_student_ids?.length) return [];
    return viewingVendor.assigned_student_ids
      .map(id => studentsData.find(s => s.id === id))
      .filter(Boolean);
  }, [viewingVendor, studentsData]);

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Vendor Name',
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const value = getValue();
        const opt = VENDOR_TYPE_OPTIONS.find(o => o.value === value);
        return opt?.label || normalizeTypeLabel(value);
      }
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue() || '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            value === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          )}>
            {value}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const isTransport = row.original.type === 'transport';
        const assignCount = row.original.assigned_student_ids?.length || 0;

        return (
          <div className="flex items-center justify-end gap-1">
            {canDo('vendors.read') && (
              <button onClick={() => openView(row.original)} className="rounded p-1.5 hover:bg-accent" title="View">
                <Eye size={14} />
              </button>
            )}
            {canDo('vendors.update') && (
              <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit">
                <Pencil size={14} />
              </button>
            )}
            {/* Show "Add Students" button only for Transport vendors */}
            {canDo('vendors.update') && isTransport && (
              <button
                onClick={() => openAssignModal(row.original)}
                className="rounded p-1.5 hover:bg-accent text-blue-600 hover:text-blue-700 relative"
                title={`${assignCount} students assigned`}
              >
                <Users size={14} />
                {assignCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                    {assignCount}
                  </span>
                )}
              </button>
            )}
            {canDo('vendors.delete') && (
              <button
                onClick={() => {
                  setDeletingVendor(row.original);
                  setDeleteModalOpen(true);
                }}
                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      }
    },
  ], [canDo]);

  if (!canDo('vendors.read')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to view vendors.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vendor Management"
        description={`Total ${total} vendors`}
        actions={
          <button
            onClick={() => refetchVendors()}
            disabled={vendorsFetching}
            className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1"
          >
            <RefreshCw size={14} className={vendorsFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={vendors}
        loading={vendorsLoading}
        emptyMessage="No vendors found"
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search vendors..."
        filters={[
          {
            name: 'type',
            label: 'Type',
            value: vendorTypeFilter,
            onChange: (v) => {
              setVendorTypeFilter(v);
              setPage(1);
            },
            options: VENDOR_TYPE_OPTIONS,
          },
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setPage(1);
            },
            options: STATUS_OPTIONS,
          },
        ]}
        action={canDo('vendors.create') ? (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} /> Add Vendor
          </button>
        ) : null}
        enableColumnVisibility
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          pageSize,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />

      {/* Add/Edit Vendor Modal */}
      <AppModal
        open={formModalOpen}
        onClose={closeFormModal}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeFormModal}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="vendor-form"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingVendor ? 'Update' : 'Save')}
            </button>
          </>
        }
      >
        <form id="vendor-form" onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vendor Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-base"
                placeholder="e.g., School Transport Ltd"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vendor Type *</label>
              <CreatableSelectField
                value={form.type}
                onChange={(value) => setForm((p) => ({ ...p, type: value }))}
                options={VENDOR_TYPE_OPTIONS}
                placeholder="Select type"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-base"
                placeholder="0300-1234567"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-base"
                placeholder="vendor@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="input-base min-h-20"
              placeholder="Full address..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password {!editingVendor && '*'}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="input-base pr-10"
                  placeholder={editingVendor ? '(Leave blank to keep current)' : 'e.g., 123456'}
                  required={!editingVendor}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, password: generateRandomPassword() }))}
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent flex items-center gap-1 whitespace-nowrap"
                title="Generate 6-digit password"
              >
                <Zap size={14} />
                Generate
              </button>
            </div>
            <p className="text-xs text-muted-foreground">6 random digits will be generated</p>
          </div>

          <SelectField
            label="Status *"
            name="status"
            value={form.status}
            onChange={(value) => setForm((p) => ({ ...p, status: value }))}
            options={STATUS_OPTIONS}
            required
          />
        </form>
      </AppModal>

      {/* View Vendor Modal */}
      <AppModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingVendor(null);
        }}
        title="Vendor Details"
        size="lg"
        footer={<button className="rounded-md border px-4 py-2 text-sm hover:bg-accent" onClick={() => setViewModalOpen(false)}>Close</button>}
      >
        {viewingVendor && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Vendor Name</p>
                <p className="font-medium">{viewingVendor.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">
                  {VENDOR_TYPE_OPTIONS.find(o => o.value === viewingVendor.type)?.label || normalizeTypeLabel(viewingVendor.type)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{viewingVendor.phone || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{viewingVendor.email || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{viewingVendor.address || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                  viewingVendor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                )}>
                  {viewingVendor.status}
                </span>
              </div>
            </div>

            {/* Show Assigned Students for Transport Vendors */}
            {viewingVendor.type === 'transport' && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Assigned Students</h3>
                  {canDo('vendors.update') && (
                    <button
                      onClick={() => openAssignModal(viewingVendor)}
                      className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent flex items-center gap-1"
                    >
                      <Users size={12} /> Edit
                    </button>
                  )}
                </div>

                <div className="max-h-48 space-y-2 overflow-auto">
                  {assignedStudentsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No students assigned</p>
                  ) : (
                    assignedStudentsList.map((student) => (
                      <div key={student.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <div>
                          <p className="font-medium">{studentDisplayName(student)}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.registration_no || student.roll_no || '—'} • {student.class_name || 'N/A'} {student.section_name || ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AppModal>

      {/* Assign Students Modal (Transport Vendors Only) */}
      <AppModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssigningVendor(null);
          setSelectedStudentIds([]);
          setAssignmentSearch('');
        }}
        title={`Assign Students to ${assigningVendor?.name}`}
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setAssigningVendor(null);
                setSelectedStudentIds([]);
                setAssignmentSearch('');
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              disabled={assignStudentsMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={saveAssignment}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={assignStudentsMutation.isPending}
            >
              {assignStudentsMutation.isPending ? 'Saving...' : 'Save Assignment'}
            </button>
          </>
        }
      >
        {assigningVendor && (
          <div className="space-y-4">
            <div className="rounded-lg bg-accent/30 p-3">
              <p className="text-sm">
                <strong>Vendor:</strong> {assigningVendor.name}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  autoFocus
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  placeholder="Type name, roll no, or class section..."
                  className="input-base pl-9"
                />
                {assignmentSearch && (
                  <button
                    type="button"
                    onClick={() => setAssignmentSearch('')}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 space-y-1 overflow-auto rounded-lg border p-2">
              {studentsLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No students found</p>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors',
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent/50'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={isSelected}
                        onChange={() => toggleStudent(student.id)}
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{studentDisplayName(student)}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.registration_no || student.roll_no || 'No Reg#'} • {student.class_name || 'N/A'} {student.section_name || ''}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
              <span>Selected: <strong>{selectedStudentIds.length}</strong> student{selectedStudentIds.length !== 1 ? 's' : ''}</span>
              {selectedStudentIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-xs text-primary hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Delete Vendor Modal */}
      <AppModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingVendor(null);
        }}
        title="Delete Vendor"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingVendor(null);
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{deletingVendor?.name}</strong>? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
